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
        path: '/pegawai',
        name: 'pegawai.index',
        component: () => import('./contexts/perjadin/pages/PegawaiIndex.vue'),
        meta: { title: 'Cari Pegawai' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: 'is-active',
});

router.beforeEach((to) => {
    const { isAuthenticated } = useAuth();

    if (!to.meta.public && !isAuthenticated.value) return { name: 'login' };
    if (to.name === 'login' && isAuthenticated.value) return { name: 'dashboard.index' };

    return true;
});

export default router;
