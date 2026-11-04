import { createRequestHandler } from 'react-router';

// No database/AI secrets or bindings are needed for the browser-local V1 prototype.
const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

export default {
  fetch(request: Request, env: unknown, ctx: unknown) {
    return requestHandler(request, { cloudflare: { env, ctx } });
  },
};
