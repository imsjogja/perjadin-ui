<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import FormDatePicker from '@/shared/components/FormDatePicker.vue';
import FormInput from '@/shared/components/FormInput.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { perjadinApi } from '@/services/perjadinApi';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const saving = ref(false);
const message = ref('');
const errors = ref({});
const spt = ref(null);
const followersText = ref('');
const form = reactive({
    traveller_nip: '',
    order_giver: '',
    travel_level: '',
    travel_type: '',
    departure_date: '',
    return_date: '',
    budget_agency: '',
    budget_account: '',
    description: '',
    issued_place: '',
    issued_date: '',
    signatory: {
        nip: '',
        behalf_of: '',
        signatory_role: '',
        is_acting: false,
    },
});

const assigneeHint = computed(() =>
    (spt.value?.assignees ?? []).map((item) => `${item.employee_snapshot?.nip} — ${item.employee_snapshot?.nama}`).join('\n'),
);

function fieldError(field) {
    return errors.value[field]?.[0] ?? '';
}

function splitNips(value) {
    return [...new Set(value.split(/[\n,\s]+/).map((nip) => nip.trim()).filter(Boolean))];
}

async function loadSpt() {
    try {
        const result = await perjadinApi.spt(route.params.id);
        spt.value = result.data;
        form.issued_place = result.data.issued_place;
        form.issued_date = result.data.issued_date;
    } catch (exception) {
        message.value = exception.message;
    } finally {
        loading.value = false;
    }
}

async function submit() {
    saving.value = true;
    errors.value = {};
    message.value = '';
    try {
        await perjadinApi.createSppd(route.params.id, {
            ...form,
            followers: splitNips(followersText.value),
        });
        router.push({ name: 'spt.show', params: { id: route.params.id } });
    } catch (exception) {
        errors.value = exception.errors ?? {};
        message.value = exception.message;
    } finally {
        saving.value = false;
    }
}

onMounted(loadSpt);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat SPT…" size="lg" />
    <div v-else>
        <PageHeader title="Buat SPPD" :subtitle="spt?.document_number ?? 'SPT tidak ditemukan'">
            <AppButton variant="secondary" @click="router.push({ name: 'spt.show', params: { id: route.params.id } })">Batal</AppButton>
        </PageHeader>

        <form class="space-y-4" @submit.prevent="submit">
            <AppAlert v-if="message" type="danger">{{ message }}</AppAlert>

            <AppCard title="Pelaksana Perjalanan" subtitle="Pelaksana dan pengikut harus sudah tercatat pada SPT.">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormInput v-model="form.traveller_nip" label="NIP pelaksana" required :error="fieldError('traveller_nip')" />
                    <FormInput v-model="form.order_giver" label="Pemberi tugas" required :error="fieldError('order_giver')" />
                </div>
                <label class="mt-4 block text-sm font-semibold text-dark" for="followers">NIP pengikut</label>
                <textarea id="followers" v-model="followersText" rows="3" class="mt-1 block w-full rounded-md border text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" placeholder="Opsional; pisahkan dengan koma atau baris baru" />
                <p v-if="fieldError('followers')" class="mt-1 text-xs text-danger-600">{{ fieldError('followers') }}</p>
                <pre v-if="assigneeHint" class="mt-3 overflow-x-auto rounded-md bg-light p-3 text-xs text-slate-600">Pelaksana pada SPT:
{{ assigneeHint }}</pre>
            </AppCard>

            <AppCard title="Rencana Perjalanan">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormInput v-model="form.travel_level" label="Tingkat perjalanan" :error="fieldError('travel_level')" />
                    <FormInput v-model="form.travel_type" label="Jenis perjalanan" :error="fieldError('travel_type')" />
                    <FormDatePicker v-model="form.departure_date" label="Tanggal berangkat" required :error="fieldError('departure_date')" />
                    <FormDatePicker v-model="form.return_date" label="Tanggal kembali" required :error="fieldError('return_date')" />
                    <FormInput v-model="form.budget_agency" label="Instansi anggaran" required :error="fieldError('budget_agency')" />
                    <FormInput v-model="form.budget_account" label="Mata anggaran" :error="fieldError('budget_account')" />
                    <FormInput v-model="form.issued_place" label="Tempat terbit" required :error="fieldError('issued_place')" />
                    <FormDatePicker v-model="form.issued_date" label="Tanggal terbit" required :error="fieldError('issued_date')" />
                </div>
                <label class="mt-4 block text-sm font-semibold text-dark" for="description">Keterangan</label>
                <textarea id="description" v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" />
            </AppCard>

            <AppCard title="Pejabat Penandatangan">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormInput v-model="form.signatory.nip" label="NIP penandatangan" required :error="fieldError('signatory.nip')" />
                    <FormInput v-model="form.signatory.signatory_role" label="Jabatan pada dokumen" :error="fieldError('signatory.signatory_role')" />
                    <FormInput v-model="form.signatory.behalf_of" label="Atas nama" :error="fieldError('signatory.behalf_of')" />
                    <label class="flex min-h-10 items-center gap-2 text-sm text-dark">
                        <input v-model="form.signatory.is_acting" type="checkbox" class="rounded border" />
                        Pelaksana tugas (Plt./Plh.)
                    </label>
                </div>
            </AppCard>

            <div class="flex justify-end">
                <AppButton type="submit" :loading="saving" gradient>Terbitkan SPPD</AppButton>
            </div>
        </form>
    </div>
</template>
