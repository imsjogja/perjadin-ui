<script setup>
import { watch } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

/*
 * AppModal — dialog modal dengan backdrop; tutup via tombol X, backdrop, atau Escape.
 * v-model:open untuk kontrol visibilitas.
 */
const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    maxWidth: { type: String, default: 'max-w-lg' },
});

const emit = defineEmits(['update:open', 'close']);

function close() {
    emit('update:open', false);
    emit('close');
}

function onKeydown(e) {
    if (e.key === 'Escape' && props.open) close();
}

watch(
    () => props.open,
    (open) => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) document.addEventListener('keydown', onKeydown);
        else document.removeEventListener('keydown', onKeydown);
    },
);
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="open"
                class="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 p-4"
                role="dialog"
                aria-modal="true"
                :aria-label="title || 'Dialog'"
                @click.self="close"
            >
                <div class="w-full rounded-lg bg-surface shadow-lg" :class="maxWidth">
                    <header class="flex items-center justify-between border-b px-4 py-3">
                        <h3 class="text-sm font-bold text-dark">{{ title }}</h3>
                        <button
                            type="button"
                            class="min-h-10 min-w-10 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-light"
                            aria-label="Tutup dialog"
                            @click="close"
                        >
                            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
                        </button>
                    </header>
                    <div class="p-4">
                        <slot />
                    </div>
                    <footer v-if="$slots.footer" class="flex justify-end gap-2 border-t px-4 py-3">
                        <slot name="footer" />
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
