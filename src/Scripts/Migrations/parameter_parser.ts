// src/scripts/migrations/parameter_parser.ts
import path from "path"

export type SeedArgs = {
  createDb: boolean
  dropDbOnly: boolean
  reset: boolean
  dataDir: string
  noSeed: boolean
  cs?: string
  help?: boolean
}

const DEFAULT_DATA_DIR = "src/Scripts/DataSeed"

export function printHelp() {
  const prgPath = "npx tsx src/Scripts/Migrations/seed_db.ts";
  console.log(`
📦 Database Seeder CLI

Usage:
  ${prgPath} [options]

Options:
  --create-db, -c        Create database (drops existing tables)
  --reset, -r            Drop + recreate database (⚠ destructive)
  --drop-db-only, -d     Drop all tables only
  --data-dir, -D <path>  Path to seed data directory
  --no-seed, -n          Skip seeding
  --cs <suffix>          CSV suffix (e.g. _dev, _prod)
  --help, -h             Show this help message

Examples:
  ${prgPath} -r
  ${prgPath} -c --cs _dev
  ${prgPath} --create-db --data-dir ./custom-data
`)
}

export function parseArgs(argv: string[]): SeedArgs {
  const args: SeedArgs = {
    createDb: false,
    dropDbOnly: false,
    reset: false,
    dataDir: DEFAULT_DATA_DIR,
    noSeed: false,
  }

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]

    switch (a) {
      case "--create-db":
      case "-c":
        args.createDb = true
        break

      case "--drop-db-only":
      case "-d":
        args.dropDbOnly = true
        break

      case "--reset":
      case "-r":
        args.reset = true
        break

      case "--data-dir":
      case "-D":
        if (i + 1 < argv.length) args.dataDir = path.resolve(argv[++i])
        break

      case "--no-seed":
      case "-ns":
        args.noSeed = true
        break
      case "-co":
        args.createDb = true
        args.reset = false;
        args.noSeed = false;
        break;

      case "--cs":
        if (i + 1 < argv.length) args.cs = argv[++i]
        break

      case "--help":
      case "-h":
        args.help = true
        break
      // default:
      //   args.help = true
      //   break

    }
  }

  return args
}

export function isEmptyArgs(args: SeedArgs): boolean {
  return !(
    args.createDb ||
    args.dropDbOnly ||
    args.reset ||
    args.noSeed ||
    args.cs ||
    args.help ||
    args.dataDir !== "src/Scripts/DataSeed"
  )
}