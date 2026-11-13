"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useSesion } from "./sesion";

export function Encabezado() {
  const usuario = useSesion();
  const router = useRouter();
  const puedeAdministrar = usuario.rol === "ADMIN" || usuario.rol === "COORDINADOR";

  async function salir() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="bg-usm-azul text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/inicio" className="font-semibold">
          Staff Promoción <span className="text-usm-amarillo">USM</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {puedeAdministrar && !usuario.debeCambiarPassword && (
            <Link href="/admin/usuarios" className="hover:text-usm-amarillo">
              Usuarios
            </Link>
          )}
          <span className="hidden text-usm-celeste/80 sm:inline">{usuario.username}</span>
          <button onClick={salir} className="hover:text-usm-amarillo">
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
