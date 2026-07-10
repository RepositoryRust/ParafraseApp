export async function fetchProviders(
  url: string,
  apikey: string,
) {
  const response = await fetch(
    `${import.meta.env.VITE_DEHUI_API}/api/providers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, apikey }),
    },
  );

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.message ?? "Unknown error");
  }

  return response.json();
}

export async function* fetchChatCompletions(
  id: string,
  apikey: string,
  reasoning_effort: string,
  messages: { role: string; content: string }[],
) {
  const response = await fetch(
    `${import.meta.env.VITE_DEHUI_API}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, apikey, reasoning_effort, messages }),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const data = trimmed.slice(6); // after "data: "
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // skip malformed SSE data
      }
    }
  }
}
