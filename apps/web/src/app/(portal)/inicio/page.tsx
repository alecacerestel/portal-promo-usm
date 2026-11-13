"use client";

import { useSesion } from "../sesion";

export default function InicioPage() {
  const usuario = useSesion();

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Hola, {usuario.nombres.split(" ")[0]} 👋</h1>
      <p className="text-foreground/70">
        Aquí irán tus actividades de la semana, los cumpleaños y lo que se viene.
      </p>
    </section>
  );
}
