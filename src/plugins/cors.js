import fp from 'fastify-plugin'
import cors from '@fastify/cors'

export default fp(async (app) => {
  await app.register(cors, {
    origin: [
      'https://ticketinios-bz4j-jul2pujsh-loros-projects-e0f80d4b.vercel.app',
      'http://localhost:3000',   
      'http://localhost:8081',  // Swagger Auth
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
})