import { execFileSync } from "node:child_process";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const PROXY_ENV = ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy"] as const;

let cachedAt = 0;
let cachedSystemProxy: string | undefined;

/**
 * Windows keeps its proxy in the registry, where Node's fetch never looks.
 * Reading it makes a proxied feed work the same way the browser does; the
 * usual *_PROXY environment variables take precedence when set.
 */
function systemProxy(): string | undefined {
  if (process.platform !== "win32") return undefined;
  if (Date.now() - cachedAt < 60_000) return cachedSystemProxy;
  cachedAt = Date.now();
  cachedSystemProxy = undefined;
  try {
    const output = execFileSync(
      "reg",
      ["query", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"],
      { encoding: "utf8", timeout: 3_000 }
    );
    // ProxyEnable is deliberately ignored: a local proxy client keeps its port
    // open while the Windows toggle is off (Clash flips that flag on mode
    // changes), and a stopped proxy falls back to a direct request anyway.
    const server = /ProxyServer\s+REG_SZ\s+([^\r\n]+)/i.exec(output)?.[1]?.trim();
    if (!server) return cachedSystemProxy;
    const hostPort =
      /https=([^;]+)/i.exec(server)?.[1] ??
      /http=([^;]+)/i.exec(server)?.[1] ??
      (server.includes("=") ? undefined : server);
    if (hostPort) cachedSystemProxy = `http://${hostPort}`;
  } catch {
    // reg can be unavailable on locked-down machines; fall back to direct.
  }
  return cachedSystemProxy;
}

function proxyUrl(): string | undefined {
  for (const key of PROXY_ENV) {
    const value = process.env[key];
    if (value) return value;
  }
  const detected = systemProxy();
  return detected;
}

const agents = new Map<string, ProxyAgent>();

function proxyAgent(url: string): ProxyAgent {
  let agent = agents.get(url);
  if (!agent) {
    agent = new ProxyAgent(url);
    agents.set(url, agent);
  }
  return agent;
}

/**
 * fetch() that can use the machine's proxy. A proxy that has been switched off
 * must not take directly reachable feeds down with it, so a failed proxied
 * attempt falls back to a direct one while the caller's timeout is still live.
 */
export async function sourceFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const proxy = proxyUrl();
  if (proxy) {
    try {
      return (await undiciFetch(input, {
        ...init,
        dispatcher: proxyAgent(proxy),
      } as Parameters<typeof undiciFetch>[1])) as unknown as Response;
    } catch (error) {
      if (init.signal?.aborted) throw error;
    }
  }
  return fetch(input, init);
}
