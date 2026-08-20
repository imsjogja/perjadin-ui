import { reactive, readonly } from 'vue';

/*
 * Mock permission store — nanti diganti data permission dari backend
 * (Spatie permission via Inertia shared props / endpoint API).
 * Nilai '*' berarti super-admin (semua permission lolos).
 */
const state = reactive({
    permissions: ['*'],
});

export function usePermissions() {
    function can(permission) {
        if (!permission) return true;
        return state.permissions.includes('*') || state.permissions.includes(permission);
    }

    // Utilitas untuk simulasi pergantian role saat development
    function setPermissions(list) {
        state.permissions.splice(0, state.permissions.length, ...list);
    }

    return {
        permissions: readonly(state.permissions),
        can,
        setPermissions,
    };
}
