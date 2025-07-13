export const readFile = async (file: string): Promise<string> => {
  return await Bun.file(file).text();
};

export const saveFile = async (
  file: string,
  content: string
): Promise<void> => {
  await Bun.write(file, content);
};

export const replaceKey = (
  content: string,
  key: string,
  value: string
): string => {
  const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
  return content.replace(regex, value);
};
