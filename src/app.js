import corsPlugin from './plugins/cors.js'
import jwtPlugin from './plugins/jwt.js'
import rateLimitPlugin from './plugins/rateLimit.js'
import httpProxy from '@fastify/http-proxy'
import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export async function buildApp() {
  const app = Fastify({ logger: true })

  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(rateLimitPlugin)

  await app.register(fastifySwagger, {
    mode: 'dynamic',
    openapi: { info: { title: 'API Gateway', version: '1.0.0' } }
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      urls: [
        { url: '/docs-json/auth',   name: 'Auth Service' },
        { url: '/docs-json/grupos', name: 'Grupos Service' } // ← agrega esto
      ],
      urls_primary_name: 'Auth Service'
    }
  })

  app.get('/health', async () => ({ status: 'ok', gateway: 'fastify' }))

  app.get('/docs-json/auth', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}/v3/api-docs`)
      return reply.send(await response.json())
    } catch {
      return reply.code(502).send({ error: 'Auth service no disponible' })
    }
  })

  // ← Agrega el docs de grupos
  app.get('/docs-json/grupos', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.GRUPOS_SERVICE_URL}/v3/api-docs`)
      return reply.send(await response.json())
    } catch {
      return reply.code(502).send({ error: 'Grupos service no disponible' })
    }
  })

  // Proxies
  await app.register(httpProxy, {
    upstream: process.env.AUTH_SERVICE_URL,
    prefix: '/api/auth',
    rewritePrefix: '/api/auth',
  })

  // ← Agrega el proxy de grupos
  await app.register(httpProxy, {
    upstream: process.env.GRUPOS_SERVICE_URL,
    prefix: '/api/grupos',
    rewritePrefix: '/api/grupos',
  })

  // Guard JWT — /api/grupos queda protegido automáticamente
  app.addHook('onRequest', async (request, reply) => {
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/health',
      '/docs',
      '/docs-json/auth',
      '/docs-json/grupos',
    ]
    const isPublic = publicPaths.some(p => request.url.startsWith(p))
    if (!isPublic) {
      await app.authenticate(request, reply)
    }
  })

  return app
}