import { NextResponse, type NextRequest } from 'next/server';

/** Borra una cookie de sesión inválida y manda al login (evita el rebote login ↔ inicio del proxy). */
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', request.url));
  res.cookies.delete('sesion');
  return res;
}
