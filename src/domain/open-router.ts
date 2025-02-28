import type { Ask } from "./types";

export class OpenRouter implements Ask {
  private readonly url: string;
  constructor(private readonly apiKey: string, private readonly model: string) {
    this.url = "https://openrouter.ai/api/v1/chat/completions";
  }
  async ask(prompt: string): Promise<string> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
}
