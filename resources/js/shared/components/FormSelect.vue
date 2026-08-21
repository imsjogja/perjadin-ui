<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import FormField from './FormField.vue';

/*
 * FormSelect — select berlabel. Pada mode pencarian, input dan daftar opsi
 * menjadi satu combobox agar pengguna dapat mengetik lalu memilih hasil pada
 * kontrol yang sama.
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
    endpoint: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'search']);

const root = ref(null);
const searchInput = ref(null);
const keyword = ref('');
const isOpen = ref(false);
let debounceTimer = null;

const selectedOption = computed(() => props.options.find((option) => String(option.value) === String(props.modelValue)));

const filteredOptions = computed(() => {
    if (!keyword.value || props.endpoint) return props.options;

    const query = keyword.value.toLowerCase();
    return props.options.filter((option) => String(option.label).toLowerCase().includes(query));
});

function syncKeyword() {
    if (!isOpen.value) {
        keyword.value = selectedOption.value?.label ?? '';
    }
}

function openMenu() {
    if (!isOpen.value) keyword.value = '';
    isOpen.value = true;
    nextTick(() => searchInput.value?.focus());
}

function closeMenu() {
    isOpen.value = false;
    syncKeyword();
}

function onSearch(value) {
    keyword.value = value;
    isOpen.value = true;

    if (props.modelValue !== '' && props.modelValue !== null && value !== selectedOption.value?.label) {
        emit('update:modelValue', '');
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => emit('search', value), 300);
}

function selectOption(option) {
    clearTimeout(debounceTimer);
    emit('update:modelValue', option.value);
    keyword.value = option.label;
    isOpen.value = false;
}

function clearSelection() {
    clearTimeout(debounceTimer);
    emit('update:modelValue', '');
    keyword.value = '';
    openMenu();
}

function onKeydown(event) {
    if (event.key === 'Escape') {
        closeMenu();
    }

    if (event.key === 'Enter' && isOpen.value && filteredOptions.value.length === 1) {
        event.preventDefault();
        selectOption(filteredOptions.value[0]);
    }
}

function onClickOutside(event) {
    if (root.value && !root.value.contains(event.target)) {
        closeMenu();
    }
}

watch(() => props.modelValue, syncKeyword);
// Pilihan pada form edit sering ditambahkan ke array opsi setelah nilai model
// dimuat. Pantau hasil pencarian opsi (bukan hanya referensi array) supaya
// label langsung tampil tanpa pengguna perlu memfokuskan field.
watch(selectedOption, syncKeyword, { immediate: true });

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
                <select
                    v-if="!searchable"
                    :id="fieldId"
                    :value="modelValue"
                    :disabled="disabled"
                    :aria-invalid="!!error || undefined"
                    class="block w-full rounded-md border text-sm shadow-sm min-h-10 focus:border-brand-500 focus:ring-brand-500 disabled:bg-light disabled:text-slate-400"
                    :class="error ? 'border-danger-500' : ''"
                    @change="emit('update:modelValue', $event.target.value)"
                >
                    <option value="">{{ placeholder }}</option>
                    <option v-for="option in filteredOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>

                <template v-else>
                    <input
                        :id="fieldId"
                        ref="searchInput"
                        type="search"
                        :value="keyword"
                        :placeholder="placeholder"
                        :disabled="disabled"
                        :required="required"
                        role="combobox"
                        autocomplete="off"
                        :aria-controls="`${fieldId}-options`"
                        :aria-expanded="isOpen"
                        :aria-invalid="!!error || undefined"
                        class="block w-full rounded-md border pr-10 text-sm shadow-sm min-h-10 focus:border-brand-500 focus:ring-brand-500 disabled:bg-light disabled:text-slate-400"
                        :class="error ? 'border-danger-500' : ''"
                        @focus="openMenu"
                        @click="openMenu"
                        @input="onSearch($event.target.value)"
                        @keydown="onKeydown"
                    />
                    <button
                        v-if="modelValue !== '' && modelValue !== null && !disabled"
                        type="button"
                        class="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded text-slate-500 hover:bg-slate-100 hover:text-dark focus:outline-none focus:ring-2 focus:ring-brand-500"
                        aria-label="Hapus pilihan"
                        @click="clearSelection"
                    >
                        ×
                    </button>
                    <div
                        v-if="isOpen"
                        :id="`${fieldId}-options`"
                        role="listbox"
                        class="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg"
                    >
                        <button
                            v-for="option in filteredOptions"
                            :key="option.value"
                            type="button"
                            role="option"
                            :aria-selected="String(option.value) === String(modelValue)"
                            class="block w-full px-3 py-2 text-left text-dark hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                            @mousedown.prevent
                            @click="selectOption(option)"
                        >
                            {{ option.label }}
                        </button>
                        <p v-if="!filteredOptions.length" class="px-3 py-2 text-slate-500">
                            {{ endpoint && !keyword ? 'Ketik untuk mencari.' : 'Tidak ada data yang sesuai.' }}
                        </p>
                    </div>
                </template>
            </div>
        </template>
    </FormField>
</template>
