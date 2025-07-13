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

export const useOpenAI =
  (apiKey: string, model: string) =>
  async (prompt: string): Promise<string> => {
    const url = "https://api.openai.com/v1/chat/completions";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    const data: OpenAIResponse = await response.json();
    if (data.error) {
      throw new Error(`OpenAI API returned ${data.error.message}`);
    }
    return data.choices[0].message.content.replaceAll("```", "").trim();
  };
