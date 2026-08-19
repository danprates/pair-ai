import systemPrompt from "../prompts/system.prompt.txt" with { type: "text" };
import type { AskResult } from "../types";
import { NOT_INFORMED_COST } from "./cost";

type GeminiResponse = {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
  usageMetadata?: {
    totalTokenCount: number;
  };
  error?: {
    message: string;
    code: number;
  };
};

export const useGemini =
  (apiKey: string, model: string) =>
  async (prompt: string): Promise<AskResult> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
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
    const content =
      data.candidates?.[0]?.content.parts
        ?.map((p) => p.text)
        .join("")
        ?.trim() || "";
    return {
      content,
      tokens: data.usageMetadata?.totalTokenCount ?? null,
      cost: NOT_INFORMED_COST,
    };
  };
