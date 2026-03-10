import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { execRunner } from "../src/runner.js";

let tempDir = "";

afterEach(async () => {
  if (tempDir.length > 0) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = "";
  }
});

describe("execRunner", () => {
  it("executes the local vitest binary", async () => {
    tempDir = await mkdtemp(join(tmpdir(), "only-vitest-runner-"));
    await mkdir(join(tempDir, "node_modules", ".bin"), { recursive: true });
    const fakeVitest = join(tempDir, "node_modules", ".bin", "vitest");
    const marker = join(tempDir, "vitest-call.txt");

    await writeFile(
      fakeVitest,
      `#!/usr/bin/env bash\nprintf "%s\\n" "$@" > ${JSON.stringify(marker)}\n`,
    );
    await chmod(fakeVitest, 0o755);

    const exitCode = await execRunner(tempDir, ["--runInBand"]);

    expect(exitCode).toBe(0);
    expect(await readFile(marker, "utf8")).toContain("--runInBand");
  });
});
