<script setup>
import FormField from './FormField.vue';

/*
 * FormDatePicker — input tanggal berlabel (native date picker, v-model format YYYY-MM-DD).
 * Nanti bisa diganti pustaka datepicker kustom tanpa mengubah API komponen.
 */
defineProps({
    modelValue: { type: String, default: '' },
    label: { type: String, required: true },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    min: { type: String, default: '' },
    max: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <FormField :label="label" :error="error" :hint="hint" :required="required">
        <template #default="{ fieldId }">
            <input
                :id="fieldId"
                type="date"
                :value="modelValue"
                :min="min || undefined"
                :max="max || undefined"
                :disabled="disabled"
                :aria-invalid="!!error || undefined"
                class="block w-full rounded-md border text-sm shadow-sm min-h-10 focus:border-brand-500 focus:ring-brand-500 disabled:bg-light disabled:text-slate-400"
                :class="error ? 'border-danger-500' : ''"
                @input="emit('update:modelValue', $event.target.value)"
            />
        </template>
    </FormField>
</template>
