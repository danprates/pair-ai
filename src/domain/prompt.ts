export class Prompt {
  private constructor(public content: string) {}

  static async from(file: string): Promise<Prompt> {
    const content = await Bun.file(file).text();
    return new Prompt(content);
  }

  static async to(file: string, content: string): Promise<void> {
    await Bun.write(file, content);
  }

  public replace(key: string, value: string): void {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    this.content = this.content.replace(regex, value);
  }
}
