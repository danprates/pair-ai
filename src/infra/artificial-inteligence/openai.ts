import type { ArtificialInteligence } from "../../domain/types";

type OpenAIResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
    type?: string;
    code?: number;
  };
};

export class OpenAI implements ArtificialInteligence {
  private readonly url: string;
  constructor(private readonly apiKey: string, private readonly model: string) {
    this.url = "https://api.openai.com/v1/chat/completions";
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
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    const data: OpenAIResponse = await response.json();
    if (data.error) {
      throw new Error(`OpenAI API returned ${data.error.message}`);
    }
    return data.choices[0].message.content.replaceAll("```", "").trim();
  }
}
