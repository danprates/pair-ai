import type { ArtificialInteligence } from "../domain/types";

type GeminiResponse = {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
};

export class Gemini implements ArtificialInteligence {
  private readonly url: string;
  constructor(private readonly apiKey: string, private readonly model: string) {
    this.url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }

  async ask(prompt: string): Promise<string> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data: GeminiResponse = await response.json();
    if (data.error) {
      throw new Error(`Gemini API returned ${data.error.message}`);
    }
    return (
      data.candidates?.[0]?.content.parts
        ?.map((p) => p.text)
        .join("")
        ?.trim() || ""
    );
  }
}
