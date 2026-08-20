<script setup>
import { useToast } from '../composables/useToast';
import AppAlert from './AppAlert.vue';

/*
 * AppToast — container notifikasi toast global.
 * Sudah diregistrasi global di app.js; panggil lewat useToast().
 */
const toast = useToast();
</script>

<template>
    <div
        class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-full flex-col gap-2"
        aria-live="polite"
    >
        <TransitionGroup
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-for="item in toast.items.value" :key="item.id" class="pointer-events-auto shadow-lg">
                <AppAlert :type="item.type" dismissible @dismiss="toast.dismiss(item.id)">
                    {{ item.message }}
                </AppAlert>
            </div>
        </TransitionGroup>
    </div>
</template>
