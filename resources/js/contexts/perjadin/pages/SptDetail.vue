<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import DataTable from '@/shared/components/DataTable.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import FormMultiSelect from '@/shared/components/FormMultiSelect.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import StatusBadge from '@/shared/components/StatusBadge.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const printing = ref(false);
const error = ref('');
const actionError = ref('');
const spt = ref(null);
const assigneeNips = ref([]);
const assigneeOptions = ref([]);

const assigneeColumns = [
    { key: 'nip', label: 'NIP', priority: 1 },
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'revision', label: 'Revisi' },
    { key: 'sppd_status', label: 'SPPD' },
    { key: 'actions', label: 'Aksi' },
];

const sppdColumns = [
    { key: 'document_number', label: 'Nomor SPPD', priority: 1 },
    { key: 'traveller', label: 'Pelaksana' },
    { key: 'departure_date', label: 'Berangkat' },
    { key: 'return_date', label: 'Kembali' },
    { key: 'status', label: 'Status' },
];

const assigneeRows = computed(() =>
    (spt.value?.assignees ?? []).map((item) => ({
        ...item,
        id: item.id,
        nip: item.employee_snapshot?.nip ?? '-',
        nama: item.employee_snapshot?.nama ?? '-',
        jabatan: item.employee_snapshot?.jabatan?.nama ?? '-',
        revision: item.assignment_revision,
        sppd: (spt.value?.sppds ?? []).find((document) =>
            document.sikkepo_pegawai_id === item.sikkepo_pegawai_id,
        ),
        sppd_status: (spt.value?.sppds ?? []).find((document) =>
            document.sikkepo_pegawai_id === item.sikkepo_pegawai_id,
        )?.status ?? null,
    })),
);

const sppdRows = computed(() =>
    (spt.value?.sppds ?? []).map((item) => ({
        ...item,
        traveller: item.employee_snapshot?.nama ?? item.employee_snapshot?.nip ?? '-',
    })),
);

const existingAssigneeNips = computed(() =>
    (spt.value?.assignees ?? [])
        .map((item) => item.employee_snapshot?.nip)
        .filter(Boolean),
);
const basisItems = computed(() => {
    const bases = (spt.value?.bases ?? [])
        .map((basis) => basis.content)
        .filter(Boolean);

    return bases.length ? bases : spt.value?.dasar ? [spt.value.dasar] : [];
});

function pegawaiLabel(pegawai) {
    const identity = [pegawai.nip, pegawai.nama].filter(Boolean).join(' — ');
    return pegawai.jabatan?.nama ? `${identity} (${pegawai.jabatan.nama})` : identity;
}

async function searchAssignees(keyword) {
    const query = keyword.trim();
    assigneeOptions.value = [];

    if (query.length < 2) return;

    try {
        const result = await perjadinApi.pegawai({ q: query, aktif: true, per_page: 20 });
        assigneeOptions.value = (result.data ?? []).map((pegawai) => ({
            value: pegawai.nip,
            label: pegawaiLabel(pegawai),
        }));
    } catch (exception) {
        actionError.value = exception.message;
    }
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
    if (assigneeNips.value.length === 0) {
        actionError.value = 'Pilih setidaknya satu pelaksana.';
        return;
    }

    saving.value = true;
    actionError.value = '';
    try {
        const result = await perjadinApi.addAssignees(route.params.id, assigneeNips.value);
        spt.value = result.data;
        assigneeNips.value = [];
        assigneeOptions.value = [];
        toast.success('Pelaksana SPT berhasil ditambahkan.');
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        saving.value = false;
    }
}

async function printSpt() {
    printing.value = true;
    actionError.value = '';
    try {
        await perjadinApi.printSpt(route.params.id);
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        printing.value = false;
    }
}

function openSppd(row) {
    router.push({ name: 'sppd.show', params: { id: row.id } });
}

function manageSppd(row) {
    if (row.sppd) {
        router.push({ name: 'sppd.show', params: { id: row.sppd.id } });
        return;
    }

    router.push({
        name: 'sppd.create',
        params: { id: spt.value.id },
        query: { traveller_nip: row.nip },
    });
}

onMounted(load);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat Surat Tugas…" size="lg" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <div v-else-if="spt">
        <PageHeader :title="spt.document_number" :subtitle="`${spt.issued_place}, ${spt.issued_date}`">
            <AppButton variant="secondary" @click="router.push({ name: 'spt.index' })">Kembali</AppButton>
            <AppButton variant="secondary" @click="router.push({ name: 'spt.edit', params: { id: spt.id } })">Ubah SPT</AppButton>
            <AppButton variant="secondary" :loading="printing" @click="printSpt">Cetak SPT</AppButton>
        </PageHeader>

        <AppAlert v-if="actionError" type="danger" class="mb-4">{{ actionError }}</AppAlert>

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
                <div class="mt-4 border-t pt-4 text-sm text-slate-600">
                    <p class="font-semibold text-dark">Dasar:</p>
                    <ol class="mt-1 list-[upper-alpha] space-y-1 pl-5">
                        <li v-for="basis in basisItems" :key="basis">{{ basis }}</li>
                    </ol>
                </div>
            </AppCard>

            <AppCard title="Tambah Pelaksana" subtitle="Cari dan pilih pegawai langsung pada kolom pelaksana.">
                <FormMultiSelect
                    v-model="assigneeNips"
                    label="Pelaksana terpilih"
                    placeholder="Ketik NIP atau nama"
                    hint="Ketik minimal dua karakter, lalu pilih pegawai."
                    :options="assigneeOptions"
                    :excluded-values="existingAssigneeNips"
                    @search="searchAssignees"
                />
                <AppButton class="mt-3 w-full" :loading="saving" @click="addAssignees">Tambahkan pelaksana</AppButton>
            </AppCard>
        </div>

        <AppCard class="mt-4" title="Pelaksana Tugas" subtitle="Data pegawai dicatat pada saat penambahan.">
            <DataTable :columns="assigneeColumns" :rows="assigneeRows" :searchable="false" empty-title="Belum ada pelaksana pada SPT ini">
                <template #cell-sppd_status="{ row }">
                    <StatusBadge v-if="row.sppd" :status="row.sppd_status" />
                    <span v-else class="text-slate-500">Belum dibuat</span>
                </template>
                <template #cell-actions="{ row }">
                    <AppButton size="sm" :variant="row.sppd ? 'secondary' : 'primary'" @click="manageSppd(row)">
                        {{ row.sppd ? 'Lihat SPPD' : 'Buat SPPD' }}
                    </AppButton>
                </template>
            </DataTable>
        </AppCard>

        <AppCard class="mt-4" title="SPPD Terkait" subtitle="Dokumen perjalanan yang diterbitkan dari Surat Tugas ini.">
            <DataTable :columns="sppdColumns" :rows="sppdRows" :searchable="false" empty-title="Belum ada SPPD yang diterbitkan">
                <template #cell-document_number="{ row, value }">
                    <button type="button" class="font-semibold text-brand-600 hover:text-brand-800" @click="openSppd(row)">{{ value }}</button>
                </template>
                <template #cell-status="{ value }">
                    <StatusBadge :status="value" />
                </template>
            </DataTable>
        </AppCard>
    </div>
</template>
