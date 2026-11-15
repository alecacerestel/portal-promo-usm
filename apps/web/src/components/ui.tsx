import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';

export function Campo({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <input
        {...props}
        className="rounded-lg border border-usm-azul/20 bg-white px-3 py-2.5 text-base font-normal text-foreground outline-none transition focus:border-usm-azul-medio focus:ring-2 focus:ring-usm-azul-medio/30 dark:border-white/15 dark:bg-white/5"
      />
      {error && <span className="text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}

export function Selector({
  label,
  opciones,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; opciones: Record<string, string> }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      <select
        {...props}
        className="rounded-lg border border-usm-azul/20 bg-white px-3 py-2.5 text-base font-normal dark:border-white/15 dark:bg-white/5"
      >
        {Object.entries(opciones).map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Boton({
  cargando,
  children,
  variante = 'primario',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  cargando?: boolean;
  variante?: 'primario' | 'secundario';
}) {
  const estilos =
    variante === 'primario'
      ? 'bg-usm-azul text-white hover:bg-usm-azul-medio'
      : 'border border-usm-azul/20 text-usm-azul hover:bg-usm-celeste dark:border-white/20 dark:text-usm-celeste dark:hover:bg-white/10';
  return (
    <button
      {...props}
      disabled={cargando || props.disabled}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${estilos} ${props.className ?? ''}`}
    >
      {cargando ? 'Cargando…' : children}
    </button>
  );
}

export function Alerta({
  tipo = 'error',
  children,
}: {
  tipo?: 'error' | 'exito';
  children: ReactNode;
}) {
  const estilos =
    tipo === 'error'
      ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
      : 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100';
  return <div className={`rounded-lg border px-3 py-2.5 text-sm ${estilos}`}>{children}</div>;
}
