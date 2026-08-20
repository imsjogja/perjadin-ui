import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from './shared/composables/useAuth';

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('./contexts/auth/pages/LoginIndex.vue'),
        meta: { public: true, title: 'Masuk' },
    },
    {
        path: '/',
        name: 'dashboard.index',
        component: () => import('./contexts/dashboard/pages/DashboardIndex.vue'),
        meta: { title: 'Dashboard' },
    },
    {
        path: '/spts',
        name: 'spt.index',
        component: () => import('./contexts/perjadin/pages/SptIndex.vue'),
        meta: { title: 'Surat Tugas' },
    },
    {
        path: '/spts/new',
        name: 'spt.create',
        component: () => import('./contexts/perjadin/pages/SptCreate.vue'),
        meta: { title: 'Buat Surat Tugas' },
    },
    {
        path: '/spts/:id/edit',
        name: 'spt.edit',
        component: () => import('./contexts/perjadin/pages/SptCreate.vue'),
        meta: { title: 'Ubah Surat Tugas' },
    },
    {
        path: '/spts/:id',
        name: 'spt.show',
        component: () => import('./contexts/perjadin/pages/SptDetail.vue'),
        meta: { title: 'Detail Surat Tugas' },
    },
    {
        path: '/spts/:id/sppds/new',
        name: 'sppd.create',
        component: () => import('./contexts/perjadin/pages/SppdCreate.vue'),
        meta: { title: 'Buat SPPD' },
    },
    {
        path: '/sppds/:id',
        name: 'sppd.show',
        component: () => import('./contexts/perjadin/pages/SppdDetail.vue'),
        meta: { title: 'Detail SPPD' },
    },
    {
        path: '/sppds/:sppdId/edit',
        name: 'sppd.edit',
        component: () => import('./contexts/perjadin/pages/SppdCreate.vue'),
        meta: { title: 'Ubah Draft SPPD' },
    },
    {
        path: '/pegawai',
        name: 'pegawai.index',
        component: () => import('./contexts/perjadin/pages/PegawaiIndex.vue'),
        meta: { title: 'Cari Pegawai' },
    },
    {
        path: '/administrasi/pengguna',
        name: 'user.index',
        component: () => import('./contexts/administration/pages/UserIndex.vue'),
        meta: { title: 'Manajemen Pengguna', permission: 'users.manage' },
    },
    {
        path: '/administrasi/pengguna/new',
        name: 'user.create',
        component: () => import('./contexts/administration/pages/UserForm.vue'),
        meta: { title: 'Tambah Pengguna', permission: 'users.manage' },
    },
    {
        path: '/administrasi/pengguna/:userId/edit',
        name: 'user.edit',
        component: () => import('./contexts/administration/pages/UserForm.vue'),
        meta: { title: 'Ubah Pengguna', permission: 'users.manage' },
    },
    {
        path: '/administrasi/role',
        name: 'role.index',
        component: () => import('./contexts/administration/pages/RoleIndex.vue'),
        meta: { title: 'Manajemen Role', permission: 'roles.manage' },
    },
    {
        path: '/administrasi/role/new',
        name: 'role.create',
        component: () => import('./contexts/administration/pages/RoleForm.vue'),
        meta: { title: 'Tambah Role', permission: 'roles.manage' },
    },
    {
        path: '/administrasi/role/:roleId/edit',
        name: 'role.edit',
        component: () => import('./contexts/administration/pages/RoleForm.vue'),
        meta: { title: 'Ubah Role', permission: 'roles.manage' },
    },
    {
        path: '/administrasi/format-nomor',
        name: 'document-number-format.index',
        component: () => import('./contexts/administration/pages/DocumentNumberFormat.vue'),
        meta: { title: 'Format Nomor Dokumen', permission: 'settings.manage' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: 'is-active',
});

router.beforeEach((to) => {
    const { can, isAuthenticated } = useAuth();

    if (!to.meta.public && !isAuthenticated.value) return { name: 'login' };
    if (to.name === 'login' && isAuthenticated.value) return { name: 'dashboard.index' };
    if (to.meta.permission && !can(to.meta.permission)) return { name: 'dashboard.index' };

    return true;
});

export default router;
