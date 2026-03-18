// src/01-infrastructure/http/FetchClient.ts
export class FetchClient {
  static async get(url: string, headers: Record<string, string> = {}) {
    return this.request(url, { method: 'GET', headers })
  }

  static async post(url: string, body: any, headers: Record<string, string> = {}) {
    return this.request(url, { method: 'POST', headers, body: JSON.stringify(body) })
  }

  static async request(
    url: string,
    opts: { method?: string; headers?: Record<string, string>; body?: any } = {}
  ) {
    const _fetch: any = (globalThis as any).fetch
    if (!_fetch) throw new Error('Global fetch not available. Use Node 18+ or polyfill fetch.')

    const method = (opts.method ?? 'GET').toUpperCase()
    const rawHeaders = opts.headers ?? {}

    // Normalize headers: no undefined keys
    const headers: Record<string, string> = {}
    Object.entries(rawHeaders).forEach(([k, v]) => {
      if (v != null) headers[k] = v
    })

    const fetchOpts: any = { method, headers }

    // Only attach body & Content-Type if method supports it
    if (opts.body != null && !['GET', 'HEAD'].includes(method)) {
      fetchOpts.body = opts.body
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
    }

    const response = await _fetch(url, fetchOpts)
    const text = await response.text()
    const contentType = response.headers?.get?.('content-type') ?? ''
    let data: any = text

    if (contentType.includes('application/json')) {
      try { data = JSON.parse(text) } catch { }
    }

    if (!response.ok) {
      const err: any = new Error(`HTTP ${response.status}: ${response.statusText}`)
      err.status = response.status
      err.data = data
      throw err
    }

    return data
  }
}

export default FetchClient
