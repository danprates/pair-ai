import {
  useCodeReview,
  useCommit,
  useExplain,
  usePullRequest,
} from "./actions";
import { useConfig } from "./config";
import { useDependencies } from "./dependencies";

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

    case "explain":
      await useExplain(dependencies, config)(...args);
      break;

    default:
      dependencies.printJson({
        ok: false,
        action,
        message: `Unknown action: "${action}".`,
      });
      break;
  }
};

const argv = process.argv.slice(2);
const action = argv[0];

pair(argv).catch((error) => {
  console.log(JSON.stringify({ ok: false, action, message: error.message }));
  process.exit(1);
});
