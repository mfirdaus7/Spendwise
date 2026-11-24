const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("spendwise_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem("spendwise_token");
      localStorage.removeItem("spendwise_user");
      window.dispatchEvent(new Event("spendwise:logout"));
    }
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}

export function money(value) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function monthLabel(month) {
  return new Date(`${month}-01T00:00:00`).toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric",
  });
}