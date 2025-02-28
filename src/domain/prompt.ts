import { readFile } from "fs/promises";

export class Prompt {
  private constructor(public content: string) {}

  static async from(file: string): Promise<Prompt> {
    const content = await readFile(file, "utf-8");
    return new Prompt(content);
  }
}
