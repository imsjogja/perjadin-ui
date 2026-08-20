<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/outline';
import { resolveIconColor } from '../icon-colors';

/*
 * ModuleCard — kartu modul untuk halaman Module Landing.
 * Chip ikon 40px memakai palet icon.* (tint lembut + glyph strong);
 * hover menaikkan shadow + border aksen; fokus keyboard jelas.
 */
defineProps({
    module: { type: Object, required: true }, // { name, description, icon, color, route }
});
</script>

<template>
    <RouterLink
        :to="{ name: module.route }"
        class="card group flex min-h-16 items-center gap-4 p-4 transition hover:border-brand-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
        <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
            :class="resolveIconColor(module.color).chip"
        >
            <component :is="module.icon" class="h-5 w-5" aria-hidden="true" />
        </span>
        <span class="min-w-0 flex-1">
            <span class="block text-sm font-bold text-dark">{{ module.name }}</span>
            <span class="mt-0.5 block text-xs text-slate-500">{{ module.description }}</span>
        </span>
        <ChevronRightIcon
            class="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-menu-link"
            aria-hidden="true"
        />
    </RouterLink>
</template>
