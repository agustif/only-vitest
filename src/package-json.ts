import { readText, writeText } from "./fs.js";
import { packageJsonPath } from "./paths.js";

interface PackageJsonShape {
  readonly name?: string;
  readonly scripts?: Record<string, string>;
  readonly [key: string]: unknown;
}

export const syncTestScripts = async (cwd: string): Promise<void> => {
  const path = packageJsonPath(cwd);
  const current = JSON.parse(await readText(path)) as PackageJsonShape;

  await writeText(
    path,
    `${JSON.stringify(
      {
        ...current,
        scripts: {
          ...(current.scripts ?? {}),
          test: "only-vitest run --",
          "test:doctor": "only-vitest doctor",
        },
      },
      null,
      2,
    )}\n`,
  );
};
