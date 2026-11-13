import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { getUsuario } from "@/lib/sesion";
import { Encabezado } from "./encabezado";
import { Sesion } from "./sesion";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center text-sm">Cargando…</div>}
    >
      <PortalConSesion>{children}</PortalConSesion>
    </Suspense>
  );
}

async function PortalConSesion({ children }: { children: ReactNode }) {
  const usuario = await getUsuario();
  // Cookie vencida o inválida: /salir la borra (aquí no se puede) y lleva al login
  if (!usuario) redirect("/salir");

  return (
    <Sesion usuario={usuario}>
      <Encabezado />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </Sesion>
  );
}
