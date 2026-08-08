const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Envoltorio de fetch para hablar con la API de SICOVI: manda la cookie
// httpOnly del JWT (credentials: "include"), serializa el body a JSON y
// -- si el backend responde { success:false, message } -- lanza un Error
// con ese mensaje para que cada pantalla lo muestre tal cual.
export async function apiFetch(path, { method = "GET", body, headers, ...rest } = {}) {
  const esFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(esFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : esFormData ? body : JSON.stringify(body),
    ...rest,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin body (ej. algunos 204) -- no es un error por sí solo
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || `Error ${res.status} al conectar con el servidor`);
  }

  return data;
}
