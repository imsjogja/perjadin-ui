<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import FormDatePicker from '@/shared/components/FormDatePicker.vue';
import FormInput from '@/shared/components/FormInput.vue';
import FormMultiSelect from '@/shared/components/FormMultiSelect.vue';
import FormSelect from '@/shared/components/FormSelect.vue';
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
const followerNips = ref([]);
const unitOptions = ref([]);
const signatoryOptions = ref([]);
const travelLevelOptions = ref([]);
const travelTypeOptions = ref([]);
const budgetAccountOptions = ref([]);
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
const editing = computed(() => Boolean(route.params.sppdId));

const assigneeOptions = computed(() =>
    (spt.value?.assignees ?? [])
        .map((item) => item.employee_snapshot)
        .filter((pegawai) => pegawai?.nip)
        .map((pegawai) => ({
            value: pegawai.nip,
            label: pegawaiLabel(pegawai),
        })),
);

function fieldError(field) {
    return errors.value[field]?.[0] ?? '';
}

function pegawaiLabel(pegawai) {
    const identity = [pegawai.nip, pegawai.nama].filter(Boolean).join(' — ');
    return pegawai.jabatan?.nama ? `${identity} (${pegawai.jabatan.nama})` : identity;
}

function dateValue(value) {
    return value ? String(value).slice(0, 10) : '';
}

function addOption(options, option) {
    if (!option?.value || options.some((item) => String(item.value) === String(option.value))) return;

    options.push(option);
}

async function searchUnits(keyword = '') {
    try {
        const result = await perjadinApi.units({ q: keyword.trim(), per_page: 50 });
        const current = [...unitOptions.value];

        (result.data ?? []).forEach((unit) => addOption(current, {
            value: unit.nama,
            label: [unit.kode, unit.nama].filter(Boolean).join(' — '),
        }));
        unitOptions.value = current;
    } catch (exception) {
        message.value = exception.message;
    }
}

async function searchSignatories(keyword) {
    const query = keyword.trim();
    signatoryOptions.value = [];

    if (query.length < 2) return;

    try {
        const result = await perjadinApi.pegawai({ q: query, aktif: true, per_page: 20 });
        signatoryOptions.value = (result.data ?? []).map((pegawai) => ({
            value: pegawai.nip,
            label: pegawaiLabel(pegawai),
        }));
    } catch (exception) {
        message.value = exception.message;
    }
}

async function loadReferenceOptions(type, options, selectedValue) {
    const result = await perjadinApi.documentReferences(type);
    options.value = (result.data ?? []).map((reference) => ({
        value: reference.value,
        label: reference.value,
    }));
    addOption(options.value, {
        value: selectedValue,
        label: selectedValue,
    });
}

async function loadDocumentReferences() {
    try {
        await Promise.all([
            loadReferenceOptions('tingkat-perjalanan', travelLevelOptions, form.travel_level),
            loadReferenceOptions('jenis-perjalanan', travelTypeOptions, form.travel_type),
            loadReferenceOptions('mata-anggaran', budgetAccountOptions, form.budget_account),
        ]);
    } catch (exception) {
        message.value = exception.message;
    }
}

watch(() => form.traveller_nip, (nip) => {
    followerNips.value = followerNips.value.filter((followerNip) => followerNip !== nip);
});

function populateDraft(draft) {
    const signatory = draft.signatory ?? {};
    Object.assign(form, {
        traveller_nip: draft.employee_snapshot?.nip ?? '',
        order_giver: draft.order_giver ?? '',
        travel_level: draft.travel_level ?? '',
        travel_type: draft.travel_type ?? '',
        departure_date: dateValue(draft.departure_date),
        return_date: dateValue(draft.return_date),
        budget_agency: draft.budget_agency ?? '',
        budget_account: draft.budget_account ?? '',
        description: draft.description ?? '',
        issued_place: draft.issued_place ?? '',
        issued_date: dateValue(draft.issued_date),
        signatory: {
            nip: signatory.employee_snapshot?.nip ?? '',
            behalf_of: signatory.behalf_of ?? '',
            signatory_role: signatory.signatory_role ?? '',
            is_acting: Boolean(signatory.is_acting),
        },
    });
    followerNips.value = (draft.followers ?? [])
        .map((follower) => follower.employee_snapshot?.nip)
        .filter(Boolean)
        .filter((nip, index, nips) => nips.indexOf(nip) === index);

    addOption(signatoryOptions.value, {
        value: signatory.employee_snapshot?.nip,
        label: pegawaiLabel(signatory.employee_snapshot ?? {}),
    });
    addOption(unitOptions.value, {
        value: draft.budget_agency,
        label: draft.budget_agency,
    });
}

async function loadSpt() {
    try {
        if (editing.value) {
            const result = await perjadinApi.sppd(route.params.sppdId);
            if (result.data.status !== 'draft') {
                message.value = 'Hanya draft SPPD yang dapat diubah.';
                return;
            }
            const sptResult = await perjadinApi.spt(result.data.spt_id);
            spt.value = sptResult.data;
            populateDraft(result.data);
            await Promise.all([searchUnits(), loadDocumentReferences()]);
            return;
        }

        const result = await perjadinApi.spt(route.params.id);
        spt.value = result.data;
        form.issued_place = result.data.issued_place;
        form.issued_date = dateValue(result.data.issued_date);
        form.traveller_nip = String(route.query.traveller_nip ?? '');
        await Promise.all([searchUnits(), loadDocumentReferences()]);
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
        const payload = {
            ...form,
            followers: followerNips.value,
        };
        const result = editing.value
            ? await perjadinApi.updateSppd(route.params.sppdId, payload)
            : await perjadinApi.createSppd(route.params.id, payload);
        router.push({ name: 'sppd.show', params: { id: result.data.id } });
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
        <PageHeader :title="editing ? 'Ubah Draft SPPD' : 'Buat SPPD'" :subtitle="spt?.document_number ?? 'SPT tidak ditemukan'">
            <AppButton variant="secondary" @click="router.push({ name: editing ? 'sppd.show' : 'spt.show', params: { id: editing ? route.params.sppdId : route.params.id } })">Batal</AppButton>
        </PageHeader>

        <form class="space-y-4" @submit.prevent="submit">
            <AppAlert v-if="message" type="danger">{{ message }}</AppAlert>

            <AppCard title="Pelaksana Perjalanan" subtitle="Pelaksana dan pengikut harus sudah tercatat pada SPT.">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormSelect
                        v-model="form.traveller_nip"
                        label="Pelaksana perjalanan"
                        required
                        searchable
                        placeholder="Pilih pelaksana SPT"
                        hint="Hanya pegawai yang telah ditambahkan pada SPT."
                        :options="assigneeOptions"
                        :error="fieldError('traveller_nip')"
                    />
                    <FormInput v-model="form.order_giver" label="Pemberi tugas" required :error="fieldError('order_giver')" />
                </div>
                <FormMultiSelect
                    v-model="followerNips"
                    class="mt-4"
                    label="Pengikut terpilih"
                    placeholder="Ketik NIP atau nama pelaksana SPT"
                    hint="Ketik dan pilih pengikut langsung pada kolom ini."
                    :options="assigneeOptions"
                    :excluded-values="[form.traveller_nip]"
                    :error="fieldError('followers')"
                />
            </AppCard>

            <AppCard title="Rencana Perjalanan">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormSelect
                        v-model="form.travel_level"
                        label="Tingkat perjalanan"
                        searchable
                        placeholder="Pilih tingkat perjalanan"
                        :options="travelLevelOptions"
                        :error="fieldError('travel_level')"
                    />
                    <FormSelect
                        v-model="form.travel_type"
                        label="Jenis perjalanan"
                        searchable
                        placeholder="Pilih jenis perjalanan"
                        :options="travelTypeOptions"
                        :error="fieldError('travel_type')"
                    />
                    <FormDatePicker v-model="form.departure_date" label="Tanggal berangkat" required :error="fieldError('departure_date')" />
                    <FormDatePicker v-model="form.return_date" label="Tanggal kembali" required :error="fieldError('return_date')" />
                    <FormSelect
                        v-model="form.budget_agency"
                        label="Instansi anggaran"
                        required
                        searchable
                        endpoint="/references/units"
                        placeholder="Pilih unit instansi anggaran"
                        hint="Ketik nama atau kode unit."
                        :options="unitOptions"
                        :error="fieldError('budget_agency')"
                        @search="searchUnits"
                    />
                    <FormSelect
                        v-model="form.budget_account"
                        label="Mata anggaran"
                        searchable
                        placeholder="Pilih mata anggaran"
                        :options="budgetAccountOptions"
                        :error="fieldError('budget_account')"
                    />
                    <FormInput v-model="form.issued_place" label="Tempat terbit" required :error="fieldError('issued_place')" />
                    <FormDatePicker v-model="form.issued_date" label="Tanggal terbit" required :error="fieldError('issued_date')" />
                </div>
                <label class="mt-4 block text-sm font-semibold text-dark" for="description">Keterangan</label>
                <textarea id="description" v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" />
            </AppCard>

            <AppCard title="Pejabat Penandatangan">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormSelect
                        v-model="form.signatory.nip"
                        label="Penandatangan"
                        required
                        searchable
                        endpoint="/references/pegawai"
                        placeholder="Ketik NIP atau nama"
                        hint="Ketik minimal dua karakter; hanya pegawai aktif ditampilkan."
                        :options="signatoryOptions"
                        :error="fieldError('signatory.nip')"
                        @search="searchSignatories"
                    />
                    <FormInput v-model="form.signatory.signatory_role" label="Jabatan pada dokumen" :error="fieldError('signatory.signatory_role')" />
                    <FormInput v-model="form.signatory.behalf_of" label="Atas nama" :error="fieldError('signatory.behalf_of')" />
                    <label class="flex min-h-10 items-center gap-2 text-sm text-dark">
                        <input v-model="form.signatory.is_acting" type="checkbox" class="rounded border" />
                        Pelaksana tugas (Plt./Plh.)
                    </label>
                </div>
            </AppCard>

            <div class="flex justify-end">
                <AppButton type="submit" :loading="saving" gradient>{{ editing ? 'Simpan draft' : 'Buat draft SPPD' }}</AppButton>
            </div>
        </form>
    </div>
</template>
