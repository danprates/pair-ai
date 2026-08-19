import systemPrompt from "../prompts/system.prompt.txt" with { type: "text" };
import type { AskResult } from "../types";
import { FREE_COST } from "./cost";

type LlamaServerResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    total_tokens: number;
  };
  error?: {
    message: string;
  };
};

export const useLlamaServer =
  (model: string) =>
  async (prompt: string): Promise<AskResult> => {
    const url = "http://localhost:8080/v1/chat/completions";
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
        temperature: 0.1,
      }),
    });

    const data: LlamaServerResponse = await response.json();
    if (data.error) {
      throw new Error(`Llama Server API returned ${data.error.message}`);
    }
    return {
      content: data.choices[0].message.content.replaceAll("```", "").trim(),
      tokens: data.usage?.total_tokens ?? null,
      cost: FREE_COST,
    };
  };
