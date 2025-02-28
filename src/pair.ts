const pair = ([action, ...args]: string[]): void => {
  switch (action) {
    default:
      console.log("Unknown action");
      break;
  }
};

pair(process.argv.slice(2));
