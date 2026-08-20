<script setup>
import { ref } from 'vue';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import DataTable from '@/shared/components/DataTable.vue';
import FormInput from '@/shared/components/FormInput.vue';
import { perjadinApi } from '@/services/perjadinApi';

const keyword = ref('');
const loading = ref(false);
const error = ref('');
const rows = ref([]);
const columns = [
    { key: 'nip', label: 'NIP', priority: 1 },
    { key: 'nama', label: 'Nama', sortable: true },
    { key: 'unit', label: 'Unit' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'aktif', label: 'Status' },
];

async function search() {
    loading.value = true;
    error.value = '';
    try {
        const result = await perjadinApi.pegawai({ q: keyword.value, aktif: true, per_page: 50 });
        rows.value = (result.data ?? []).map((pegawai) => ({
            ...pegawai,
            unit: pegawai.unit?.nama ?? '-',
            jabatan: pegawai.jabatan?.nama ?? '-',
            aktif: pegawai.aktif ? 'Aktif' : 'Tidak aktif',
        }));
    } catch (exception) {
        error.value = exception.message;
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div>
        <div class="mb-4">
            <h1 class="text-lg font-bold text-dark">Cari Pegawai</h1>
            <p class="mt-0.5 text-sm text-slate-500">Referensi read-only dari SIKKEPO melalui Perjadin API.</p>
        </div>

        <AppCard>
            <form class="flex flex-col gap-3 sm:flex-row sm:items-end" @submit.prevent="search">
                <div class="min-w-0 flex-1">
                    <FormInput v-model="keyword" label="Nama atau NIP" placeholder="Ketik nama atau NIP pegawai" />
                </div>
                <AppButton type="submit" :loading="loading">Cari pegawai</AppButton>
            </form>
            <AppAlert v-if="error" type="danger" class="mt-4">{{ error }}</AppAlert>
        </AppCard>

        <AppCard class="mt-4" :padded="false">
            <DataTable :columns="columns" :rows="rows" :loading="loading" empty-title="Masukkan kata kunci untuk mencari pegawai">
                <template #cell-aktif="{ value }">
                    <span class="rounded-full bg-success-50 px-2 py-1 text-xs font-semibold text-success-700">{{ value }}</span>
                </template>
            </DataTable>
        </AppCard>
    </div>
</template>
