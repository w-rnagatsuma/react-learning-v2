type RequestInitWithCredentials = RequestInit & {
  credentials?: RequestCredentials;
};

export async function trpcFetch(
  path: string,
  init?: RequestInitWithCredentials,
) {
  const response = await fetch(`/trpc/${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`tRPC request failed: ${response.status}`);
  }

  return response.json();
}