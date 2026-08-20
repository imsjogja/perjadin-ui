import { computed, reactive } from 'vue';
import { perjadinApi } from '@/services/perjadinApi';

const state = reactive({
    user: JSON.parse(localStorage.getItem('perjadin.user') ?? 'null'),
});

function clearSession() {
    localStorage.removeItem('perjadin.access_token');
    localStorage.removeItem('perjadin.user');
    state.user = null;
}

export function useAuth() {
    function can(permission) {
        if (!permission) return true;

        const permissions = state.user?.role?.permissions ?? [];
        return permissions.includes('*') || permissions.includes(permission);
    }

    async function login(credentials) {
        const result = await perjadinApi.login(credentials);
        localStorage.setItem('perjadin.access_token', result.access_token);
        localStorage.setItem('perjadin.user', JSON.stringify(result.data));
        state.user = result.data;
    }

    async function logout() {
        try {
            await perjadinApi.logout();
        } finally {
            clearSession();
        }
    }

    async function refreshUser() {
        if (!localStorage.getItem('perjadin.access_token')) return;

        try {
            const result = await perjadinApi.me();
            localStorage.setItem('perjadin.user', JSON.stringify(result.data));
            state.user = result.data;
        } catch (exception) {
            if (exception.status === 401) clearSession();
            throw exception;
        }
    }

    return {
        user: computed(() => state.user),
        isAuthenticated: computed(() => Boolean(localStorage.getItem('perjadin.access_token'))),
        login,
        logout,
        refreshUser,
        clearSession,
        can,
    };
}
