import { CommitAction } from "./commit/commit.action";
import { Console } from "./domain/console";
import { Git } from "./domain/git";

const pair = ([action, ...args]: string[]): void => {
  const git = new Git();
  const console = new Console();
  switch (action) {
    case "commit":
      new CommitAction(git, console).run();
      break;

    default:
      console.log("Unknown action");
      break;
  }
};

pair(process.argv.slice(2));
