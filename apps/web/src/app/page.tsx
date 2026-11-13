import { ApiStatus } from './api-status';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-usm-azul px-4 text-center text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-usm-amarillo">
        Universidad Técnica Federico Santa María
      </p>
      <h1 className="text-4xl font-semibold sm:text-5xl">Portal Staff Promoción</h1>
      <p className="max-w-md text-usm-celeste/80">
        En construcción. Revisa el roadmap del proyecto en GitHub.
      </p>
      <ApiStatus />
    </main>
  );
}
