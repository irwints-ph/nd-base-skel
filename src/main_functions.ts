import os from "os";
export function getLocalNetworkIPs(): string[] {
  const nets = os.networkInterfaces();
  const results: string[] = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // Only IPv4 and not internal (skip 127.0.0.1)
      if (net.family === "IPv4" && !net.internal) {
        results.push(net.address);
      }
    }
  }

  return results;
}

export function getPortArg(argv: string[]): number | undefined {
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]

    if (a === "--port" || a === "-p") {
      const val = argv[i + 1]
      if (val) return Number(val)
    }
  }

  return undefined
}

