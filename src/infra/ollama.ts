import type { ArtificialInteligence } from "../domain/types";

type OllamaResponse = {
  message: {
    content: string;
  };
  error?: string;
};

export class Ollama implements ArtificialInteligence {
  private readonly url: string;
  constructor(private readonly model: string) {
    this.url = "http://localhost:11434/api/chat";
  }

  async ask(prompt: string): Promise<string> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    const data: OllamaResponse = await response.json();
    if (data.error) {
      throw new Error(`Ollama API returned ${data.error}`);
    }
    return data.message.content.trim();
  }
}
