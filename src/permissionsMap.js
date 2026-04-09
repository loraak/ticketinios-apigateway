export const permissionsMap = [
    // Perfil 
    { method: 'PUT', path:'/api/auth/update/', permission: 'perfil:editar' },
    { method: 'PATCH', path:'/api/auth/baja/', permission: 'perfil:eliminar' },
    // Grupos
    { method: 'GET',    path: '/api/grupos',    permission: 'grupos:ver' },
    { method: 'POST',   path: '/api/grupos',    permission: 'grupos:crear' },
    { method: 'PUT',    path: '/api/grupos/',   permission: 'grupos:editar' },
    { method: 'PATCH', path: '/api/grupos/',   permission: 'grupos:eliminar' },
];