import { CommitAction } from "./commit/commit.action";

const pair = ([action, ...args]: string[]): void => {
  switch (action) {
    case "commit":
      new CommitAction().run();
      break;

    default:
      console.log("Unknown action");
      break;
  }
};

pair(process.argv.slice(2));
