<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import AppButton from './AppButton.vue';

/* ErrorState — tampilan kegagalan memuat data dengan tombol coba lagi. */
defineProps({
    title: { type: String, default: 'Gagal memuat data' },
    message: { type: String, default: 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.' },
});

const emit = defineEmits(['retry']);
</script>

<template>
    <div class="flex flex-col items-center justify-center gap-2 py-10 text-center" role="alert">
        <ExclamationTriangleIcon class="h-10 w-10 text-danger-500" aria-hidden="true" />
        <p class="text-sm font-semibold text-dark">{{ title }}</p>
        <p class="max-w-sm text-xs text-slate-500">{{ message }}</p>
        <AppButton variant="secondary" size="sm" class="mt-2" @click="emit('retry')">Coba lagi</AppButton>
    </div>
</template>
