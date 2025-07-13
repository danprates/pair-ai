import { useCodeReview } from "./code-review/code-review.action";
import { useCommit } from "./commit/commit.action";
import { dependencies } from "./infra/dependencies";
import { usePullRequest } from "./pull-request/pull-request.action";

const pair = async ([action, ...args]: string[]): Promise<void> => {
  switch (action) {
    case "commit":
      await useCommit(dependencies)(...args);
      break;

    case "code-review":
      await useCodeReview(dependencies)(...args);
      break;

    case "pull-request":
      await usePullRequest(dependencies)(...args);
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
