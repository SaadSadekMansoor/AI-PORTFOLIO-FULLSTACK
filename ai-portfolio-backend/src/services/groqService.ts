import fetch from "node-fetch";

type GroqChatCompletionResponse = {
  choices?: {
    message?: {
      role: string;
      content: string;
    };
  }[];
};

export async function generateWebsiteFromPrompt(
  prompt: string,
  _options: Record<string, any> = {}
): Promise<string> {
  const url =
    process.env.GROQ_API_URL ||
    "https://api.groq.com/openai/v1/chat/completions";
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) throw new Error("Missing GROQ_API_KEY in environment variables.");

const body = {
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content:
        "You are an AI that generates full HTML, CSS, and optional JS for portfolio websites. Return only the code.",
    },
    { role: "user", content: prompt },
  ],
  max_tokens: 2000,
  temperature: 0.7,
};

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const json = (await response.json()) as GroqChatCompletionResponse;

  return json.choices?.[0]?.message?.content || "";
}
