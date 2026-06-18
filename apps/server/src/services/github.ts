export type GitHubRepositoryRef = {
  owner: string;
  name: string;
};

export type GitHubRepositoryMetadata = GitHubRepositoryRef & {
  repoId: string;
  url: string;
  defaultBranch: string | null;
  latestCommitSha: string | null;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type GitHubRepoResponse = {
  id?: number;
  html_url?: string;
  default_branch?: string;
};

type GitHubCommitResponse = {
  sha?: string;
};

export function parseGitHubRepositoryUrl(value: string | null | undefined): GitHubRepositoryRef | null {
  if (!value) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
    return null;
  }

  const [owner, rawName] = url.pathname.split("/").filter(Boolean);
  const name = rawName?.replace(/\.git$/, "");

  if (!owner || !name) {
    return null;
  }

  return { owner, name };
}

async function fetchJson<T>(fetchFn: FetchLike, url: string): Promise<T | null> {
  const response = await fetchFn(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeAudit",
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export async function fetchGitHubRepositoryMetadata(
  ref: GitHubRepositoryRef,
  fetchFn: FetchLike = fetch,
): Promise<GitHubRepositoryMetadata | null> {
  const apiBase = `https://api.github.com/repos/${ref.owner}/${ref.name}`;
  const repo = await fetchJson<GitHubRepoResponse>(fetchFn, apiBase);

  if (!repo) {
    return null;
  }

  const defaultBranch = repo.default_branch ?? null;
  const commit = defaultBranch
    ? await fetchJson<GitHubCommitResponse>(fetchFn, `${apiBase}/commits/${encodeURIComponent(defaultBranch)}`)
    : null;

  return {
    owner: ref.owner,
    name: ref.name,
    repoId: repo.id?.toString() ?? `${ref.owner}/${ref.name}`,
    url: repo.html_url ?? `https://github.com/${ref.owner}/${ref.name}`,
    defaultBranch,
    latestCommitSha: commit?.sha ?? null,
  };
}

export async function importGitHubRepositoryMetadata(
  url: string | null | undefined,
  fetchFn: FetchLike = fetch,
): Promise<GitHubRepositoryMetadata | null> {
  const ref = parseGitHubRepositoryUrl(url);
  if (!ref) {
    return null;
  }

  return fetchGitHubRepositoryMetadata(ref, fetchFn);
}
