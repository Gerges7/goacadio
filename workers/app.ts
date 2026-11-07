import { createRequestHandler } from 'react-router';
import { secureResponse } from './security';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
);

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const response = await requestHandler(request, { cloudflare: { env, ctx } });
    return secureResponse(request, response);
  },
};
