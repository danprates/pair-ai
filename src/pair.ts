import { useCodeReview, useCommit, usePullRequest } from "./actions";
import { useDependencies } from "./dependencies";

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
