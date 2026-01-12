const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const safeJson = async (response: Response) => {
  return response.json().catch(() => null);
};

export default async function apiFetch(url: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_API_URL}${url}`, {
    ...options,
    credentials: 'include',
  });
  const data = await safeJson(response);
  return { response, data };
}
