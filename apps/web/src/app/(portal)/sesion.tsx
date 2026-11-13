"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { UsuarioSesion } from "@portal/shared";

const SesionContext = createContext<UsuarioSesion | null>(null);

/** Usuario de la sesión actual. Solo se puede usar dentro de las páginas del portal. */
export function useSesion(): UsuarioSesion {
  const sesion = useContext(SesionContext);
  if (!sesion) throw new Error("useSesion fuera de <Sesion>");
  return sesion;
}

/** Comparte el usuario con las páginas y obliga a cambiar la clave temporal antes de seguir. */
export function Sesion({ usuario, children }: { usuario: UsuarioSesion; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const debeCambiar = usuario.debeCambiarPassword && pathname !== "/cambiar-password";

  useEffect(() => {
    if (debeCambiar) router.replace("/cambiar-password");
  }, [debeCambiar, router]);

  if (debeCambiar) return null;
  return <SesionContext.Provider value={usuario}>{children}</SesionContext.Provider>;
}
