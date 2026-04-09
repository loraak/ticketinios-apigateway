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
            request.url.startsWith(r.path)
        );

        console.log('method:', request.method);
        console.log('url:', request.url);
        console.log('regla encontrada:', regla);
        console.log('permisos usuario:', permisos);console.log('match?', '/api/auth/update/c083829d-1551-45ea-80ae-41222059e4d0'.startsWith('/api/auth/update/'));

        if (regla && !permisos.includes(regla.permission)) {
            return reply.code(403).send({
                statusCode: 403,
                intOpCode: 'GW-FORBIDDEN',
                message: `Permiso requerido: ${regla.permission}`
            });
        }
    });
}