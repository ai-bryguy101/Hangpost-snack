# Generating the full college list

`lib/colleges.ts` ships a broad **hand-curated** set (~594 four-year
institutions) — plenty for the prototype, and the free-text fallback in
`ComboField` covers anything unlisted, so no school ever blocks sign-up.

For the **exhaustive ~2,000 four-year set**, regenerate `lib/colleges.ts` from a
public dataset. This is **deliberately not a committed script**: a `.mjs` (or any
non-`tsx/ts/json/md`) file in the repo breaks Snack's git import — Snack treats
the unknown extension as a binary *asset* and the upload fails ("Failed to upload
file asset"). So keep the generator here, as a snippet, and run it in a
**Codespace** (it needs network egress the browser/Snack sandbox doesn't have):

```js
// build_colleges.mjs — in a Codespace on this repo: `node build_colleges.mjs`
// Source: Hipo/university-domains-list (public). US four-year institutions only;
// community / technical / junior colleges excluded ("above community").
import { writeFileSync } from "node:fs";

const SRC =
  "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";
const EXCLUDE =
  /(community college|technical college|junior college|county college|city college of|cosmetolog|beauty|barber|truck driv|massage|culinary institute|bartend)/i;

const res = await fetch(SRC);
if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
const data = await res.json();

const names = [
  ...new Set(
    data
      .filter((x) => x.country === "United States" && x.name && !EXCLUDE.test(x.name))
      .map((x) => x.name.trim()),
  ),
].sort((a, b) => a.localeCompare(b));

const body = names.map((n) => `  ${JSON.stringify(n)},`).join("\n");
writeFileSync(
  "lib/colleges.ts",
  `/** US colleges & universities for the College autocomplete.
 * GENERATED — re-run the COLLEGES.md snippet to refresh. ${names.length} entries.
 * Matched by EXACT string equality; ComboField free-text covers anything unlisted. */
export const COLLEGES: readonly string[] = [
${body}
];
`,
);
console.log(`Wrote lib/colleges.ts with ${names.length} institutions.`);
```

Steps:

1. Open a **Codespace** on this repo.
2. Save the snippet above as `build_colleges.mjs` at the repo root — **do not
   commit it** (keep the repo Snack-importable).
3. `node build_colleges.mjs`
4. Review `git diff lib/colleges.ts` — the names become the canonical match
   strings, so sanity-check for `The ` prefixes / duplicates.
5. Commit **only** `lib/colleges.ts`, then delete the local `build_colleges.mjs`.
