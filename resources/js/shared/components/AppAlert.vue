<script setup>
import { computed } from 'vue';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
} from '@heroicons/vue/24/outline';

/* AppAlert — pesan inline (info/success/warning/danger), bisa ditutup. */
const props = defineProps({
    type: { type: String, default: 'info' },
    dismissible: { type: Boolean, default: false },
});

const emit = defineEmits(['dismiss']);

const config = computed(() => {
    const map = {
        info: { wrap: 'bg-info-50 text-info-700 ring-info-600/20', icon: InformationCircleIcon },
        success: { wrap: 'bg-success-50 text-success-700 ring-success-600/20', icon: CheckCircleIcon },
        warning: { wrap: 'bg-warning-50 text-warning-700 ring-warning-600/20', icon: ExclamationTriangleIcon },
        danger: { wrap: 'bg-danger-50 text-danger-700 ring-danger-600/20', icon: XCircleIcon },
    };
    return map[props.type] ?? map.info;
});
</script>

<template>
    <div
        role="alert"
        class="flex items-start gap-3 rounded-md px-4 py-3 text-sm ring-1 ring-inset"
        :class="config.wrap"
    >
        <component :is="config.icon" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div class="flex-1"><slot /></div>
        <button
            v-if="dismissible"
            type="button"
            class="min-h-10 min-w-10 -my-2 -mr-2 inline-flex items-center justify-center rounded-md hover:bg-black/5"
            aria-label="Tutup pesan"
            @click="emit('dismiss')"
        >
            <XCircleIcon class="h-5 w-5" aria-hidden="true" />
        </button>
    </div>
</template>
