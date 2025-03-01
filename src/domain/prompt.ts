import { writeFile } from "fs/promises";

export class Prompt {
  private constructor(public content: string) {}

  static async from(file: string): Promise<Prompt> {
    // const content = await readFile(file, "utf-8");
    const content = await Bun.file(file).text();
    return new Prompt(content);
  }

  static async to(file: string, content: string): Promise<void> {
    await writeFile(file, content, "utf-8");
  }

  public replace(key: string, value: string): void {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    this.content = this.content.replace(regex, value);
  }
}
