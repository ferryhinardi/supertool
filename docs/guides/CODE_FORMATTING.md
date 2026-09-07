# Code Formatting Guide

This project uses **[Biome](https://biomejs.dev/)** as the formatter and primary linter, with
**ESLint** kept only for the React Hooks / React Compiler and Next.js rules that Biome does not
cover.

---

## Quick commands

| Command | What it does |
| --- | --- |
| `pnpm lint` | Biome format + lint with auto-fix (`biome check --write .`) |
| `pnpm lint:check` | Biome check without writing — this is what CI runs |
| `pnpm format` / `pnpm format:check` | Formatting only (write / verify) |
| `pnpm lint:eslint` / `pnpm lint:eslint:fix` | ESLint (React Hooks, React Compiler, Next.js) |
| `pnpm exec tsc --noEmit` | Type check |

---

## Biome configuration

Located in `biome.json`:

- **No semicolons** (`semicolons: "asNeeded"`)
- **Single quotes** for JS/TS, double quotes in JSX attributes
- **100-character** line width, **2-space** indentation, LF line endings
- **Trailing commas** where ES5 allows them
- **Import organisation** is enabled through `assist.actions.source.organizeImports`
- Generated and vendored folders (`styled-system/`, `.next/`, `coverage*`, `scripts/`, `.mcp/`)
  are excluded

Selected rule adjustments:

| Rule | Level | Why |
| --- | --- | --- |
| `suspicious/noExplicitAny` | warn | Prefer proper types; legacy code still has a few |
| `style/noNonNullAssertion` | warn | Narrow instead of asserting where practical |
| `suspicious/noArrayIndexKey` | warn | Use stable keys |
| `a11y/useSemanticElements`, `useButtonType` | warn | Accessibility nudges |
| `performance/noImgElement` | off | Tool pages render blob/data URLs that `next/image` cannot optimise |
| `complexity/noForEach` | off | Stylistic |

---

## ESLint configuration

Located in `eslint.config.mjs` (flat config):

- `typescript-eslint` recommended rules
- `eslint-plugin-react-hooks` recommended (`rules-of-hooks`, `exhaustive-deps` as errors; the React
  Compiler diagnostics such as `set-state-in-effect`, `purity` and `immutability` as warnings)
- `@next/eslint-plugin-next` recommended, with `no-img-element` disabled for the same reason as
  the Biome rule
- `no-require-imports` is relaxed for `next.config.ts` and test files, where `require()` inside
  `vi.mock` factories is the idiomatic pattern

ESLint is not part of the CI gate; run it locally when touching hooks or components to catch
compiler bail-outs early.

---

## Editor integration

Install the Biome extension and set it as the default formatter:

```bash
code --install-extension biomejs.biome
```

```json
// .vscode/settings.json (local, git-ignored)
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "quickfix.biome": "explicit"
  }
}
```

---

## Pre-commit

Husky runs `lint-staged`, which executes
`biome check --write --no-errors-on-unmatched --files-ignore-unknown=true` on staged
`js/jsx/ts/tsx/json/css/scss/md` files. If the hook rewrites a file, stage it again and commit.

---

## Best practices

- Run `pnpm lint` before committing; CI fails on any formatting drift.
- Keep lines under 100 characters and avoid `any` without a comment explaining why.
- Prefix intentionally unused parameters/variables with `_`.
- Do not add `biome-ignore` or `eslint-disable` comments without a reason in the comment.

---

## Troubleshooting

**Biome reports files you did not touch** — run `pnpm lint` once to normalise the tree, then
commit the formatting separately from functional changes.

**Formatter fights with the editor** — make sure no Prettier extension is active for this
workspace; the project has no Prettier configuration.

**ESLint cannot resolve a rule** — the rule's plugin is probably not registered in
`eslint.config.mjs`; add the plugin rather than sprinkling `eslint-disable` comments.

---

## Resources

- [Biome documentation](https://biomejs.dev/guides/getting-started/)
- [ESLint documentation](https://eslint.org/docs/latest/)
- [React Compiler lint rules](https://react.dev/learn/react-compiler)
