import { execFileSync } from "node:child_process";
const repository = "https://github.com/mo90mosleh/SanaWebsite";
function html(url) {
  return execFileSync(
    "curl",
    [
      "--fail",
      "--silent",
      "--show-error",
      "--location",
      "--max-time",
      "20",
      "--header",
      "Cache-Control: no-cache",
      url,
    ],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
}
function workflowRuns(page) {
  for (const match of page.matchAll(
    /<script\b[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    try {
      const runs = JSON.parse(match[1]).payload?.allWorkflowRunsRoute
        ?.workflowRuns;
      if (Array.isArray(runs)) return runs;
    } catch {
      /* Other JSON script blocks are not workflow data. */
    }
  }
  throw Error("Could not read public Pages workflow status");
}
export async function waitForPages(
  commit,
  { timeoutMs = 300000, pollMs = 10000 } = {},
) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw Error("Invalid Pages commit");
  const deadline = Date.now() + timeoutMs;
  const commits = new Map();
  let last = "";
  while (Date.now() < deadline) {
    try {
      const runs = workflowRuns(html(repository + "/actions"));
      for (const run of runs
        .filter(
          (r) =>
            r.branch?.name === "refs/heads/gh-pages" &&
            r.workflowFilePath === "dynamic/pages/pages-build-deployment",
        )
        .slice(0, 5)) {
        if (!/^\d+$/.test(run.id)) continue;
        const url = repository + "/actions/runs/" + run.id;
        if (!commits.has(run.id)) {
          const page = html(url);
          commits.set(
            run.id,
            page.match(
              /\/mo90mosleh\/SanaWebsite\/commit\/([a-f0-9]{40})/,
            )?.[1],
          );
        }
        if (commits.get(run.id) !== commit) continue;
        const state = run.state;
        if (state?.conclusion === "WORKFLOW_RUN_CONCLUSION_SUCCESS") {
          console.log("GitHub Pages deployment verified:", commit, url);
          return url;
        }
        if (state?.status === "WORKFLOW_RUN_STATUS_COMPLETED")
          throw Object.assign(Error("Pages deployment failed: " + url), {
            fatal: true,
          });
        const message =
          "Waiting for GitHub Pages deployment: " +
          (state?.status || "pending");
        if (message !== last) {
          console.log(message);
          last = message;
        }
        break;
      }
    } catch (error) {
      if (error.fatal) throw error;
      const message = "Pages status is not readable yet: " + error.message;
      if (message !== last) {
        console.log(message);
        last = message;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw Error(
    "Files were pushed, but Pages deployment was not verified before timeout. Check " +
      repository +
      "/actions",
  );
}
