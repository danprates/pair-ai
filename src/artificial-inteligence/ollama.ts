import systemPrompt from "../prompts/system.prompt.txt" with { type: "text" };
import type { AskResult } from "../types";
import { FREE_COST } from "./cost";

type OllamaResponse = {
  message: {
    content: string;
  };
  prompt_eval_count?: number;
  eval_count?: number;
  error?: string;
};

export const useOllama =
  (model: string) =>
  async (prompt: string): Promise<AskResult> => {
    const url = "http://localhost:11434/api/chat";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    const data: OllamaResponse = await response.json();
    if (data.error) {
      throw new Error(`Ollama API returned ${data.error}`);
    }
    const tokens =
      data.prompt_eval_count !== undefined && data.eval_count !== undefined
        ? data.prompt_eval_count + data.eval_count
        : null;
    return { content: data.message.content.trim(), tokens, cost: FREE_COST };
  };
