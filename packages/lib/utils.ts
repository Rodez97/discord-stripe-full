import { ApiError } from "@stripe-discord/types";
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

export function handleApiError(error: unknown) {
  console.error("Error:", error);

  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.message,
      },
      {
        status: error.status,
      }
    );
  }

  return Response.json(
    {
      error: error instanceof Error ? error.message : "Unknown error",
    },
    {
      status: 500,
    }
  );
}
