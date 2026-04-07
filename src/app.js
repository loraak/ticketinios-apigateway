import corsPlugin from './plugins/cors.js'
import jwtPlugin from './plugins/jwt.js'
import rateLimitPlugin from './plugins/rateLimit.js'
import httpProxy from '@fastify/http-proxy'
import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

export async function buildApp() {
  const app = Fastify({ logger: true })

  // 1. Plugins globales
  await app.register(corsPlugin)
  await app.register(jwtPlugin)
  await app.register(rateLimitPlugin)

  // 2. Swagger — antes de cualquier ruta
  await app.register(fastifySwagger, {
    mode: 'dynamic',
    openapi: {
      info: {
        title: 'API Gateway',
        version: '1.0.0',
      }
    }
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      urls: [
        { url: '/docs-json/auth', name: 'Auth Service' }
      ],
      urls_primary_name: 'Auth Service'
    }
  })

  // 3. Rutas propias del gateway
  app.get('/health', async () => ({ status: 'ok', gateway: 'fastify' }))

  app.get('/docs-json/auth', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.AUTH_SERVICE_URL}/v3/api-docs`)
      return reply.send(await response.json())
    } catch {
      return reply.code(502).send({ error: 'Auth service no disponible' })
    }
  })

  // 4. Proxies
  await app.register(httpProxy, {
    upstream: process.env.AUTH_SERVICE_URL,
    prefix: '/api/auth',
    rewritePrefix: '/api/auth',
  })

  // 5. Guard JWT al final
  app.addHook('onRequest', async (request, reply) => {
    const publicPaths = [
      '/api/auth/login',
      '/api/auth/register',
      '/health',
      '/docs',
      '/docs-json/auth',
    ]
    const isPublic = publicPaths.some(p => request.url.startsWith(p))
    if (!isPublic) {
      await app.authenticate(request, reply)
    }
  })

  return app
}