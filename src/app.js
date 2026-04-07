import Fastify from 'fastify'
import corsPlugin from './plugins/cors.js'
import jwtPlugin from './plugins/jwt.js'
import rateLimitPlugin from './plugins/rateLimit.js'
import httpProxy from '@fastify/http-proxy'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(rateLimitPlugin)

  // Rutas públicas primero
  app.get('/health', async () => ({ status: 'ok', gateway: 'fastify' }))

  await app.register(httpProxy, {
    upstream: process.env.AUTH_SERVICE_URL,
    prefix: '/api/auth',
    rewritePrefix: '/api/auth',
  })

  app.addHook('onRequest', async (request, reply) => {
    const publicPaths = ['/api/auth/login', '/api/auth/register', '/health']
    const isPublic = publicPaths.some(p => request.url.startsWith(p))
    if (!isPublic) {
      await app.authenticate(request, reply)
    }
  })

  return app
}