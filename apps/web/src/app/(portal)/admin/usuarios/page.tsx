"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import {
  crearUsuarioSchema,
  formatearRut,
  type EstadoStaff,
  type Rol,
  type UsuarioCreado,
} from "@portal/shared";
import { Alerta, Boton, Campo } from "@/components/ui";
import { api } from "@/lib/api";
import { useSesion } from "../../sesion";

interface FilaUsuario {
  id: string;
  username: string;
  rut: string;
  dv: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string | null;
  rol: Rol;
  estado: EstadoStaff;
  debeCambiarPassword: boolean;
}

const NOMBRE_ROL: Record<Rol, string> = {
  ADMIN: "Admin",
  COORDINADOR: "Coordinador/a",
  APOYO_EVENTO: "Apoyo de evento",
  STAFF: "Staff",
  POSTULANTE: "Postulante",
};

export default function UsuariosPage() {
  const sesion = useSesion();
  const [usuarios, setUsuarios] = useState<FilaUsuario[]>([]);
  const [errores, setErrores] = useState<Record<string, string | undefined>>({});
  const [creado, setCreado] = useState<UsuarioCreado>();
  const [cargando, setCargando] = useState(false);

  const roles: Rol[] =
    sesion.rol === "ADMIN"
      ? ["STAFF", "APOYO_EVENTO", "COORDINADOR", "ADMIN", "POSTULANTE"]
      : ["STAFF", "APOYO_EVENTO", "POSTULANTE"];

  const cargar = useCallback(() => {
    api<FilaUsuario[]>("/usuarios").then(setUsuarios).catch(() => {});
  }, []);
  useEffect(cargar, [cargar]);

  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formulario = e.currentTarget;
    const form = Object.fromEntries(new FormData(formulario));
    const datos = {
      ...form,
      apellidoMaterno: form.apellidoMaterno || undefined,
      email: form.email || undefined,
    };

    const validacion = crearUsuarioSchema.safeParse(datos);
    if (!validacion.success) {
      const campos = z.flattenError(validacion.error).fieldErrors;
      return setErrores(Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, v?.[0]])));
    }

    setCargando(true);
    setErrores({});
    setCreado(undefined);
    try {
      setCreado(await api<UsuarioCreado>("/usuarios", { json: validacion.data }));
      formulario.reset();
      cargar();
    } catch (err) {
      setErrores({ general: err instanceof Error ? err.message : "No se pudo crear" });
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Nuevo usuario</h1>
        <form onSubmit={crear} className="flex flex-col gap-3" noValidate>
          <Campo label="RUT" name="rut" placeholder="12.345.678-5" error={errores.rut} required />
          <Campo label="Nombres" name="nombres" error={errores.nombres} required />
          <Campo
            label="Apellido paterno"
            name="apellidoPaterno"
            error={errores.apellidoPaterno}
            required
          />
          <Campo label="Apellido materno" name="apellidoMaterno" />
          <Campo label="Correo (opcional)" name="email" type="email" error={errores.email} />
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Rol
            <select
              name="rol"
              defaultValue="STAFF"
              className="rounded-lg border border-usm-azul/20 bg-white px-3 py-2.5 text-base font-normal dark:border-white/15 dark:bg-white/5"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {NOMBRE_ROL[r]}
                </option>
              ))}
            </select>
          </label>
          {errores.general && <Alerta>{errores.general}</Alerta>}
          {creado && (
            <Alerta tipo="exito">
              Cuenta creada. Comparte estos datos con la persona:
              <br />
              Usuario: <strong>{creado.username}</strong>
              <br />
              Clave temporal: <strong>{creado.claveTemporal}</strong>
            </Alerta>
          )}
          <Boton type="submit" cargando={cargando}>
            Crear usuario
          </Boton>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Usuarios ({usuarios.length})</h2>
        <ul className="divide-y divide-usm-azul/10 rounded-xl border border-usm-azul/10 dark:divide-white/10 dark:border-white/10">
          {usuarios.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-medium">
                  {u.nombres} {u.apellidoPaterno} {u.apellidoMaterno}
                </p>
                <p className="text-sm text-foreground/60">
                  {u.username} · {formatearRut({ cuerpo: u.rut, dv: u.dv })}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                {u.debeCambiarPassword && (
                  <span className="rounded-full bg-usm-amarillo/20 px-2 py-1">Clave temporal</span>
                )}
                <span className="rounded-full bg-usm-celeste px-2 py-1 text-usm-azul">
                  {NOMBRE_ROL[u.rol]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
