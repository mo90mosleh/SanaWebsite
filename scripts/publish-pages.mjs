import { mkdtemp, readdir, rm, cp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
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
  for (const entry of await readdir(folder)) {
    if (entry !== ".git")
      await rm(join(folder, entry), { recursive: true, force: true });
  }
  await cp(resolve(root, "dist"), folder, { recursive: true });
  await writeFile(join(folder, ".nojekyll"), "");
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
      "Published static output to gh-pages:",
      git(["rev-parse", "HEAD"], folder),
    );
  } else
    console.log("gh-pages already contains this build; no changes pushed.");
  console.log(
    "Expected site URL after Pages is enabled: https://mo90mosleh.github.io/SanaWebsite/",
  );
} finally {
  await rm(folder, { recursive: true, force: true });
}
