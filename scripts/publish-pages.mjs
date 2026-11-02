import { mkdtemp, readdir, rm, cp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { waitForPages } from "./pages-status.mjs";
const root = process.cwd();
const remote = "https://github.com/mo90mosleh/SanaWebsite.git";
const git = (args, cwd = root) =>
  execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const folder = await mkdtemp(join(tmpdir(), "sana-pages-"));
try {
  const hasBranch =
    git(["ls-remote", remote, "refs/heads/gh-pages"]).length > 0;
  if (hasBranch)
    git([
      "clone",
      "--depth",
      "1",
      "--single-branch",
      "--branch",
      "gh-pages",
      remote,
      folder,
    ]);
  else {
    git(["init", "--initial-branch=gh-pages"], folder);
    git(["remote", "add", "origin", remote], folder);
  }
  const previousEntries = (await readdir(folder)).filter((name) =>
    /^open-[a-f0-9]+\.html$/.test(name),
  );
  const source = git(["rev-parse", "--short", "HEAD"]);
  const freshEntry = `open-${source}.html`;
  for (const entry of await readdir(folder)) {
    if (entry !== ".git")
      await rm(join(folder, entry), { recursive: true, force: true });
  }
  await cp(resolve(root, "dist"), folder, { recursive: true });
  await writeFile(join(folder, ".nojekyll"), "");
  // A never-before-served entry URL avoids stale HTML without clearing browser storage.
  // Keep older entry links working, pointing at the current app rather than archived code.
  for (const entry of new Set([...previousEntries, freshEntry]))
    await cp(join(folder, "index.html"), join(folder, entry));
  git(["config", "user.name", git(["log", "-1", "--format=%an"])], folder);
  git(["config", "user.email", git(["log", "-1", "--format=%ae"])], folder);
  git(["add", "--all"], folder);
  if (git(["status", "--porcelain"], folder)) {
    git(
      [
        "commit",
        "-m",
        `Publish Sana demo from ${git(["rev-parse", "--short", "HEAD"])}`,
      ],
      folder,
    );
    git(["push", "origin", "HEAD:refs/heads/gh-pages"], folder);
    console.log(
      "Pushed static output to gh-pages:",
      git(["rev-parse", "HEAD"], folder),
    );
  } else
    console.log("gh-pages already contains this build; no changes pushed.");
  await waitForPages(git(["rev-parse", "HEAD"], folder));
  console.log(
    "Fresh entry URL: https://mo90mosleh.github.io/SanaWebsite/" + freshEntry,
  );
} finally {
  await rm(folder, { recursive: true, force: true });
}
