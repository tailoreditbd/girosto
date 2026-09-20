# Repository guidance

This repository is the Girosto storefront. Public HTML pages are checked in alongside the scripts and source content used to build them.

## Project layout

- `shop/product/` and `shop/category/` contain public catalog pages.
- `partials/` contains shared HTML and page content used by the build scripts.
- `data/` contains product and URL data.
- `assets/` contains CSS, JavaScript, and images.
- Root `build*.js` files generate or update public pages. Read `BUILDING.md` before running a build script, because builds write to checked-in files.

## Editing

- Keep changes focused on the requested pages or source files. Preserve existing URLs, relative asset paths, and shared-region markers in HTML.
- When changing shared markup or catalog data, check the relevant build script and update its source as needed so a later build does not overwrite the change.
- Do not run a full build for an isolated page edit unless the shared source also changed. Inspect the resulting diff if a build is run.
- Do not edit `.kilo/worktrees/`; these are local working copies.

## Verification

- Review `git diff` for unexpected generated changes.
- For script edits, run the specific affected build or a syntax check when practical. For HTML and CSS edits, inspect the affected page and its local links.
