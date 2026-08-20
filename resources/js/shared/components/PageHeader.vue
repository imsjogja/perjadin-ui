<script setup>
/* PageHeader — judul halaman + breadcrumb sederhana + slot aksi kanan. */
defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
});
</script>

<template>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
            <h1 class="text-lg font-bold text-dark">{{ title }}</h1>
            <p v-if="subtitle" class="mt-0.5 text-sm text-slate-500">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.default" class="flex items-center gap-2"><slot /></div>
    </div>
</template>
