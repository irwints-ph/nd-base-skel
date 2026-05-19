// tests/utils/httpClient.ts
export interface HttpResponse<T = any> {
  status: number;
  body: T | null;
}

export class FetchClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T = any>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    token?: string,
    body?: any
  ): Promise<HttpResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    try{
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json().catch(() => null);
      return { status: response.status, body: data };
    }
    catch (err:any) {
      return err;
      // console.log(err);
    }
  }

  get(path: string, token?: string) {
    return this.request("GET", path, token);
  }

  post(path: string, token?: string, body?: any) {
    return this.request("POST", path, token, body);
  }

  put(path: string, token?: string, body?: any) {
    return this.request("PUT", path, token, body);
  }

  delete(path: string, token?: string) {
    return this.request("DELETE", path, token);
  }
}
