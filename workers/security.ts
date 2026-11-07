/** Security defaults for GoAcadio Workers responses.
 * Does not alter response bodies, authentication headers or Set-Cookie.
 * Keep indexing controls for public pages in route metadata until launch review.
 */

// All student/workspace routes can return personalized HTML after login.
const PRIVATE_PREFIXES = [
  '/account', '/admin', '/auth', '/dashboard', '/planner', '/study-stats',
  '/ai-study', '/quiz-generator', '/quiz-history', '/revision',
];

export function isPrivatePath(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/') ||
    PRIVATE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
}

export function secureResponse(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  const contentType = headers.get('Content-Type')?.toLowerCase() ?? '';
  const html = contentType.includes('text/html');
  const pathname = new URL(request.url).pathname;
  const isPrivate = isPrivatePath(pathname);

  if (html) {
    // Avoid clickjacking without imposing an app-wide script CSP that could break hydration.
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  }
  if (isPrivate) {
    headers.set('Cache-Control', 'private, no-store, max-age=0');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  // A fresh Response makes headers writable even if the upstream response is immutable.
  // Headers(response.headers) preserves any Set-Cookie and Vary entries.
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
