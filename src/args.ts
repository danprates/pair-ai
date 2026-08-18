export const parseArgs = (args: string[]): Record<string, string> =>
  args.reduce(
    (acc, arg, index) => {
      if (!arg.startsWith("--")) return acc;
      const key = arg.slice(2);
      const value = args[index + 1];
      acc[key] = value && !value.startsWith("--") ? value : "";
      return acc;
    },
    {} as Record<string, string>,
  );
