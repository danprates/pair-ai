type OllamaResponse = {
  message: {
    content: string;
  };
  error?: string;
};

export const useOllama =
  (model: string) =>
  async (prompt: string): Promise<string> => {
    const url = "http://localhost:11434/api/chat";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    const data: OllamaResponse = await response.json();
    if (data.error) {
      throw new Error(`Ollama API returned ${data.error}`);
    }
    return data.message.content.trim();
  };
