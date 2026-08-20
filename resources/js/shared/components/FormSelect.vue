<script setup>
import { computed, ref } from 'vue';
import FormField from './FormField.vue';

/*
 * FormSelect — select berlabel dengan mode pencarian.
 * Mode `searchable: true` = AJAX-ready: saat prop `endpoint` diisi nanti,
 * ketikan pengguna memicu event `search` (debounce 300ms) agar opsi diambil
 * dari server. Untuk sekarang,
 * pencarian memfilter opsi lokal.
 */
const props = defineProps({
    modelValue: { type: [String, Number, null], default: '' },
    label: { type: String, required: true },
    options: { type: Array, default: () => [] }, // [{ value, label }]
    placeholder: { type: String, default: 'Pilih…' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    endpoint: { type: String, default: '' }, // diisi nanti untuk mode AJAX
});

const emit = defineEmits(['update:modelValue', 'search']);

const keyword = ref('');
let debounceTimer = null;

function onSearch(value) {
    keyword.value = value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        // Mode AJAX: emit ke parent untuk fetch opsi dari `endpoint`
        emit('search', value);
    }, 300);
}

const filteredOptions = computed(() => {
    if (!props.searchable || !keyword.value || props.endpoint) return props.options;
    const q = keyword.value.toLowerCase();
    return props.options.filter((o) => String(o.label).toLowerCase().includes(q));
});
</script>

<template>
    <FormField :label="label" :error="error" :hint="hint" :required="required">
        <template #default="{ fieldId }">
            <div class="flex flex-col gap-1">
                <input
                    v-if="searchable"
                    type="search"
                    :value="keyword"
                    placeholder="Ketik untuk mencari…"
                    aria-label="Cari opsi"
                    class="block w-full rounded-md border text-sm shadow-sm min-h-10 focus:border-brand-500 focus:ring-brand-500"
                    @input="onSearch($event.target.value)"
                />
                <select
                    :id="fieldId"
                    :value="modelValue"
                    :disabled="disabled"
                    :aria-invalid="!!error || undefined"
                    class="block w-full rounded-md border text-sm shadow-sm min-h-10 focus:border-brand-500 focus:ring-brand-500 disabled:bg-light disabled:text-slate-400"
                    :class="error ? 'border-danger-500' : ''"
                    @change="emit('update:modelValue', $event.target.value)"
                >
                    <option value="">{{ placeholder }}</option>
                    <option v-for="opt in filteredOptions" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </select>
            </div>
        </template>
    </FormField>
</template>
