<script setup>
import { InboxIcon } from '@heroicons/vue/24/outline';

/* EmptyState — tampilan saat data kosong, dengan aksi opsional. */
defineProps({
    title: { type: String, default: 'Belum ada data' },
    message: { type: String, default: '' },
});
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <InboxIcon class="h-10 w-10 text-slate-300" aria-hidden="true" />
        <p class="text-sm font-semibold text-dark">{{ title }}</p>
        <p v-if="message" class="max-w-sm text-xs text-slate-500">{{ message }}</p>
        <div v-if="$slots.default" class="mt-2"><slot /></div>
    </div>
</template>
