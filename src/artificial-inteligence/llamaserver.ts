type LlamaServerResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
};

export const useLlamaServer =
  (model: string) =>
  async (prompt: string): Promise<string> => {
    const url = "http://localhost:8080/v1/chat/completions";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    const data: LlamaServerResponse = await response.json();
    if (data.error) {
      throw new Error(`Llama Server API returned ${data.error.message}`);
    }
    return data.choices[0].message.content.replaceAll("```", "").trim();
  };
