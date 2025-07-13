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

export const askGemini =
  (apiKey: string, model: string) =>
  async (prompt: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
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
  };
