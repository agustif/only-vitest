import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { packageJsonPath } from "../src/paths.js";
import { createShimPlan } from "../src/shim-entry.js";

let tempDir = "";

afterEach(async () => {
  if (tempDir.length > 0) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = "";
  }
});

describe("shim planning", () => {
  it("rewrites bare bun test to vitest when repo policy is vitest", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "only-vitest-plan-"));
    await mkdir(join(tempDir, "node_modules", ".bin"), { recursive: true });
    await writeFile(
      packageJsonPath(tempDir),
      JSON.stringify(
        {
          name: "fixture",
          onlyTest: {
            version: 1,
            runner: "vitest",
          },
        },
        null,
        2,
      ),
    );
    const fakeVitest = join(tempDir, "node_modules", ".bin", "vitest");
    await writeFile(fakeVitest, "#!/usr/bin/env bash\nexit 0\n");
    await chmod(fakeVitest, 0o755);

    const plan = await createShimPlan({
      realBunPath: "/usr/local/bin/bun",
      configPath: "",
      cwd: tempDir,
      bunArgs: ["test", "--watch"],
    });

    expect(plan.type).toBe("rewrite");
    expect(plan.command).toContain("vitest");
    expect(plan.args).toEqual(["--watch"]);
  });
});
