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

export function createCertbotDebug(debug?: boolean) {
  if (debug) {
    return (...logs: string[]) => {
      process.stderr.write(
        [`[cerbot-debug] ${new Date().toISOString()}`, ...logs].join(" ") +
          "\n",
      );
    };
  }

  return () => {};
}
