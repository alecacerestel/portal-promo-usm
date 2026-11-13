import { NextResponse, type NextRequest } from "next/server";

const PUBLICAS = ["/login"];

/**
 * Chequeo optimista: si no hay cookie de sesión, manda al login.
 * La verificación real la hace la API en cada request.
 */
export function proxy(request: NextRequest) {
  const tieneSesion = request.cookies.has("sesion");
  const esPublica = PUBLICAS.includes(request.nextUrl.pathname);

  if (!tieneSesion && !esPublica) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (tieneSesion && esPublica) {
    return NextResponse.redirect(new URL("/inicio", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Todo menos la API, archivos estáticos e imágenes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
