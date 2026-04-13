import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

export default fp(async (app) => {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',

    keyGenerator: (request) => {
      const user = request.user
      return user?.id ?? request.ip
    },

    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      intOpCode: 'API-GATEWAY-TOO-MANY-REQUESTS',
      data: [{
        message: 'Too many requests',
        limite: context.max,
        ventana: '1 minuto',
        reintentar_en: `${Math.ceil(context.ttl / 1000)} segundos`
      }]
    })
  })
})