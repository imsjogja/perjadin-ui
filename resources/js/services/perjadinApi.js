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
        Object.entries(params)
            .filter(([, value]) => value !== '' && value !== null && value !== undefined)
            .map(([key, value]) => [key, typeof value === 'boolean' ? Number(value) : value]),
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

async function previewPdf(path) {
    // Open the tab before awaiting the API response so browsers do not treat
    // the preview as an unsolicited popup.
    const preview = window.open('', '_blank');

    if (!preview) {
        throw new ApiError('Popup preview diblokir oleh browser. Izinkan popup untuk aplikasi ini.', 0);
    }

    preview.opener = null;

    try {
        const response = await fetch(`${baseUrl}${path}`, {
            headers: {
                Accept: 'application/pdf, application/json',
                ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
            },
        });

        if (!response.ok) {
            if (response.status === 401) localStorage.removeItem('perjadin.access_token');

            const payload = await response.json().catch(() => ({}));
            throw new ApiError(payload.message ?? 'Dokumen tidak dapat dipreview.', response.status, payload.errors ?? {});
        }

        const blobUrl = URL.createObjectURL(await response.blob());
        preview.location.replace(blobUrl);
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 300000);
    } catch (exception) {
        preview.close();

        if (exception instanceof ApiError) throw exception;
        throw new ApiError('Dokumen tidak dapat diakses. Periksa koneksi lalu coba lagi.', 0);
    }
}

export const perjadinApi = {
    login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/me'),
    dashboard: (params) => request(`/dashboard${queryString(params)}`),
    users: () => request('/users'),
    createUser: (payload) => request('/users', { method: 'POST', body: JSON.stringify(payload) }),
    updateUser: (id, payload) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
    roles: () => request('/roles'),
    createRole: (payload) => request('/roles', { method: 'POST', body: JSON.stringify(payload) }),
    updateRole: (id, payload) => request(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    deleteRole: (id) => request(`/roles/${id}`, { method: 'DELETE' }),
    documentNumberFormats: () => request('/settings/document-number-formats'),
    updateDocumentNumberFormats: (payload) => request('/settings/document-number-formats', {
        method: 'PUT',
        body: JSON.stringify(payload),
    }),
    spts: (params) => request(`/spts${queryString(params)}`),
    sptAssigneeOptions: (params) => request(`/spts/filter-options/assignees${queryString(params)}`),
    spt: (id) => request(`/spts/${id}`),
    createSpt: (payload) => request('/spts', { method: 'POST', body: JSON.stringify(payload) }),
    updateSpt: (id, payload) => request(`/spts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    archiveSpt: (id) => request(`/spts/${id}/archive`, { method: 'PATCH' }),
    deleteSpt: (id) => request(`/spts/${id}`, { method: 'DELETE' }),
    units: (params) => request(`/references/units${queryString(params)}`),
    pegawai: (params) => request(`/references/pegawai${queryString(params)}`),
    documentReferences: (type) => request(`/references/${type}`),
    createDocumentReference: (type, payload) => request(`/references/${type}`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    updateDocumentReference: (type, id, payload) => request(`/references/${type}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    }),
    deleteDocumentReference: (type, id) => request(`/references/${type}/${id}`, { method: 'DELETE' }),
    assignees: (sptId) => request(`/spts/${sptId}/assignees`),
    addAssignees: (sptId, nips) => request(`/spts/${sptId}/assignees`, {
        method: 'POST',
        body: JSON.stringify({ nips }),
    }),
    createSppd: (sptId, payload) => request(`/spts/${sptId}/sppds`, {
        method: 'POST',
        body: JSON.stringify(payload),
    }),
    sppd: (id) => request(`/sppds/${id}`),
    updateSppd: (id, payload) => request(`/sppds/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    deleteSppd: (id) => request(`/sppds/${id}`, { method: 'DELETE' }),
    verifySppd: (sppdId) => request(`/sppds/${sppdId}/verification`, { method: 'PATCH' }),
    printSpt: (sptId) => previewPdf(`/spts/${sptId}/print`),
    previewSppd: (sppdId) => previewPdf(`/sppds/${sppdId}/preview`),
    printSppd: (sppdId) => previewPdf(`/sppds/${sppdId}/print`),
    printVisum: (sppdId) => previewPdf(`/sppds/${sppdId}/visum`),
};
