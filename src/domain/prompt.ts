import { readFile } from "fs/promises";

export class Prompt {
  private constructor(public content: string) {}

  static async from(file: string): Promise<Prompt> {
    const content = await readFile(file, "utf-8");
    return new Prompt(content);
  }

  public replace(key: string, value: string): void {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    this.content = this.content.replace(regex, value);
  }
}
