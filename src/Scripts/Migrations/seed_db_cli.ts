import { fileURLToPath } from "url";
import path from "path";
import { parseArgs, printHelp, isEmptyArgs } from "./parameter_parser.ts";
import { seedDatabase } from "./seed_db.ts"; // if split, otherwise skip

// Detect if this file is run directly
const isCLI =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCLI) {
  (async () => {
    const args = parseArgs(process.argv);

    if (args.help || isEmptyArgs(args)) {
      printHelp();
      return;
    }

    try {
      await seedDatabase(args);
    } catch (err) {
      console.error("❌ Unhandled error:", err);
      process.exit(1);
    }
  })();
}