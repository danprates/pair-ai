export class CodeReview {
  async run(...args: string[]): Promise<void> {
    console.log({
      ...args,
    });
  }
}
