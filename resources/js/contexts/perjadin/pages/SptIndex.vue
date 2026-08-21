<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
    ArchiveBoxIcon,
    EyeIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/vue/24/outline';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import DataTable from '@/shared/components/DataTable.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import FormDatePicker from '@/shared/components/FormDatePicker.vue';
import FormInput from '@/shared/components/FormInput.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const router = useRouter();
const toast = useToast();
const loading = ref(true);
const error = ref('');
const actionError = ref('');
const rows = ref([]);
const archivingId = ref('');
const deletingId = ref('');
const filters = reactive({
    date_from: '',
    date_to: '',
    assignee: '',
    status: '',
});
const statusOptions = [
    { value: '', label: 'Semua status' },
    { value: 'unassigned', label: 'Pelaksana belum ditentukan' },
    { value: 'ready', label: 'Siap terbit' },
    { value: 'archived', label: 'Arsip' },
];
const columns = [
    { key: 'document_number', label: 'Nomor SPT', sortable: true, priority: 1 },
    { key: 'issued_date', label: 'Tanggal', sortable: true },
    { key: 'destination', label: 'Tujuan' },
    { key: 'dalam_rangka', label: 'Dalam rangka' },
    { key: 'assignee_count', label: 'Pelaksana', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Aksi' },
];

function statusFor(spt) {
    if (spt.archived_at) {
        return {
            value: 'archived',
            label: 'Arsip',
            classes: 'bg-slate-100 text-slate-700',
        };
    }

    if (Number(spt.assignees_count ?? 0) === 0) {
        return {
            value: 'unassigned',
            label: 'Pelaksana belum ditentukan',
            classes: 'bg-warning-50 text-warning-700',
        };
    }

    return {
        value: 'ready',
        label: 'Siap terbit',
        classes: 'bg-success-50 text-success-700',
    };
}

function mapSpt(spt) {
    const status = statusFor(spt);

    return {
        ...spt,
        destination: spt.destination?.destination_place ?? '-',
        assignee_count: Number(spt.assignees_count ?? 0),
        sppds_count: Number(spt.sppds_count ?? 0),
        status: status.value,
        status_label: status.label,
        status_classes: status.classes,
    };
}

function filterPayload() {
    return {
        per_page: 100,
        date_from: filters.date_from,
        date_to: filters.date_to,
        assignee: filters.assignee.trim(),
        status: filters.status,
    };
}

async function load() {
    loading.value = true;
    error.value = '';

    try {
        const result = await perjadinApi.spts(filterPayload());
        rows.value = (result.data ?? []).map(mapSpt);
    } catch (exception) {
        error.value = exception.message;
    } finally {
        loading.value = false;
    }
}

function resetFilters() {
    filters.date_from = '';
    filters.date_to = '';
    filters.assignee = '';
    filters.status = '';
    load();
}

function openSpt(row) {
    router.push({ name: 'spt.show', params: { id: row.id } });
}

async function archiveSpt(row) {
    if (!window.confirm(`Arsipkan ${row.document_number}? Dokumen tetap dapat dilihat, tetapi tidak lagi muncul sebagai SPT aktif.`)) return;

    archivingId.value = row.id;
    actionError.value = '';

    try {
        await perjadinApi.archiveSpt(row.id);
        toast.success('SPT berhasil diarsipkan.');
        await load();
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        archivingId.value = '';
    }
}

async function deleteSpt(row) {
    if (!window.confirm(`Hapus ${row.document_number}? Tindakan ini tidak dapat dibatalkan.`)) return;

    deletingId.value = row.id;
    actionError.value = '';

    try {
        await perjadinApi.deleteSpt(row.id);
        toast.success('SPT berhasil dihapus.');
        await load();
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        deletingId.value = '';
    }
}

onMounted(load);
</script>

<template>
    <div>
        <PageHeader title="Surat Tugas" subtitle="Kelola SPT, pelaksana, status penerbitan, dan arsip dokumen.">
            <AppButton gradient @click="router.push({ name: 'spt.create' })">
                <PlusIcon class="h-4 w-4" aria-hidden="true" />
                Buat SPT
            </AppButton>
        </PageHeader>

        <AppCard class="mb-4" title="Filter Surat Tugas" subtitle="Saring berdasarkan tanggal penerbitan, nama pelaksana, dan status dokumen.">
            <form class="grid gap-4 md:grid-cols-2 xl:grid-cols-5" @submit.prevent="load">
                <FormDatePicker v-model="filters.date_from" label="Tanggal dari" :max="filters.date_to" />
                <FormDatePicker v-model="filters.date_to" label="Tanggal sampai" :min="filters.date_from" />
                <FormInput v-model="filters.assignee" label="Nama pegawai" placeholder="Cari pelaksana dalam SPT" />
                <label class="block text-sm font-semibold text-dark">
                    Status SPT
                    <select
                        v-model="filters.status"
                        class="mt-1 block min-h-10 w-full rounded-md border bg-surface text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    >
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                    </select>
                </label>
                <div class="flex items-end gap-2">
                    <AppButton type="submit" :loading="loading">Terapkan</AppButton>
                    <AppButton type="button" variant="secondary" :disabled="loading" @click="resetFilters">Reset</AppButton>
                </div>
            </form>
        </AppCard>

        <AppAlert v-if="actionError" type="danger" class="mb-4">{{ actionError }}</AppAlert>

        <AppCard :padded="false">
            <ErrorState v-if="error" :message="error" @retry="load" />
            <DataTable
                v-else
                :columns="columns"
                :rows="rows"
                :loading="loading"
                search-placeholder="Cari hasil filter…"
                empty-title="Tidak ada Surat Tugas yang sesuai"
            >
                <template #cell-document_number="{ row, value }">
                    <button type="button" class="font-semibold text-brand-600 hover:text-brand-800" @click="openSpt(row)">{{ value }}</button>
                </template>
                <template #cell-issued_date="{ value }">
                    {{ value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '-' }}
                </template>
                <template #cell-assignee_count="{ value }">
                    <span
                        class="rounded-full px-2 py-1 text-xs font-semibold"
                        :class="value ? 'bg-brand-50 text-brand-700' : 'bg-warning-50 text-warning-700'"
                    >
                        {{ value ? `${value} pegawai` : 'Belum ditentukan' }}
                    </span>
                </template>
                <template #cell-status="{ row }">
                    <span class="inline-flex rounded-full px-2 py-1 text-xs font-semibold" :class="row.status_classes">{{ row.status_label }}</span>
                </template>
                <template #cell-actions="{ row }">
                    <div class="flex flex-wrap items-center gap-1">
                        <button
                            type="button"
                            class="inline-flex min-h-9 items-center gap-1 rounded px-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                            @click="openSpt(row)"
                        >
                            <EyeIcon class="h-4 w-4" aria-hidden="true" />
                            Lihat
                        </button>
                        <button
                            v-if="row.status !== 'archived'"
                            type="button"
                            class="inline-flex min-h-9 items-center gap-1 rounded px-2 text-xs font-semibold text-warning-700 hover:bg-warning-50 disabled:cursor-not-allowed disabled:opacity-50"
                            :disabled="archivingId === row.id || deletingId === row.id"
                            @click="archiveSpt(row)"
                        >
                            <ArchiveBoxIcon class="h-4 w-4" aria-hidden="true" />
                            {{ archivingId === row.id ? 'Mengarsipkan…' : 'Arsipkan' }}
                        </button>
                        <button
                            v-if="row.sppds_count === 0"
                            type="button"
                            class="inline-flex min-h-9 items-center gap-1 rounded px-2 text-xs font-semibold text-danger-600 hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
                            :disabled="deletingId === row.id || archivingId === row.id"
                            @click="deleteSpt(row)"
                        >
                            <TrashIcon class="h-4 w-4" aria-hidden="true" />
                            {{ deletingId === row.id ? 'Menghapus…' : 'Hapus' }}
                        </button>
                    </div>
                </template>
            </DataTable>
        </AppCard>
    </div>
</template>
