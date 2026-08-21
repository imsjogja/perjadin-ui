<script setup>
import { computed, onMounted, ref } from 'vue';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import AppModal from '@/shared/components/AppModal.vue';
import DataTable from '@/shared/components/DataTable.vue';
import FormInput from '@/shared/components/FormInput.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const deletingId = ref(null);
const message = ref('');
const references = ref([]);
const activeType = ref('mata-anggaran');
const modalOpen = ref(false);
const editingReference = ref(null);
const value = ref('');
const errors = ref({});

const types = [
    { value: 'mata-anggaran', label: 'Mata anggaran', description: 'Daftar kode atau nama mata anggaran pada SPPD.' },
    { value: 'transportasi', label: 'Transportasi', description: 'Pilihan alat angkut pada SPT.' },
    { value: 'tingkat-perjalanan', label: 'Tingkat perjalanan', description: 'Pilihan tingkat perjalanan pada SPPD.' },
    { value: 'jenis-perjalanan', label: 'Jenis perjalanan', description: 'Pilihan jenis perjalanan pada SPPD.' },
];

const activeTypeDefinition = computed(() =>
    types.find((type) => type.value === activeType.value) ?? types[0],
);
const columns = [
    { key: 'value', label: 'Nilai referensi', priority: 1, sortable: true },
    { key: 'actions', label: 'Aksi' },
];

function fieldError(field) {
    return errors.value[field]?.[0] ?? '';
}

async function load() {
    loading.value = true;
    message.value = '';

    try {
        const result = await perjadinApi.documentReferences(activeType.value);
        references.value = result.data ?? [];
    } catch (exception) {
        message.value = exception.message;
    } finally {
        loading.value = false;
    }
}

async function selectType(type) {
    if (type === activeType.value) return;

    activeType.value = type;
    await load();
}

function openCreate() {
    editingReference.value = null;
    value.value = '';
    errors.value = {};
    modalOpen.value = true;
}

function openEdit(reference) {
    editingReference.value = reference;
    value.value = reference.value;
    errors.value = {};
    modalOpen.value = true;
}

async function save() {
    saving.value = true;
    errors.value = {};
    message.value = '';

    try {
        if (editingReference.value) {
            await perjadinApi.updateDocumentReference(activeType.value, editingReference.value.id, { value: value.value });
            toast.success('Referensi berhasil diperbarui.');
        } else {
            await perjadinApi.createDocumentReference(activeType.value, { value: value.value });
            toast.success('Referensi berhasil ditambahkan.');
        }

        modalOpen.value = false;
        await load();
    } catch (exception) {
        errors.value = exception.errors ?? {};
        message.value = exception.message;
    } finally {
        saving.value = false;
    }
}

async function removeReference(reference) {
    if (!window.confirm(`Hapus referensi "${reference.value}"?`)) return;

    deletingId.value = reference.id;
    message.value = '';

    try {
        await perjadinApi.deleteDocumentReference(activeType.value, reference.id);
        references.value = references.value.filter((item) => item.id !== reference.id);
        toast.success('Referensi berhasil dihapus.');
    } catch (exception) {
        message.value = exception.message;
    } finally {
        deletingId.value = null;
    }
}

onMounted(load);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat referensi dokumen…" size="lg" />
    <div v-else>
        <PageHeader title="Referensi Dokumen" subtitle="Kelola nilai yang tersedia pada formulir Surat Tugas dan SPPD.">
            <AppButton @click="openCreate">Tambah referensi</AppButton>
        </PageHeader>

        <AppAlert v-if="message" type="danger" class="mb-4">{{ message }}</AppAlert>

        <div class="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Kategori referensi dokumen">
            <AppButton
                v-for="type in types"
                :key="type.value"
                size="sm"
                :variant="activeType === type.value ? 'primary' : 'secondary'"
                type="button"
                role="tab"
                :aria-selected="activeType === type.value"
                @click="selectType(type.value)"
            >
                {{ type.label }}
            </AppButton>
        </div>

        <AppCard :title="activeTypeDefinition.label" :subtitle="activeTypeDefinition.description" :padded="false">
            <DataTable :columns="columns" :rows="references" empty-title="Belum ada referensi">
                <template #cell-actions="{ row }">
                    <div class="flex justify-end gap-2">
                        <AppButton size="sm" variant="secondary" @click="openEdit(row)">Ubah</AppButton>
                        <AppButton size="sm" variant="danger" :loading="deletingId === row.id" @click="removeReference(row)">Hapus</AppButton>
                    </div>
                </template>
            </DataTable>
        </AppCard>

        <AppModal v-model:open="modalOpen" :title="editingReference ? `Ubah ${activeTypeDefinition.label}` : `Tambah ${activeTypeDefinition.label}`">
            <AppAlert v-if="message" type="danger" class="mb-4">{{ message }}</AppAlert>
            <FormInput
                v-model="value"
                label="Nilai referensi"
                required
                :error="fieldError('value')"
                @keyup.enter="save"
            />
            <template #footer>
                <AppButton variant="secondary" @click="modalOpen = false">Batal</AppButton>
                <AppButton :loading="saving" @click="save">{{ editingReference ? 'Simpan' : 'Tambah' }}</AppButton>
            </template>
        </AppModal>
    </div>
</template>
