import { execa } from "execa";
import path from "path";

async function runBuildCommand(cloneUrl: string) {
  try {
    const cloneCommandResult = await execa(
      "git",
      ["clone", cloneUrl, "test-build-dirname"],
      {
        stdio: [0, 1, 2],
        cwd: path.resolve(__dirname, ""),
      },
    );

    const npmInstallCommandResult = await execa("npm", ["install"], {
      stdio: [0, 1, 2],
      cwd: path.join(__dirname, "/test-build-dirname"),
    });

    const npmBuildCommandResult = await execa("npm", ["run", "build"], {
      stdio: [0, 1, 2],
      cwd: path.join(__dirname, "/test-build-dirname"),
    });

    return npmBuildCommandResult;
  } catch (error) {
    console.error(error);
  }
}

export default runBuildCommand;
