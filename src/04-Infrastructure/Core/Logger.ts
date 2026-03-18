// ==================================================================
// 📜 src/04-Infrastructure/Core/logger.ts
// ==================================================================

import { Logger,ILogObj } from "tslog"
export type AppLogger = Logger<ILogObj>;
export type LoggerFactory = (name: string) => AppLogger;
export const logger:AppLogger = new Logger<ILogObj>({
  name: "API",
  type: "pretty",
  minLevel: 3,                  // can use number or string
  stylePrettyLogs: true,
  prettyLogTimeZone: "local",
  prettyLogTemplate:
    "{{mm}}-{{dd}}-{{yyyy}} {{hh}}:{{MM}}:{{ss}}.{{ms}} {{logLevelName}} [{{filePathWithLine}}] ",
  prettyErrorTemplate:
    "{{errorName}}: {{errorMessage}}\n{{errorStack}}",
  prettyErrorStackTemplate:
    "at {{fileNameWithLine}} {{method}}",
})

export function createLogger(name: string):AppLogger {
  return logger.getSubLogger({ name });
}
