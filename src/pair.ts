import { CodeReview } from "./code-review/code-review.action";
import { CommitAction } from "./commit/commit.action";
import { dependencies } from "./infra/dependencies";
import { PullRequest } from "./pull-request/pull-request.action";

const pair = async ([action, ...args]: string[]): Promise<void> => {
  switch (action) {
    case "commit":
      await new CommitAction(dependencies).run(...args);
      break;

    case "code-review":
      await new CodeReview(dependencies).run(...args);
      break;

    case "pull-request":
      await new PullRequest(dependencies).run(...args);
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
