/**
 * Database seed: writes the bundled demo dataset into PostgreSQL.
 *
 *   npx prisma db push
 *   npm run db:seed
 *
 * Uses only relative imports so it runs under `tsx` without the Next.js
 * path aliases.
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { events } from "../data/seed/events";
import { RESEARCH_AREAS } from "../types";
import { applyTrustModel } from "../lib/verification";

const prisma = new PrismaClient();

function toUtcDate(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00.000Z`);
}

async function main() {
  console.log(`Seeding ${events.length} research events...`);

  const areas = new Map<string, string>();
  for (const name of RESEARCH_AREAS) {
    const slug = name
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const area = await prisma.researchArea.upsert({
      where: { name },
      update: { slug },
      create: { name, slug },
    });
    areas.set(name, area.id);
  }

  // Full reload keeps idempotent re-seeding simple for the MVP.
  await prisma.researchEvent.deleteMany();

  for (const source of events) {
    const e = applyTrustModel(source);
    const institutionId = e.institution
      ? (
          await prisma.institution.upsert({
            where: { name: e.institution },
            update: {},
            create: { name: e.institution },
          })
        ).id
      : null;

    const paperIds: string[] = [];
    for (const p of e.papers ?? []) {
      const paper = await prisma.paper.upsert({
        where: { id: `demo-paper-${Buffer.from(p.title).toString("hex").slice(0, 40)}` },
        update: { url: p.url, venue: p.venue, year: p.year },
        create: {
          title: p.title,
          url: p.url,
          venue: p.venue,
          year: p.year,
        },
      });
      paperIds.push(paper.id);
    }

    const authorIds: string[] = [];
    for (const name of e.authors) {
      const author = await prisma.author.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      authorIds.push(author.id);
    }

    const event = await prisma.researchEvent.create({
      data: {
        title: e.title,
        slug: e.slug,
        summary: e.summary,
        significance: e.significance,
        date: toUtcDate(e.date),
        // Ecosystem events carry an event class, not a research direction.
        researchAreaId: e.researchArea ? (areas.get(e.researchArea) ?? null) : null,
        subArea: e.subArea,
        sourceType: e.sourceType,
        sourceUrl: e.sourceUrl,
        paperUrl: e.paperUrl,
        githubUrl: e.githubUrl,
        problem: e.problem,
        keyContributions: e.keyContributions ?? [],
        institutionId,
        modelNames: e.model ?? [],
        benchmarkNames: e.benchmark ?? [],
        datasetNames: e.dataset ?? [],
        isDemo: e.isDemo ?? false,
        /* trust model */
        evidenceLevel: e.evidenceLevel ?? "E2",
        sourceTier: e.sourceTier ?? "S0",
        eventType: e.eventType ?? "Research",
        researchEventType: e.researchEventType,
        metadata:
          e.metadata === undefined
            ? Prisma.DbNull
            : (e.metadata as unknown as Prisma.InputJsonValue),
        provenance: e.provenance ?? "curated",
        verificationRecords: {
          create: (e.verificationHistory ?? []).map((r) => ({
            date: toUtcDate(r.date),
            evidenceLevel: r.evidenceLevel,
            note: r.note,
          })),
        },
        eventPapers: { create: paperIds.map((paperId) => ({ paperId })) },
        eventAuthors: { create: authorIds.map((authorId) => ({ authorId })) },
        relatedWorks: {
          create: e.relatedWorks.map((w) => ({
            title: w.title,
            url: w.url,
            relation: w.relation,
            note: w.note,
          })),
        },
      },
      select: { id: true },
    });

    // Models / benchmarks / datasets are normalized entities as well.
    await connectNamed(event.id, "model", e.model ?? []);
    await connectNamed(event.id, "benchmark", e.benchmark ?? []);
    await connectNamed(event.id, "dataset", e.dataset ?? []);
  }

  console.log("Seed complete.");
}

async function connectNamed(
  eventId: string,
  kind: "model" | "benchmark" | "dataset",
  names: string[]
) {
  for (const name of names) {
    if (!name) continue;
    if (kind === "model") {
      const m = await prisma.model.upsert({ where: { name }, update: {}, create: { name } });
      await prisma.researchEvent.update({
        where: { id: eventId },
        data: { models: { connect: { id: m.id } } },
      });
    } else if (kind === "benchmark") {
      const b = await prisma.benchmark.upsert({ where: { name }, update: {}, create: { name } });
      await prisma.researchEvent.update({
        where: { id: eventId },
        data: { benchmarks: { connect: { id: b.id } } },
      });
    } else {
      const d = await prisma.dataset.upsert({ where: { name }, update: {}, create: { name } });
      await prisma.researchEvent.update({
        where: { id: eventId },
        data: { datasets: { connect: { id: d.id } } },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
