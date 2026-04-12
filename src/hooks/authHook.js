// hooks/authHook.js
import { permissionsMap } from '../permissionsMap.js'

export async function authHook(app) {
    app.addHook('onRequest', async (request, reply) => {
        const publicPaths = [
            '/api/auth/login',
            '/api/auth/register',
            '/health',
            '/docs',
            '/docs-json/auth',
            '/docs-json/grupos',
            '/docs-json/tickets'
        ];

        const isPublic = publicPaths.some(p => request.url.startsWith(p));
        if (isPublic) return;

        // 1 — Valida el token
        await app.authenticate(request, reply);

        const userId = request.user?.sub;
        if (userId) {
            request.headers['x-user-id'] = userId;
        }

        // 2 — Extrae permisos del payload
        const permisos = request.user?.permisos ?? [];

        // 3 — Busca si la ruta requiere un permiso
        const regla = permissionsMap.find(r =>
            r.method === request.method &&
            request.url.startsWith(r.path) &&
            (!r.pathContains || request.url.includes(r.pathContains))
        );

        const authHeader = request.headers['authorization'];
        if (authHeader) {
            request.headers['x-gateway-token'] = authHeader;
        }

        console.log('method:', request.method);
        console.log('url:', request.url);
        console.log('token:', request.headers['authorization']?.substring(0, 30));
        console.log('regla:', regla);
        console.log('permisos:', permisos);

        if (regla && !permisos.includes(regla.permission)) {
            return reply.code(403).send({
                statusCode: 403,
                intOpCode: 'GW-FORBIDDEN',
                data: [{ message: `Permiso requerido: ${regla.permission}` }] // ← formato consistente
            });
        }
    });
}