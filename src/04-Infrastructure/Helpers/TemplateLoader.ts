// ==================================================================
// 📩 src/04-Infrastructure/Helpers/TemplateLoader.ts
// ==================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createLogger } from "@Infrastructure/Core/Logger.ts";

const logger = createLogger("TemplateLoader");
// Recreate __dirname in ESM
const templateLoaderFilename = fileURLToPath(import.meta.url);
// const templateLoaderFilename = __filename;
const templateLoaderDirname = path.dirname(templateLoaderFilename);

export class TemplateLoader {
  static loadTemplate(templateFile: string): string | null {
    // Directory path for templates
    const templateDir = path.resolve(templateLoaderDirname, "../Email/Templates");

    // Build the full path of the template
    const templateFull = path.join(templateDir, templateFile);

    // Check if the file exists
    if (fs.existsSync(templateFull)) {
      try {
        // Read and return the file content
        return fs.readFileSync(templateFull, "utf-8");
      } catch (err: any) {
        logger.error(`❌ Error reading the template ${templateFile}: ${err.message}`);
        return null;
      }
    } else {
      logger.error(`❌ Template file not found: ${templateFull}`);
      return null;
    }
  }
}
