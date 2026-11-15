'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { UsuarioSesion } from '@portal/shared';
import { Alerta, Boton, Campo } from '@/components/ui';
import { api, ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [cargando, setCargando] = useState(false);

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setCargando(true);
    setError(undefined);
    try {
      const usuario = await api<UsuarioSesion>('/auth/login', {
        json: { usuario: form.get('usuario'), password: form.get('password') },
      });
      router.replace(usuario.debeCambiarPassword ? '/cambiar-password' : '/inicio');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? 'Demasiados intentos. Espera un minuto.'
          : err instanceof Error
            ? err.message
            : 'No se pudo iniciar sesión',
      );
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-usm-azul px-4 py-10">
      <div className="mb-8 text-center text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-usm-amarillo">USM</p>
        <h1 className="mt-2 text-3xl font-semibold">Staff Promoción</h1>
      </div>

      <form
        onSubmit={entrar}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-background p-6 shadow-xl"
      >
        <Campo
          label="Usuario o RUT"
          name="usuario"
          placeholder="nombre.apellido"
          autoComplete="username"
          autoCapitalize="none"
          required
        />
        <Campo
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {error && <Alerta>{error}</Alerta>}
        <Boton type="submit" cargando={cargando}>
          Entrar
        </Boton>
        <p className="text-center text-xs text-foreground/60">
          ¿Primera vez? Tu clave temporal son los 6 dígitos antes del guion de tu RUT.
        </p>
      </form>
    </main>
  );
}
