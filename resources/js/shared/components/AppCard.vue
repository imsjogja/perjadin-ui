<script setup>
/*
 * AppCard — container permukaan putih dengan header/footer opsional.
 * Slot: header, default, footer. Atau judul sederhana via prop `title`.
 */
defineProps({
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    padded: { type: Boolean, default: true },
});
</script>

<template>
    <section class="card">
        <header v-if="title || $slots.header" class="flex items-center justify-between gap-4 border-b px-4 py-3">
            <div>
                <slot name="header">
                    <h3 class="text-sm font-bold text-dark">{{ title }}</h3>
                    <p v-if="subtitle" class="mt-0.5 text-xs text-slate-500">{{ subtitle }}</p>
                </slot>
            </div>
            <slot name="actions" />
        </header>
        <div :class="padded ? 'p-4' : ''">
            <slot />
        </div>
        <footer v-if="$slots.footer" class="border-t px-4 py-3">
            <slot name="footer" />
        </footer>
    </section>
</template>
