"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useState, type FormEvent } from "react";
import { cambiarPasswordSchema, PASSWORD_MIN, type UsuarioSesion } from "@portal/shared";
import { Alerta, Boton, Campo } from "@/components/ui";
import { api } from "@/lib/api";
import { useSesion } from "../sesion";

export default function CambiarPasswordPage() {
  const usuario = useSesion();
  const router = useRouter();
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [cargando, setCargando] = useState(false);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const datos = { actual: form.get("actual"), nueva: form.get("nueva") };

    if (datos.nueva !== form.get("confirmar")) {
      return setErrores({ confirmar: "Las contraseñas no coinciden" });
    }
    const validacion = cambiarPasswordSchema.safeParse(datos);
    if (!validacion.success) {
      const campos = z.flattenError(validacion.error).fieldErrors;
      return setErrores({ actual: campos.actual?.[0], nueva: campos.nueva?.[0] });
    }

    setCargando(true);
    setErrores({});
    try {
      await api<UsuarioSesion>("/auth/cambiar-password", { json: validacion.data });
      // refresh() vuelve a leer la sesión en el servidor (ya sin la clave temporal)
      router.replace("/inicio");
      router.refresh();
    } catch (err) {
      setErrores({ general: err instanceof Error ? err.message : "No se pudo cambiar" });
      setCargando(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">Cambia tu contraseña</h1>
      {usuario.debeCambiarPassword && (
        <Alerta tipo="exito">
          Bienvenido/a, <strong>{usuario.username}</strong>. Antes de seguir, reemplaza tu clave
          temporal por una propia.
        </Alerta>
      )}
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Campo
          label="Contraseña actual"
          name="actual"
          type="password"
          autoComplete="current-password"
          error={errores.actual}
          required
        />
        <Campo
          label={`Nueva contraseña (mínimo ${PASSWORD_MIN} caracteres)`}
          name="nueva"
          type="password"
          autoComplete="new-password"
          error={errores.nueva}
          required
        />
        <Campo
          label="Repite la nueva contraseña"
          name="confirmar"
          type="password"
          autoComplete="new-password"
          error={errores.confirmar}
          required
        />
        {errores.general && <Alerta>{errores.general}</Alerta>}
        <div className="flex gap-2">
          <Boton type="submit" cargando={cargando} className="flex-1">
            Guardar
          </Boton>
          {!usuario.debeCambiarPassword && (
            <Boton type="button" variante="secundario" onClick={() => router.back()}>
              Cancelar
            </Boton>
          )}
        </div>
      </form>
    </section>
  );
}
