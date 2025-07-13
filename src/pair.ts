import { useCodeReview } from "./actions/code-review.action";
import { useCommit } from "./actions/commit.action";
import { usePullRequest } from "./actions/pull-request.action";
import { useDependencies } from "./utils";

const pair = async ([action, ...args]: string[]): Promise<void> => {
  const dependencies = useDependencies();
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
