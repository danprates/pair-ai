import { useCodeReview, useCommit, usePullRequest } from "./actions";
import { useDependencies } from "./dependencies";
import { useConfig } from "./env";

const pair = async ([action, ...args]: string[]): Promise<void> => {
  const config = await useConfig();
  const dependencies = useDependencies(config);

  switch (action) {
    case "commit":
      await useCommit(dependencies, config)(...args);
      break;

    case "code-review":
      await useCodeReview(dependencies, config)(...args);
      break;

    case "pull-request":
      await usePullRequest(dependencies, config)(...args);
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
