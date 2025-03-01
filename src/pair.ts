import { CodeReview } from "./code-review/code-review.action";
import { CommitAction } from "./commit/commit.action";
import { Console } from "./domain/console";
import { Git } from "./domain/git";
import { OpenRouter } from "./domain/open-router";

const pair = ([action, ...args]: string[]): void => {
  const git = new Git();
  const console = new Console();
  const openRouter = new OpenRouter(
    process.env.OPENROUTER_API_KEY || "",
    "google/gemini-2.0-flash-thinking-exp-1219:free"
  );

  switch (action) {
    case "commit":
      new CommitAction(git, console, openRouter).run();
      break;

    case "code-review":
      new CodeReview(git, console, openRouter).run(...args);
      break;

    default:
      console.log("Unknown action");
      break;
  }
};

pair(process.argv.slice(2));
