import fp from 'fastify-plugin'
import cors from '@fastify/cors'

export default fp(async (app) => {
  await app.register(cors, {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
})