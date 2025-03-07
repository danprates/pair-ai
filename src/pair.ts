import { CodeReview } from "./code-review/code-review.action";
import { CommitAction } from "./commit/commit.action";
import { Console } from "./domain/console";
import { Git } from "./domain/git";
import { OpenRouter } from "./domain/open-router";
import type { DependencyInjection } from "./domain/types";
import { PullRequest } from "./pull-request/pull-request.action";

const pair = async ([action, ...args]: string[]): Promise<void> => {
  const git = new Git();
  const console = new Console();
  const ai = new OpenRouter(
    process.env.OPENROUTER_API_KEY || "",
    "google/gemini-2.0-flash-thinking-exp-1219:free"
  );
  const di: DependencyInjection = { git, console, ai };

  switch (action) {
    case "commit":
      await new CommitAction(di).run(...args);
      break;

    case "code-review":
      await new CodeReview(di).run(...args);
      break;

    case "pull-request":
      await new PullRequest(di).run(...args);
      break;

    default:
      console.log("Unknown action");
      break;
  }
};

pair(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
