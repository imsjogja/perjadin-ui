<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import FormField from './FormField.vue';

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    label: { type: String, required: true },
    options: { type: Array, default: () => [] }, // [{ value, label }]
    placeholder: { type: String, default: 'Ketik untuk mencari…' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    excludedValues: { type: Array, default: () => [] },
    allowCustom: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'search']);

const root = ref(null);
const searchInput = ref(null);
const keyword = ref('');
const isOpen = ref(false);
const knownLabels = ref({});
let debounceTimer = null;

const selectedValues = computed(() => [...new Set(props.modelValue.map((value) => String(value)).filter(Boolean))]);
const selectedSet = computed(() => new Set(selectedValues.value));
const excludedSet = computed(() => new Set(props.excludedValues.map((value) => String(value))));
const selectedOptions = computed(() => selectedValues.value.map((value) => ({
    value,
    label: knownLabels.value[value] ?? value,
})));
const availableOptions = computed(() => props.options.filter((option) => {
    const value = String(option.value);

    return !selectedSet.value.has(value)
        && !excludedSet.value.has(value)
        && (!keyword.value || String(option.label).toLowerCase().includes(keyword.value.toLowerCase()));
}));

function rememberOptions(options) {
    const labels = { ...knownLabels.value };
    options.forEach((option) => {
        labels[String(option.value)] = option.label;
    });
    knownLabels.value = labels;
}

function openMenu() {
    isOpen.value = true;
    nextTick(() => searchInput.value?.focus());
}

function closeMenu() {
    isOpen.value = false;
    keyword.value = '';
}

function search(value) {
    keyword.value = value;
    isOpen.value = true;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => emit('search', value), 300);
}

function selectOption(option) {
    clearTimeout(debounceTimer);
    rememberOptions([option]);
    emit('update:modelValue', [...selectedValues.value, String(option.value)]);
    keyword.value = '';
    isOpen.value = false;
}

function addCustomOption() {
    const value = keyword.value.trim();
    if (!value || selectedSet.value.has(value) || excludedSet.value.has(value)) return;

    emit('update:modelValue', [...selectedValues.value, value]);
    keyword.value = '';
    isOpen.value = false;
}

function removeOption(value) {
    emit('update:modelValue', selectedValues.value.filter((item) => item !== String(value)));
}

function onKeydown(event) {
    if (event.key === 'Escape') closeMenu();
    if (event.key === 'Backspace' && !keyword.value && selectedValues.value.length) {
        removeOption(selectedValues.value.at(-1));
    }
    if (event.key === 'Enter') {
        if (availableOptions.value.length === 1) {
            event.preventDefault();
            selectOption(availableOptions.value[0]);
            return;
        }

        if (props.allowCustom && keyword.value.trim()) {
            event.preventDefault();
            addCustomOption();
        }
    }
}

function onClickOutside(event) {
    if (root.value && !root.value.contains(event.target)) closeMenu();
}

watch(() => props.options, rememberOptions, { immediate: true, deep: true });
onMounted(() => document.addEventListener('pointerdown', onClickOutside));
onBeforeUnmount(() => {
    clearTimeout(debounceTimer);
    document.removeEventListener('pointerdown', onClickOutside);
});
</script>

<template>
    <FormField :label="label" :error="error" :hint="hint" :required="required">
        <template #default="{ fieldId }">
            <div ref="root" class="relative">
                <div
                    class="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500"
                    :class="error ? 'border-danger-500' : ''"
                    @click="openMenu"
                >
                    <span
                        v-for="option in selectedOptions"
                        :key="option.value"
                        class="inline-flex max-w-full items-center gap-1 rounded bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800"
                    >
                        <span class="truncate">{{ option.label }}</span>
                        <button
                            type="button"
                            class="text-brand-700 hover:text-brand-950 focus:outline-none"
                            :aria-label="`Hapus ${option.label}`"
                            :disabled="disabled"
                            @click.stop="removeOption(option.value)"
                        >×</button>
                    </span>
                    <input
                        :id="fieldId"
                        ref="searchInput"
                        v-model="keyword"
                        type="search"
                        class="min-w-36 flex-1 border-0 bg-transparent p-0 text-sm text-dark placeholder:text-slate-400 focus:ring-0"
                        :placeholder="selectedValues.length ? 'Tambah pegawai…' : placeholder"
                        :disabled="disabled"
                        :required="required && !selectedValues.length"
                        autocomplete="off"
                        role="combobox"
                        :aria-controls="`${fieldId}-options`"
                        :aria-expanded="isOpen"
                        :aria-invalid="!!error || undefined"
                        @focus="openMenu"
                        @input="search($event.target.value)"
                        @keydown="onKeydown"
                    />
                </div>
                <div
                    v-if="isOpen"
                    :id="`${fieldId}-options`"
                    role="listbox"
                    class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg"
                >
                    <button
                        v-for="option in availableOptions"
                        :key="option.value"
                        type="button"
                        role="option"
                        class="block w-full px-3 py-2 text-left text-dark hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                        @mousedown.prevent
                        @click="selectOption(option)"
                    >
                        {{ option.label }}
                    </button>
                    <button
                        v-if="allowCustom && keyword.trim() && !selectedSet.has(keyword.trim())"
                        type="button"
                        class="block w-full px-3 py-2 text-left font-semibold text-brand-700 hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                        @mousedown.prevent
                        @click="addCustomOption"
                    >
                        Tambahkan “{{ keyword.trim() }}”
                    </button>
                    <p v-if="!availableOptions.length" class="px-3 py-2 text-slate-500">
                        {{ allowCustom && keyword ? 'Tekan Enter untuk menambahkan.' : keyword ? 'Tidak ada data yang sesuai.' : 'Ketik untuk mencari.' }}
                    </p>
                </div>
            </div>
        </template>
    </FormField>
</template>
