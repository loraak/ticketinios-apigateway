import fp from 'fastify-plugin'

const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL ?? 'http://127.0.0.1:3004'
const GATEWAY_KEY = process.env.GATEWAY_KEY ?? ''

const IGNORAR = ['/health', '/docs', '/docs-json']

async function enviar(path, body) {
    fetch(`${LOGS_SERVICE_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-gateway-key': GATEWAY_KEY
        },
        body: JSON.stringify(body)
    }).catch(err => console.error('[logger] Error enviando log:', err))
}

export default fp(async (app) => {

    app.addHook('onRequest', async (request) => {
        request.startTime = Date.now()
    })

    app.addHook('onResponse', async (request, reply) => {
        const endpoint = request.url?.split('?')[0] ?? 'unknown'
        if (IGNORAR.some(r => endpoint.startsWith(r))) return

        const duracionMs = Date.now() - (request.startTime || Date.now())
        const usuarioId = request.user?.id ?? null
        const method = request.method
        const statusCode = reply.statusCode
        const ip = request.ip

        // Log de request
        enviar('/logs/request', { endpoint, method, usuarioId, ip, statusCode, duracionMs })

        // Log de error si status >= 400
        if (statusCode >= 400) {
            enviar('/logs/error', {
                endpoint, method, usuarioId, ip, statusCode,
                mensaje: `${method} ${endpoint} respondió ${statusCode}`
            })
        }
    })
})