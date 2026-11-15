"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";
import {
  editarUsuarioSchema,
  type ClaveReseteada,
  type EstadoStaff,
  type Rol,
} from "@portal/shared";
import { Alerta, Boton, Campo, Selector } from "@/components/ui";
import { api } from "@/lib/api";

export interface FilaUsuario {
  id: string;
  username: string;
  rut: string;
  dv: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  email: string | null;
  rol: Rol;
  estado: EstadoStaff;
  activo: boolean;
  debeCambiarPassword: boolean;
}

export const NOMBRE_ROL: Record<Rol, string> = {
  ADMIN: "Admin",
  COORDINADOR: "Coordinador/a",
  APOYO_EVENTO: "Apoyo de evento",
  STAFF: "Staff",
  POSTULANTE: "Postulante",
};

export const NOMBRE_ESTADO: Record<EstadoStaff, string> = {
  ACTIVO: "Activo",
  CONGELADO: "Congelado",
  INTERCAMBIO: "En intercambio",
  GRADUADO: "Graduado",
};

/** Formulario para editar a un usuario, desactivarlo o resetear su clave. */
export function EditarUsuario({
  usuario,
  roles,
  esUnoMismo,
  onGuardado,
  onCerrar,
}: {
  usuario: FilaUsuario;
  /** Roles que quien edita puede asignar */
  roles: Rol[];
  esUnoMismo: boolean;
  onGuardado: () => void;
  onCerrar: () => void;
}) {
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [guardando, setGuardando] = useState(false);
  const [reseteando, setReseteando] = useState(false);
  const [clave, setClave] = useState<ClaveReseteada>();

  const opcionesRol = Object.fromEntries(roles.map((r) => [r, NOMBRE_ROL[r]]));

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const datos = {
      nombres: form.nombres,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno || null,
      email: form.email || null,
      estado: form.estado,
      // Los campos deshabilitados no viajan en el FormData: así no se envían al editarse a uno mismo
      ...(form.rol && { rol: form.rol }),
      ...(!esUnoMismo && { activo: form.activo === "on" }),
    };

    const validacion = editarUsuarioSchema.safeParse(datos);
    if (!validacion.success) {
      const campos = z.flattenError(validacion.error).fieldErrors;
      return setErrores(Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, v?.[0]])));
    }

    setGuardando(true);
    setErrores({});
    try {
      await api(`/usuarios/${usuario.id}`, { method: "PATCH", json: validacion.data });
      onGuardado();
      onCerrar();
    } catch (err) {
      setErrores({ general: err instanceof Error ? err.message : "No se pudo guardar" });
    } finally {
      setGuardando(false);
    }
  }

  async function resetearClave() {
    if (!confirm(`¿Resetear la clave de ${usuario.username}? Su clave actual dejará de funcionar.`)) {
      return;
    }
    setReseteando(true);
    setErrores({});
    try {
      setClave(await api<ClaveReseteada>(`/usuarios/${usuario.id}/resetear-clave`, { method: "POST" }));
      onGuardado();
    } catch (err) {
      setErrores({ general: err instanceof Error ? err.message : "No se pudo resetear" });
    } finally {
      setReseteando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3 pt-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo label="Nombres" name="nombres" defaultValue={usuario.nombres} error={errores.nombres} />
        <Campo
          label="Apellido paterno"
          name="apellidoPaterno"
          defaultValue={usuario.apellidoPaterno}
          error={errores.apellidoPaterno}
        />
        <Campo
          label="Apellido materno"
          name="apellidoMaterno"
          defaultValue={usuario.apellidoMaterno ?? ""}
        />
        <Campo
          label="Correo"
          name="email"
          type="email"
          defaultValue={usuario.email ?? ""}
          error={errores.email}
        />
        <Selector
          label="Rol"
          name="rol"
          defaultValue={usuario.rol}
          opciones={opcionesRol}
          disabled={esUnoMismo}
        />
        <Selector
          label="Estado"
          name="estado"
          defaultValue={usuario.estado}
          opciones={NOMBRE_ESTADO}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={usuario.activo}
          disabled={esUnoMismo}
          className="size-4 accent-usm-azul"
        />
        Cuenta activa (si la desactivas, no podrá iniciar sesión)
      </label>

      {errores.general && <Alerta>{errores.general}</Alerta>}
      {clave && (
        <Alerta tipo="exito">
          Clave reseteada. Comparte estos datos con la persona:
          <br />
          Usuario: <strong>{clave.username}</strong>
          <br />
          Clave temporal: <strong>{clave.claveTemporal}</strong>
        </Alerta>
      )}

      <div className="flex flex-wrap gap-2">
        <Boton type="submit" cargando={guardando}>
          Guardar
        </Boton>
        <Boton type="button" variante="secundario" onClick={onCerrar}>
          Cancelar
        </Boton>
        {!esUnoMismo && (
          <Boton
            type="button"
            variante="secundario"
            cargando={reseteando}
            onClick={resetearClave}
            className="sm:ml-auto"
          >
            Resetear clave
          </Boton>
        )}
      </div>
    </form>
  );
}
