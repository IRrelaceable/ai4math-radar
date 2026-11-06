import { writeStaticData } from "@/lib/buildDataset";

/** `npm run data` — regenerate public/data for both languages (also runs before dev/build). */
writeStaticData()
  .then((rows) => {
    for (const row of rows) {
      console.log(`[data] ${row.lang}: ${row.events} events, ${row.topics} topics, ${row.kb} KB`);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
