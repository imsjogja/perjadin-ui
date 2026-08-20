/*
 * Mapping status dokumen perjalanan ke warna token.
 * Dipakai oleh StatusBadge, DataTable, dan ChartPanel agar konsisten.
 */
export const statusColors = {
    draft: { label: 'Draf', color: 'warning' },
    verified: { label: 'Terverifikasi', color: 'success' },
    rejected: { label: 'Ditolak', color: 'danger' },
    cancelled: { label: 'Dibatalkan', color: 'neutral' },
};

// Varian warna netral memakai slate agar tidak menambah token baru
export const badgeClasses = {
    success: 'bg-success-50 text-success-700 ring-success-600/20',
    warning: 'bg-warning-50 text-warning-700 ring-warning-600/20',
    danger: 'bg-danger-50 text-danger-700 ring-danger-600/20',
    info: 'bg-info-50 text-info-700 ring-info-600/20',
    neutral: 'bg-light text-slate-600 ring-slate-500/20',
    brand: 'bg-brand-50 text-brand-700 ring-brand-600/20',
};

export function resolveStatusColor(status) {
    return statusColors[status]?.color ?? 'neutral';
}
