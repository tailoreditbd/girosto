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

## Focused code review

Start with changed files and read only their direct dependencies:

- For changes in `shop/product/` or `shop/category/`, inspect the affected page, its linked assets, and local links.
- For changes in `data/`, inspect the relevant build script and generated pages.
- For changes in `partials/`, inspect the relevant build script and affected pages.
- For changes in `assets/`, inspect only pages that load the changed asset.

Use `rg` to locate references. Avoid reading all generated catalog pages unless the change affects all of them. Review `git diff` before finishing.
