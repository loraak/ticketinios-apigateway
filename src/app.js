import corsPlugin from './plugins/cors.js'
import jwtPlugin from './plugins/jwt.js'
import rateLimitPlugin from './plugins/rateLimit.js'
import httpProxy from '@fastify/http-proxy'
import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { authHook } from './hooks/authHook.js'

export async function buildApp() {
  const app = Fastify({ logger: true })

  app.addHook('preHandler', async (request, reply) => {
    delete request.headers['origin']
    delete request.headers['referer']
  })

  app.addHook('onRequest', async (request, reply) => {
    console.log('=== REQUEST ===')
    console.log('URL:', request.url)
    console.log('Method:', request.method)
    console.log('Origin:', request.headers.origin)
    console.log('===============')
  })

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
        { url: '/docs-json/grupos', name: 'Grupos Service' }
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

  app.get('/docs-json/grupos', async (request, reply) => {
    try {
      const response = await fetch(`${process.env.GRUPOS_SERVICE_URL}/v3/api-docs`)
      return reply.send(await response.json())
    } catch {
      return reply.code(502).send({ error: 'Grupos service no disponible' })
    }
  })

  // Guard JWT — /api/grupos queda protegido automáticamente
  await authHook(app);

  // Proxies
  await app.register(httpProxy, {
    upstream: process.env.AUTH_SERVICE_URL,
    prefix: '/api/auth',
    rewritePrefix: '/api/auth',
  })

  await app.register(httpProxy, {
    upstream: process.env.GRUPOS_SERVICE_URL,
    prefix: '/api/grupos',
    rewritePrefix: '/api/grupos',
  })

  await app.register(httpProxy, {
    upstream: process.env.TICKETS_SERVICE_URL,
    prefix: '/api/tickets',
    rewritePrefix: '/api/tickets',
})

  return app
}