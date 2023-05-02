import { spawn } from "child_process";

export function runCommand({
  command,
  cwd = process.cwd(),
  onStdout = () => {},
  onStderr = () => {},
}: {
  command: string[];
  cwd?: string | URL;
  onStdout?: (chunk: any) => void;
  onStderr?: (chunk: any) => void;
}) {
  const commander = spawn(command.join(" && "), {
    cwd,
    shell: true,
    stdio: "pipe",
  });

  commander.stdout.setEncoding("utf8");
  commander.stderr.setEncoding("utf8");
  commander.stdout.on("data", onStdout);
  commander.stderr.on("data", onStderr);

  return new Promise<void>((resolve, reject) => {
    commander.on("exit", (code: number | null) => {
      if (!code) {
        resolve();
      }
      reject();
    });
  });
}
