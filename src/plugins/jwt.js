import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

export default fp(async (app) => {
  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
  })

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({
        statusCode: 401,
        intOpCode: 'API-GATEWAY-UNAUTHORIZED',
        data: [],
      })
    }
  })
})