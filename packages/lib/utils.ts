export const mainFetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  const data = await res.json();

  return data;
};

export async function controlledFetch(
  input: RequestInfo,
  init?: RequestInit | undefined
): Promise<Response> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);
  }

  return res;
}
