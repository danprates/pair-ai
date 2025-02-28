/**
 * This class is responsible for committing changes using the Conventional Commits standard
 */
export class CommitAction {
  constructor(
    private readonly getDiff: () => string,
    private readonly output: (message: string) => void
  ) {}

  async run(): Promise<void> {
    const diff = this.getDiff();

    if (diff.length === 0) {
      this.output("There are no changes to commit.");
      return;
    }
  }
}
