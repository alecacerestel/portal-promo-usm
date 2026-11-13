import { cookies } from "next/headers";
import type { UsuarioSesion } from "@portal/shared";

/** Usuario de la sesión actual, consultado a la API desde el servidor. null si no hay sesión válida. */
export async function getUsuario(): Promise<UsuarioSesion | null> {
  const sesion = (await cookies()).get("sesion");
  if (!sesion) return null;

  const res = await fetch(`${process.env.API_URL ?? "http://localhost:4000"}/auth/me`, {
    headers: { cookie: `sesion=${sesion.value}` },
    cache: "no-store",
  });
  return res.ok ? res.json() : null;
}
