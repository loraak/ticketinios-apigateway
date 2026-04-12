export const permissionsMap = [
    // Perfil
    { method: 'PUT',    path: '/api/auth/update',              permission: 'perfil:editar' },
    { method: 'PATCH',  path: '/api/auth/baja',                permission: 'perfil:eliminar' },

    // Usuarios — específicas primero
    { method: 'PUT',    path: '/api/usuarios/', contains: '/permisos', permission: 'usuarios:gestionar_permisos' },
    { method: 'PATCH',  path: '/api/usuarios/', contains: '/baja',     permission: 'usuarios:eliminar' },
    { method: 'PATCH',  path: '/api/usuarios/', contains: '/activar',  permission: 'usuarios:eliminar' },
    { method: 'GET',    path: '/api/usuarios/permisos',        permission: 'usuarios:ver' },
    { method: 'GET',    path: '/api/usuarios',                 permission: 'usuarios:ver' },
    { method: 'PUT',    path: '/api/usuarios/',                permission: 'usuarios:editar' },

    // Auth — específicas primero
    { method: 'GET',    path: '/api/auth/usuarios',            permission: 'usuarios:ver' },

    // Gestión de grupos — específicas primero
    { method: 'GET',    path: '/api/grupos/admin',             permission: 'gestionarGrupos:ver' },
    { method: 'PATCH',  path: '/api/grupos/admin/',            permission: 'gestionarGrupos:eliminar' },
    { method: 'POST',   path: '/api/grupos/', contains: '/miembros',   permission: 'gestionarGrupos:agregar_usuario' },
    { method: 'DELETE', path: '/api/grupos/', contains: '/miembros',   permission: 'gestionarGrupos:agregar_usuario' },
    { method: 'PUT',    path: '/api/grupos/', contains: '/permisos',   permission: 'gestionarGrupos:modificar_permisos' },

    // Grupos — generales después
    { method: 'GET',    path: '/api/grupos',                   permission: 'grupos:ver' },
    { method: 'POST',   path: '/api/grupos',                   permission: 'grupos:crear' },
    { method: 'PUT',    path: '/api/grupos/',                  permission: 'grupos:editar' },
    { method: 'PATCH',  path: '/api/grupos/',                  permission: 'grupos:eliminar' },

    // Tickets — específicas primero
    { method: 'GET',    path: '/api/tickets/', contains: '/comentarios', permission: 'tickets:comentario' },
    { method: 'POST',   path: '/api/tickets/', contains: '/comentarios', permission: 'tickets:comentario' },
    { method: 'GET',    path: '/api/tickets/', contains: '/historial',   permission: 'tickets:ver' },
    { method: 'GET',    path: '/api/tickets/estadisticas',     permission: 'tickets:ver' },
    { method: 'GET',    path: '/api/tickets',                  permission: 'tickets:ver' },
    { method: 'POST',   path: '/api/tickets',                  permission: 'tickets:crear' },
    { method: 'PUT',    path: '/api/tickets/',                 permission: 'tickets:editar' },
    { method: 'PATCH',  path: '/api/tickets/',                 permission: 'tickets:editar' },
    { method: 'DELETE', path: '/api/tickets/',                 permission: 'tickets:eliminar' },
];