<script setup>
/* LoadingSpinner — indikator muat dengan label aksesibel. */
defineProps({
    label: { type: String, default: 'Memuat data…' },
    size: { type: String, default: 'md' }, // sm|md|lg
});
</script>

<template>
    <div class="flex items-center justify-center gap-3 py-6" role="status">
        <svg
            class="animate-spin text-brand-500"
            :class="{ 'h-5 w-5': size === 'sm', 'h-8 w-8': size === 'md', 'h-12 w-12': size === 'lg' }"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
        <span class="text-sm text-slate-500">{{ label }}</span>
    </div>
</template>
