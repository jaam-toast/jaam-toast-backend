const DEFAULT_INTERVAL_TIME = 1000 * 2;
const DEFAULT_LIMIT_TIME = 1000 * 60 * 2;

export function waitFor<ActFunction extends (...args: any) => any>({
  act,
  until = async result => !!(await result),
  intervalTime = DEFAULT_INTERVAL_TIME,
  limitTime = DEFAULT_LIMIT_TIME,
}: {
  act: ActFunction;
  until?: (actResult: ReturnType<ActFunction>) => boolean | Promise<boolean>;
  intervalTime?: number;
  limitTime?: number;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const waitInterval = setInterval(async () => {
      try {
        const actResult = await act();

        if (await until(actResult)) {
          clearInterval(waitInterval);
          clearTimeout(waitTimeout);
          resolve();
        }
      } catch {}
    }, intervalTime);

    const waitTimeout = setTimeout(() => {
      clearInterval(waitInterval);
      reject();
    }, limitTime);
  });
}
