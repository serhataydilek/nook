export interface LinkMeta {
  title?: string;
  description?: string;
}

/**
 * Best-effort link metadata (title/description) via a public metadata API.
 * Never blocks saving: on any failure or timeout the caller falls back to
 * the domain as the title.
 */
export async function fetchLinkMetadata(url: string): Promise<LinkMeta | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      status?: string;
      data?: { title?: string; description?: string };
    };
    if (json.status === "success" && json.data) {
      return { title: json.data.title, description: json.data.description };
    }
    return null;
  } catch {
    return null;
  }
}
