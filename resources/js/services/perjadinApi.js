const baseUrl = (import.meta.env.VITE_PERJADIN_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

function token() {
    return localStorage.getItem('perjadin.access_token');
}

function queryString(params = {}) {
    const query = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    );

    return query.size ? `?${query}` : '';
}

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
            ...options.headers,
        },
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) localStorage.removeItem('perjadin.access_token');
        throw new ApiError(payload.message ?? 'Permintaan tidak dapat diproses.', response.status, payload.errors ?? {});
    }

    return payload;
}

export const perjadinApi = {
    login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    spts: (params) => request(`/spts${queryString(params)}`),
    spt: (id) => request(`/spts/${id}`),
    createSpt: (payload) => request('/spts', { method: 'POST', body: JSON.stringify(payload) }),
    pegawai: (params) => request(`/references/pegawai${queryString(params)}`),
    assignees: (sptId) => request(`/spts/${sptId}/assignees`),
    addAssignees: (sptId, nips) => request(`/spts/${sptId}/assignees`, {
        method: 'POST',
        body: JSON.stringify({ nips }),
    }),
    createSppd: (sptId, payload) => request(`/spts/${sptId}/sppds`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    verifySppd: (sppdId) => request(`/sppds/${sppdId}/verification`, { method: 'PATCH' }),
};
