import type { GetLogs } from "../domain/types";

export class CodeReview {
  constructor(private readonly git: GetLogs) {}
  async run(...args: string[]): Promise<void> {
    const [branch] = args;

    await this.git.getLogs(branch);
  }
}
