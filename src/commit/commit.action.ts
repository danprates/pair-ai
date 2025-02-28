/**
 * This class is responsible for committing changes using the Conventional Commits standard
 */
export class CommitAction {
  constructor() {}

  async run(): Promise<void> {
    console.log("Commit action");
  }
}
