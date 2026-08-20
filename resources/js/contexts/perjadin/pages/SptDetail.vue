<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import DataTable from '@/shared/components/DataTable.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const actionError = ref('');
const spt = ref(null);
const assigneeInput = ref('');

const assigneeColumns = [
    { key: 'nip', label: 'NIP', priority: 1 },
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'revision', label: 'Revisi' },
];

const assigneeRows = computed(() =>
    (spt.value?.assignees ?? []).map((item) => ({
        id: item.id,
        nip: item.employee_snapshot?.nip ?? '-',
        nama: item.employee_snapshot?.nama ?? '-',
        jabatan: item.employee_snapshot?.jabatan?.nama ?? '-',
        revision: item.assignment_revision,
    })),
);

function splitNips(value) {
    return [...new Set(value.split(/[\n,\s]+/).map((nip) => nip.trim()).filter(Boolean))];
}

async function load() {
    loading.value = true;
    error.value = '';
    try {
        const result = await perjadinApi.spt(route.params.id);
        spt.value = result.data;
    } catch (exception) {
        error.value = exception.message;
    } finally {
        loading.value = false;
    }
}

async function addAssignees() {
    const nips = splitNips(assigneeInput.value);
    if (nips.length === 0) {
        actionError.value = 'Masukkan setidaknya satu NIP.';
        return;
    }

    saving.value = true;
    actionError.value = '';
    try {
        const result = await perjadinApi.addAssignees(route.params.id, nips);
        spt.value = result.data;
        assigneeInput.value = '';
        toast.success('Pelaksana SPT berhasil ditambahkan.');
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat Surat Tugas…" size="lg" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <div v-else-if="spt">
        <PageHeader :title="spt.document_number" :subtitle="`${spt.issued_place}, ${spt.issued_date}`">
            <AppButton variant="secondary" @click="router.push({ name: 'spt.index' })">Kembali</AppButton>
            <AppButton @click="router.push({ name: 'sppd.create', params: { id: spt.id } })">Buat SPPD</AppButton>
        </PageHeader>

        <div class="grid gap-4 xl:grid-cols-3">
            <AppCard class="xl:col-span-2" title="Informasi Surat Tugas">
                <dl class="grid gap-4 text-sm md:grid-cols-2">
                    <div><dt class="text-slate-500">Dalam rangka</dt><dd class="mt-1 font-semibold text-dark">{{ spt.dalam_rangka }}</dd></div>
                    <div><dt class="text-slate-500">Tujuan</dt><dd class="mt-1 font-semibold text-dark">{{ spt.destination?.destination_place ?? '-' }}</dd></div>
                    <div><dt class="text-slate-500">Transportasi</dt><dd class="mt-1 font-semibold text-dark">{{ spt.destination?.transportation ?? '-' }}</dd></div>
                    <div><dt class="text-slate-500">Lama perjalanan</dt><dd class="mt-1 font-semibold text-dark">{{ spt.destination?.duration_days ?? '-' }} hari</dd></div>
                    <div><dt class="text-slate-500">Penandatangan</dt><dd class="mt-1 font-semibold text-dark">{{ spt.signatory?.employee_snapshot?.nama ?? '-' }}</dd></div>
                    <div><dt class="text-slate-500">Revisi pelaksana</dt><dd class="mt-1 font-semibold text-dark">{{ spt.assignment_revision }}</dd></div>
                </dl>
                <div class="mt-4 border-t pt-4 text-sm text-slate-600"><span class="font-semibold text-dark">Dasar:</span> {{ spt.dasar }}</div>
            </AppCard>

            <AppCard title="Tambah Pelaksana" subtitle="Tidak menerbitkan SPPD. Pisahkan NIP dengan koma atau baris baru.">
                <AppAlert v-if="actionError" type="danger" class="mb-3">{{ actionError }}</AppAlert>
                <label for="assignee-nips" class="text-sm font-semibold text-dark">NIP pegawai</label>
                <textarea id="assignee-nips" v-model="assigneeInput" rows="6" class="mt-1 block w-full rounded-md border text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" placeholder="198001012010011002&#10;198001012010011003" />
                <AppButton class="mt-3 w-full" :loading="saving" @click="addAssignees">Tambahkan pelaksana</AppButton>
            </AppCard>
        </div>

        <AppCard class="mt-4" title="Pelaksana Tugas" subtitle="Snapshot pegawai dari SIKKEPO pada saat penambahan.">
            <DataTable :columns="assigneeColumns" :rows="assigneeRows" :searchable="false" empty-title="Belum ada pelaksana pada SPT ini" />
        </AppCard>
    </div>
</template>
