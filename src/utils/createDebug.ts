export function createDeploymentDebug(debug?: boolean) {
  if (debug) {
    return (...logs: string[]) => {
      process.stderr.write(
        [`[deployment-debug] ${new Date().toISOString()}`, ...logs].join(" ") +
          "\n",
      );
    };
  }

  return () => {};
}

