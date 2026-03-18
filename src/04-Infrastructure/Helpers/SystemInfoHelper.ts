import os from "os"
import process from "process"
import child_process from "child_process"
import fs from "fs"

export function getSystemInfoBase() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptimeSeconds: process.uptime(),
    nodeVersion: process.version,
  }
}

export function getSystemInfo() {
  // Mirror the Python helper: return compiler and osDetails
  const osName = os.type() // e.g. 'Linux', 'Windows_NT', 'Darwin'
  const osVersion = os.version ? os.version() : os.release()
  let osFlavor = ""
  const osRelease = os.release()

  let osFullDetails = `${osName} ${osVersion}`

  if (osName === "Linux") {
    try {
      // Try lsb_release -d first
      const out = child_process.execSync("lsb_release -d", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      // expect output like: "Description:\tUbuntu 20.04.6 LTS\n"
      const parts = out.split(":")
      if (parts.length >= 2) {
        osFlavor = parts.slice(1).join(":").trim()
      }
    } catch (e) {
      // fallback to /etc/os-release if present
      try {
        const raw = fs.readFileSync("/etc/os-release", { encoding: "utf8" })
        const lines = raw.split(/\r?\n/)
        for (const line of lines) {
          if (line.startsWith("PRETTY_NAME=")) {
            osFlavor = line.split("=")[1].replace(/\"/g, "").trim()
            break
          }
          if (line.startsWith("NAME=")) {
            osFlavor = line.split("=")[1].replace(/\"/g, "").trim()
            break
          }
        }
      } catch (e2) {
        osFlavor = `Error retrieving flavor: ${String(e2)}`
      }
    }
  }

  if (osFlavor) {
    osFullDetails += ` ${osFlavor} ${osRelease}`
  }

  return {
    compiler: `Node ${process.version}`,
    osDetails: osFullDetails,

    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptimeSeconds: process.uptime(),
    nodeVersion: process.version,

  }
}
