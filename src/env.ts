export type Config = {
  MODEL: string;
  LANGUAGE: string;
};

const defaultConfig: Config = {
  MODEL: "gemini/gemini-2.0-flash",
  LANGUAGE: "en",
};

export const useConfig = async (): Promise<Config> => {
  const file = await Bun.file(".pair-ai").text();
  const lines = file.split("\n");
  return lines.reduce((acc, line) => {
    const [key, value] = line.trim().split("=");
    if (key && value) {
      acc[key.trim() as keyof Config] = value.trim();
    }
    return acc;
  }, defaultConfig);
};
