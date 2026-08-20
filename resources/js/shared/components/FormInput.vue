<script setup>
import FormField from './FormField.vue';

/* FormInput — input teks berlabel (v-model). Mendukung type standar HTML. */
defineProps({
    modelValue: { type: [String, Number], default: '' },
    label: { type: String, required: true },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: '' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <FormField :label="label" :error="error" :hint="hint" :required="required">
        <template #default="{ fieldId }">
            <input
                :id="fieldId"
                :type="type"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :aria-invalid="!!error || undefined"
                class="block w-full rounded-md border text-sm shadow-sm min-h-10 focus:border-brand-500 focus:ring-brand-500 disabled:bg-light disabled:text-slate-400"
                :class="error ? 'border-danger-500' : ''"
                @input="emit('update:modelValue', $event.target.value)"
            />
        </template>
    </FormField>
</template>
