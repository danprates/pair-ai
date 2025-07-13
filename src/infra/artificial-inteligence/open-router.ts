type OpenRouterResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
};

export const useOpenRouter =
  (apiKey: string, model: string) =>
  async (prompt: string): Promise<string> => {
    const url = "https://openrouter.ai/api/v1/chat/completions";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
        temperature: 0.1,
      }),
    });

    const data: OpenRouterResponse = await response.json();
    if (data.error) {
      throw new Error(`OpenRouter API returned ${data.error.message}`);
    }
    return data.choices[0].message.content.replaceAll("```", "").trim();
  };
