'use client';

import { useEffect, useState } from 'react';

type Estado = 'cargando' | 'ok' | 'error';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/** Muestra si la API y la base de datos están respondiendo. */
export function ApiStatus() {
  const [estado, setEstado] = useState<Estado>('cargando');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data: { status: string }) => setEstado(data.status === 'ok' ? 'ok' : 'error'))
      .catch(() => setEstado('error'));
  }, []);

  const texto = {
    cargando: 'Verificando API…',
    ok: 'API y base de datos funcionando',
    error: 'API sin conexión',
  }[estado];

  return (
    <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm">
      <span
        className={`mr-2 inline-block size-2 rounded-full ${
          estado === 'ok' ? 'bg-emerald-400' : estado === 'error' ? 'bg-red-400' : 'bg-usm-amarillo'
        }`}
      />
      {texto}
    </span>
  );
}
