<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
    Bars3Icon,
    ChevronDownIcon,
    ClipboardDocumentListIcon,
    Cog6ToothIcon,
    DocumentPlusIcon,
    HomeIcon,
    ShieldCheckIcon,
    UserCircleIcon,
    UserGroupIcon,
    UsersIcon,
} from '@heroicons/vue/24/outline';
import menuCatalog from '../shared/menu-catalog.json';
import { resolveIconColor } from '../shared/icon-colors';
import { useAuth } from '../shared/composables/useAuth';

const route = useRoute();
const { can, isAuthenticated, user, logout, refreshUser } = useAuth();
const sidebarOpen = ref(false);
const userOpen = ref(false);

const iconMap = {
    HomeIcon,
    ClipboardDocumentListIcon,
    DocumentPlusIcon,
    UsersIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    Cog6ToothIcon,
};

const pageTitle = computed(() => route.meta?.title ?? 'Perjadin');
const visibleMenuCatalog = computed(() =>
    menuCatalog
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => can(item.permission)),
        }))
        .filter((section) => section.items.length > 0),
);

function iconFor(name) {
    return iconMap[name] ?? ClipboardDocumentListIcon;
}

async function signOut() {
    await logout();
    userOpen.value = false;
}

onMounted(async () => {
    if (!isAuthenticated.value) return;

    try {
        await refreshUser();
    } catch {
        // Kegagalan autentikasi sudah ditangani pada composable sesi.
    }
});
</script>

<template>
    <div class="min-h-screen">
        <header class="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 bg-gradient-brand-glass px-4 text-white shadow-md backdrop-blur">
            <button
                type="button"
                class="min-h-10 min-w-10 inline-flex items-center justify-center rounded-md text-slate-200 hover:bg-white/10 md:hidden"
                aria-label="Buka menu navigasi"
                @click="sidebarOpen = true"
            >
                <Bars3Icon class="h-6 w-6" aria-hidden="true" />
            </button>

            <RouterLink :to="{ name: 'dashboard.index' }" class="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-white/10">
                <span class="flex h-8 w-8 items-center justify-center rounded-md bg-white p-0.5 ring-1 ring-white/25">
                    <img src="/logo-pabar.png" alt="Lambang Provinsi Papua Barat" class="h-full w-full object-contain" />
                </span>
                <span class="text-sm font-bold">PERJADIN</span>
            </RouterLink>
            <h1 class="hidden truncate border-l border-white/20 pl-3 text-sm font-semibold sm:block">{{ pageTitle }}</h1>

            <div class="relative ml-auto">
                <button
                    type="button"
                    class="min-h-10 inline-flex items-center gap-2 rounded-md px-2 text-slate-200 hover:bg-white/10"
                    aria-label="Menu pengguna"
                    :aria-expanded="userOpen"
                    @click="userOpen = !userOpen"
                >
                    <UserCircleIcon class="h-6 w-6" aria-hidden="true" />
                    <span class="hidden text-sm font-semibold lg:block">{{ user?.name ?? 'Pengguna' }}</span>
                    <ChevronDownIcon class="hidden h-4 w-4 lg:block" aria-hidden="true" />
                </button>
                <div v-if="userOpen" class="absolute right-0 mt-1 w-48 rounded-md border bg-surface text-dark shadow-lg" role="menu">
                    <p class="border-b px-3 py-2 text-xs text-slate-500">{{ user?.email ?? 'Sesi lokal' }}</p>
                    <button type="button" class="min-h-10 w-full px-3 text-left text-sm hover:bg-light" role="menuitem" @click="signOut">
                        Keluar
                    </button>
                </div>
            </div>
        </header>

        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-dark/50 md:hidden" aria-hidden="true" @click="sidebarOpen = false" />
        </Transition>

        <aside
            class="fixed bottom-0 left-0 top-14 z-30 flex w-60 flex-col border-r bg-surface transition-transform md:translate-x-0"
            :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
            aria-label="Navigasi utama"
        >
            <nav class="flex-1 overflow-y-auto p-2">
                <div v-for="section in visibleMenuCatalog" :key="section.section" class="mb-4">
                    <p class="px-3 py-2 text-xs font-bold uppercase tracking-wide text-menu-header">{{ section.section }}</p>
                    <RouterLink
                        v-for="item in section.items"
                        :key="item.route"
                        :to="{ name: item.route }"
                        class="mb-1 flex min-h-10 items-center gap-3 rounded-md border-l-[3px] border-l-transparent px-3 text-sm font-semibold text-menu-link hover:bg-menu-hover"
                        :class="route.name === item.route ? 'border-l-brand-500 bg-menu-active text-menu-active-text' : ''"
                        @click="sidebarOpen = false"
                    >
                        <span
                            class="flex h-6 w-6 items-center justify-center rounded"
                            :class="route.name === item.route ? resolveIconColor(item.color).chipActive : resolveIconColor(item.color).chip"
                        >
                            <component :is="iconFor(item.icon)" class="h-4 w-4" aria-hidden="true" />
                        </span>
                        {{ item.label }}
                    </RouterLink>
                </div>
            </nav>
        </aside>

        <div class="min-w-0 pt-14 md:pl-60">
            <main class="p-4 lg:p-6">
                <slot />
            </main>
        </div>

        <AppToast />
    </div>
</template>
