/** Typed fetch wrapper for API calls */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sh_token");
}

export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type if body is not FormData
  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.error || "Request failed", res.status);
  }

  return data as T;
}

/** Upload file to Cloudinary via our API */
export async function uploadFile(
  file: File,
  folder: string = "general"
): Promise<{ url: string; publicId: string; resourceType: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  return apiFetch("/api/upload", {
    method: "POST",
    body: formData,
  });
}
