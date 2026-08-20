<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import DataTable from '@/shared/components/DataTable.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { perjadinApi } from '@/services/perjadinApi';

const router = useRouter();
const loading = ref(true);
const error = ref('');
const rows = ref([]);
const columns = [
    { key: 'document_number', label: 'Nomor SPT', sortable: true, priority: 1 },
    { key: 'issued_date', label: 'Tanggal', sortable: true },
    { key: 'destination', label: 'Tujuan' },
    { key: 'dalam_rangka', label: 'Dalam rangka' },
    { key: 'assignee_count', label: 'Pelaksana' },
];

function mapSpt(spt) {
    return {
        ...spt,
        destination: spt.destination?.destination_place ?? '-',
        assignee_count: spt.assignees_count ?? spt.assignees?.length ?? '-',
    };
}

async function load() {
    loading.value = true;
    error.value = '';

    try {
        const result = await perjadinApi.spts({ per_page: 50 });
        rows.value = (result.data ?? []).map(mapSpt);
    } catch (exception) {
        error.value = exception.message;
    } finally {
        loading.value = false;
    }
}

function openSpt(row) {
    router.push({ name: 'spt.show', params: { id: row.id } });
}

onMounted(load);
</script>

<template>
    <div>
        <PageHeader title="Surat Tugas" subtitle="Kelola SPT dan daftar pelaksana perjalanan.">
            <AppButton gradient @click="router.push({ name: 'spt.create' })">Buat SPT</AppButton>
        </PageHeader>

        <AppCard :padded="false">
            <ErrorState v-if="error" :message="error" @retry="load" />
            <DataTable v-else :columns="columns" :rows="rows" :loading="loading" empty-title="Belum ada Surat Tugas">
                <template #cell-document_number="{ row, value }">
                    <button type="button" class="font-semibold text-brand-600 hover:text-brand-800" @click="openSpt(row)">{{ value }}</button>
                </template>
                <template #cell-assignee_count="{ value }">
                    <span class="rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">{{ value }} pegawai</span>
                </template>
            </DataTable>
        </AppCard>
    </div>
</template>
