# `only-vitest`

`only-vitest` silently redirects bare `bun test` to Vitest and enforces Vitest as the approved test runner for a repo.

This is the narrow, stable line extracted from the broader `only-test` idea. If you only care about Vitest and want the smallest policy surface, use this package.

## Install

```bash
bun add -d @agustif/only-vitest
```

## Recommended setup

Inside the target repo:

```bash
only-vitest install --sync-scripts
eval "$(only-vitest activate)"
```

This:

1. writes repo policy into `package.json#onlyTest`
2. installs a global Bun shim under `~/.local/share/only-test/bin/bun`
3. optionally syncs `package.json` test scripts to `only-vitest run --`

## Commands

- `only-vitest install`
- `only-vitest init`
- `only-vitest setup-shell`
- `only-vitest install-local-shim`
- `only-vitest sync-scripts`
- `only-vitest run -- --watch`
- `only-vitest doctor`
- `only-vitest activate`

## Repo policy

```json
{
  "onlyTest": {
    "version": 1,
    "runner": "vitest"
  }
}
```

## Local development

```bash
bun install
bun run lint
bun run check
bun run test
bun run build
node dist/cli.js --help
```
