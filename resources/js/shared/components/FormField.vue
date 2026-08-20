<script setup>
import { computed, useId } from 'vue';

/*
 * FormField — pembungkus label + kontrol + pesan error/bantuan.
 * Memastikan semua kontrol form berlabel. Hubungkan kontrol anak dengan :id="fieldId".
 */
const props = defineProps({
    label: { type: String, required: true },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    forId: { type: String, default: '' },
});

const autoId = useId();
const fieldId = computed(() => props.forId || `field-${autoId}`);
</script>

<template>
    <div class="flex flex-col gap-1">
        <label :for="fieldId" class="text-sm font-semibold text-dark">
            {{ label }}
            <span v-if="required" class="text-danger-500" aria-hidden="true">*</span>
        </label>
        <slot :field-id="fieldId" />
        <p v-if="error" class="text-xs text-danger-600" role="alert">{{ error }}</p>
        <p v-else-if="hint" class="text-xs text-slate-500">{{ hint }}</p>
    </div>
</template>
