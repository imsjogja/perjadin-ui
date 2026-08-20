<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppCard from '@/shared/components/AppCard.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import StatusBadge from '@/shared/components/StatusBadge.vue';
import AppButton from '@/shared/components/AppButton.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const verifying = ref(false);
const deleting = ref(false);
const printing = ref('');
const error = ref('');
const actionError = ref('');
const sppd = ref(null);

const traveller = computed(() => sppd.value?.employee_snapshot ?? {});
const followers = computed(() => sppd.value?.followers ?? []);
const signatory = computed(() => sppd.value?.signatory?.employee_snapshot ?? {});

function employeeLabel(employee) {
    return [employee.nip, employee.nama].filter(Boolean).join(' — ') || '-';
}

function jobTitle(employee) {
    return employee.jabatan?.nama ?? '-';
}

async function load() {
    loading.value = true;
    error.value = '';

    try {
        const result = await perjadinApi.sppd(route.params.id);
        sppd.value = result.data;
    } catch (exception) {
        error.value = exception.message;
    } finally {
        loading.value = false;
    }
}

async function verifySppd() {
    if (!window.confirm('Verifikasi SPPD ini? Dokumen resmi dapat dicetak setelah verifikasi.')) return;

    verifying.value = true;
    actionError.value = '';
    try {
        const result = await perjadinApi.verifySppd(route.params.id);
        sppd.value = result.data;
        toast.success('SPPD berhasil diverifikasi.');
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        verifying.value = false;
    }
}

function editDraft() {
    router.push({ name: 'sppd.edit', params: { sppdId: route.params.id } });
}

async function deleteDraft() {
    if (!window.confirm('Hapus draft SPPD ini? Tindakan ini tidak dapat dibatalkan.')) return;

    deleting.value = true;
    actionError.value = '';
    try {
        await perjadinApi.deleteSppd(route.params.id);
        toast.success('Draft SPPD berhasil dihapus.');
        router.push({ name: 'spt.show', params: { id: sppd.value.spt_id } });
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        deleting.value = false;
    }
}

async function printDocument(type) {
    printing.value = type;
    actionError.value = '';
    try {
        if (type === 'preview') await perjadinApi.previewSppd(route.params.id);
        if (type === 'sppd') await perjadinApi.printSppd(route.params.id);
        if (type === 'visum') await perjadinApi.printVisum(route.params.id);
    } catch (exception) {
        actionError.value = exception.message;
    } finally {
        printing.value = '';
    }
}

onMounted(load);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat SPPD…" size="lg" />
    <ErrorState v-else-if="error" :message="error" @retry="load" />
    <div v-else-if="sppd">
        <PageHeader :title="sppd.document_number" subtitle="Surat Perintah Perjalanan Dinas">
            <AppButton variant="secondary" @click="router.push({ name: 'spt.show', params: { id: sppd.spt_id } })">Kembali ke SPT</AppButton>
            <template v-if="sppd.status === 'draft'">
                <AppButton variant="secondary" @click="editDraft">Ubah Draft</AppButton>
                <AppButton variant="danger" :loading="deleting" @click="deleteDraft">Hapus Draft</AppButton>
                <AppButton variant="secondary" :loading="printing === 'preview'" @click="printDocument('preview')">Preview SPPD</AppButton>
                <AppButton variant="success" :loading="verifying" @click="verifySppd">Verifikasi SPPD</AppButton>
            </template>
            <AppButton v-else variant="secondary" :loading="printing === 'sppd'" @click="printDocument('sppd')">Cetak SPPD</AppButton>
            <AppButton v-if="sppd.status === 'verified'" :loading="printing === 'visum'" @click="printDocument('visum')">Cetak Visum</AppButton>
        </PageHeader>

        <AppAlert v-if="actionError" type="danger" class="mb-4">{{ actionError }}</AppAlert>

        <div class="grid gap-4 xl:grid-cols-3">
            <AppCard class="xl:col-span-2" title="Informasi SPPD">
                <dl class="grid gap-4 text-sm md:grid-cols-2">
                    <div><dt class="text-slate-500">Status</dt><dd class="mt-1"><StatusBadge :status="sppd.status" /></dd></div>
                    <div><dt class="text-slate-500">Nomor registrasi</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.registration_number }}</dd></div>
                    <div><dt class="text-slate-500">Pemberi tugas</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.order_giver }}</dd></div>
                    <div><dt class="text-slate-500">Transportasi</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.spt?.destination?.transportation ?? '-' }}</dd></div>
                    <div><dt class="text-slate-500">Berangkat</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.departure_date }}</dd></div>
                    <div><dt class="text-slate-500">Kembali</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.return_date }}</dd></div>
                    <div><dt class="text-slate-500">Tingkat perjalanan</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.travel_level || '-' }}</dd></div>
                    <div><dt class="text-slate-500">Jenis perjalanan</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.travel_type || '-' }}</dd></div>
                    <div><dt class="text-slate-500">Instansi anggaran</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.budget_agency }}</dd></div>
                    <div><dt class="text-slate-500">Mata anggaran</dt><dd class="mt-1 font-semibold text-dark">{{ sppd.budget_account || '-' }}</dd></div>
                </dl>
                <div v-if="sppd.description" class="mt-4 border-t pt-4 text-sm text-slate-600">
                    <span class="font-semibold text-dark">Keterangan:</span> {{ sppd.description }}
                </div>
            </AppCard>

            <AppCard title="Pelaksana Perjalanan">
                <p class="font-semibold text-dark">{{ employeeLabel(traveller) }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ jobTitle(traveller) }}</p>
                <div class="mt-4 border-t pt-4 text-sm">
                    <p class="text-slate-500">SPT asal</p>
                    <button type="button" class="mt-1 font-semibold text-brand-600 hover:text-brand-800" @click="router.push({ name: 'spt.show', params: { id: sppd.spt_id } })">
                        {{ sppd.spt?.document_number ?? 'Lihat SPT' }}
                    </button>
                </div>
            </AppCard>
        </div>

        <div class="mt-4 grid gap-4 lg:grid-cols-2">
            <AppCard title="Pengikut">
                <ul v-if="followers.length" class="divide-y text-sm">
                    <li v-for="follower in followers" :key="follower.id" class="py-2 first:pt-0">
                        <p class="font-semibold text-dark">{{ employeeLabel(follower.employee_snapshot ?? {}) }}</p>
                        <p class="text-slate-600">{{ jobTitle(follower.employee_snapshot ?? {}) }}</p>
                    </li>
                </ul>
                <p v-else class="text-sm text-slate-500">Tidak ada pengikut.</p>
            </AppCard>

            <AppCard title="Penandatangan">
                <p class="font-semibold text-dark">{{ employeeLabel(signatory) }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ sppd.signatory?.signatory_role || jobTitle(signatory) }}</p>
                <p v-if="sppd.signatory?.behalf_of" class="mt-1 text-sm text-slate-600">{{ sppd.signatory.behalf_of }}</p>
                <p v-if="sppd.signatory?.is_acting" class="mt-2 text-xs font-semibold text-warning-700">Pelaksana tugas (Plt./Plh.)</p>
            </AppCard>
        </div>

        <AppCard v-if="sppd.status === 'verified'" class="mt-4" title="Verifikasi">
            <p class="text-sm text-slate-600">
                Diverifikasi pada {{ sppd.verified_at ?? '-' }} oleh {{ sppd.verifier?.name ?? '-' }}.
            </p>
        </AppCard>
    </div>
</template>
