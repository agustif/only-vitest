import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { delimiter } from "node:path";

const pathEntries = (cwd: string): ReadonlyArray<string> =>
  [`${cwd}/node_modules/.bin`, ...(process.env.PATH?.split(delimiter) ?? [])].filter(
    (entry) => entry.length > 0,
  );

const isExecutable = async (path: string): Promise<boolean> => {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

export const supportedRunners = Object.freeze(["vitest"] as const);

export const syncedScriptForRunner = (): string => "only-vitest run --";

export const resolveRunnerCommand = async (
  cwd: string,
  args: ReadonlyArray<string>,
): Promise<{ command: string; args: ReadonlyArray<string> }> => {
  for (const entry of pathEntries(cwd)) {
    const fullPath = `${entry}/vitest`;
    if (await isExecutable(fullPath)) {
      return {
        command: fullPath,
        args,
      };
    }
  }

  throw new Error(`Unable to locate vitest in ${cwd}/node_modules/.bin or PATH`);
};

export const execRunner = async (cwd: string, args: ReadonlyArray<string>): Promise<number> => {
  const resolved = await resolveRunnerCommand(cwd, args);

  return await new Promise<number>((resolve, reject) => {
    const child = spawn(resolved.command, [...resolved.args], {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        ONLY_TEST_RUNNER: "vitest",
        ONLY_TEST_DISABLE_SHIM: "1",
      },
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolve(code ?? 1);
    });
  });
};
