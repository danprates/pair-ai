import { CommitAction } from "./commit/commit.action";
import { Git } from "./domain/git";

const pair = ([action, ...args]: string[]): void => {
  const git = new Git();
  switch (action) {
    case "commit":
      new CommitAction(git, console.log).run();
      break;

    default:
      console.log("Unknown action");
      break;
  }
};

pair(process.argv.slice(2));
