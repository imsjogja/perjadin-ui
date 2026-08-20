<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import FormDatePicker from '@/shared/components/FormDatePicker.vue';
import FormInput from '@/shared/components/FormInput.vue';
import FormSelect from '@/shared/components/FormSelect.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { perjadinApi } from '@/services/perjadinApi';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const errors = ref({});
const message = ref('');
const referenceError = ref('');
const unitOptions = ref([]);
const signatoryOptions = ref([]);
const editing = computed(() => Boolean(route.params.id));
const form = reactive({
    unit_id: '',
    dasar: '',
    disposisi: '',
    dalam_rangka: '',
    issued_place: '',
    issued_date: '',
    destination: {
        transportation: '',
        departure_place: '',
        destination_place: '',
        duration_days: 1,
    },
    signatory: {
        nip: '',
        behalf_of: '',
        signatory_role: '',
        is_acting: false,
    },
});

function fieldError(field) {
    return errors.value[field]?.[0] ?? '';
}

function unitLabel(unit) {
    return [unit.kode, unit.nama].filter(Boolean).join(' — ');
}

function pegawaiLabel(pegawai) {
    const identity = [pegawai.nip, pegawai.nama].filter(Boolean).join(' — ');
    return pegawai.jabatan?.nama ? `${identity} (${pegawai.jabatan.nama})` : identity;
}

function dateValue(value) {
    return value ? String(value).slice(0, 10) : '';
}

function addOption(options, option) {
    if (!option?.value) return;

    const index = options.findIndex((item) => String(item.value) === String(option.value));
    if (index === -1) {
        options.push(option);
        return;
    }

    options.splice(index, 1, option);
}

async function searchUnits(keyword = '') {
    referenceError.value = '';

    try {
        const result = await perjadinApi.units({ q: keyword.trim(), per_page: 50 });
        const options = [...unitOptions.value];
        (result.data ?? []).forEach((unit) => addOption(options, {
            value: unit.id,
            label: unitLabel(unit),
        }));
        unitOptions.value = options;
    } catch (exception) {
        referenceError.value = exception.message;
    }
}

async function searchSignatories(keyword) {
    const query = keyword.trim();
    signatoryOptions.value = [];

    if (query.length < 2) return;

    referenceError.value = '';

    try {
        const result = await perjadinApi.pegawai({ q: query, aktif: true, per_page: 20 });
        signatoryOptions.value = (result.data ?? []).map((pegawai) => ({
            value: pegawai.nip,
            label: pegawaiLabel(pegawai),
        }));
    } catch (exception) {
        referenceError.value = exception.message;
    }
}

function populateForm(spt) {
    const signatory = spt.signatory ?? {};
    Object.assign(form, {
        unit_id: spt.unit_id ?? '',
        dasar: spt.dasar ?? '',
        disposisi: spt.disposisi ?? '',
        dalam_rangka: spt.dalam_rangka ?? '',
        issued_place: spt.issued_place ?? '',
        issued_date: dateValue(spt.issued_date),
        destination: {
            transportation: spt.destination?.transportation ?? '',
            departure_place: spt.destination?.departure_place ?? '',
            destination_place: spt.destination?.destination_place ?? '',
            duration_days: spt.destination?.duration_days ?? 1,
        },
        signatory: {
            nip: signatory.employee_snapshot?.nip ?? '',
            behalf_of: signatory.behalf_of ?? '',
            signatory_role: signatory.signatory_role ?? '',
            is_acting: Boolean(signatory.is_acting),
        },
    });

    addOption(unitOptions.value, {
        value: spt.unit_id,
        label: `Unit ${spt.unit_id}`,
    });
    addOption(signatoryOptions.value, {
        value: signatory.employee_snapshot?.nip,
        label: pegawaiLabel(signatory.employee_snapshot ?? {}),
    });
}

async function load() {
    if (!editing.value) {
        await searchUnits();
        return;
    }

    loading.value = true;
    message.value = '';
    try {
        const result = await perjadinApi.spt(route.params.id);
        populateForm(result.data);
        await searchUnits();
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
            destination: { ...form.destination, duration_days: Number(form.destination.duration_days) },
        };
        const result = editing.value
            ? await perjadinApi.updateSpt(route.params.id, payload)
            : await perjadinApi.createSpt(payload);
        router.push({ name: 'spt.show', params: { id: result.data.id } });
    } catch (exception) {
        errors.value = exception.errors ?? {};
        message.value = exception.message;
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat Surat Tugas…" size="lg" />
    <div v-else>
        <PageHeader
            :title="editing ? 'Ubah Surat Tugas' : 'Buat Surat Tugas'"
            :subtitle="editing ? 'Perbarui informasi tanpa mengubah nomor dokumen.' : 'Nomor dokumen akan dibuat oleh Perjadin API saat disimpan.'"
        >
            <AppButton variant="secondary" @click="router.push(editing ? { name: 'spt.show', params: { id: route.params.id } } : { name: 'spt.index' })">Batal</AppButton>
        </PageHeader>

        <form class="space-y-4" @submit.prevent="submit">
            <AppAlert v-if="message" type="danger">{{ message }}</AppAlert>
            <AppAlert v-if="referenceError" type="danger">{{ referenceError }}</AppAlert>

            <AppCard title="Informasi Surat Tugas">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormSelect
                        v-model="form.unit_id"
                        label="Unit penerbit"
                        required
                        searchable
                        endpoint="/references/units"
                        placeholder="Pilih unit"
                        hint="Ketik nama atau kode unit untuk mencari."
                        :options="unitOptions"
                        :error="fieldError('unit_id')"
                        @search="searchUnits"
                    />
                    <FormDatePicker v-model="form.issued_date" label="Tanggal terbit" required :error="fieldError('issued_date')" />
                    <FormInput v-model="form.issued_place" label="Tempat terbit" required :error="fieldError('issued_place')" />
                    <FormInput v-model="form.disposisi" label="Disposisi" :error="fieldError('disposisi')" />
                </div>
                <label class="mt-4 block text-sm font-semibold text-dark" for="dasar">Dasar <span class="text-danger-500">*</span></label>
                <textarea id="dasar" v-model="form.dasar" rows="3" class="mt-1 block w-full rounded-md border text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" :class="fieldError('dasar') ? 'border-danger-500' : ''" />
                <p v-if="fieldError('dasar')" class="mt-1 text-xs text-danger-600">{{ fieldError('dasar') }}</p>
                <label class="mt-4 block text-sm font-semibold text-dark" for="dalam-rangka">Dalam rangka <span class="text-danger-500">*</span></label>
                <textarea id="dalam-rangka" v-model="form.dalam_rangka" rows="3" class="mt-1 block w-full rounded-md border text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" :class="fieldError('dalam_rangka') ? 'border-danger-500' : ''" />
                <p v-if="fieldError('dalam_rangka')" class="mt-1 text-xs text-danger-600">{{ fieldError('dalam_rangka') }}</p>
            </AppCard>

            <AppCard title="Tujuan Perjalanan">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormInput v-model="form.destination.transportation" label="Transportasi" required :error="fieldError('destination.transportation')" />
                    <FormInput v-model="form.destination.duration_days" label="Lama perjalanan (hari)" type="number" required :error="fieldError('destination.duration_days')" />
                    <FormInput v-model="form.destination.departure_place" label="Tempat berangkat" required :error="fieldError('destination.departure_place')" />
                    <FormInput v-model="form.destination.destination_place" label="Tujuan" required :error="fieldError('destination.destination_place')" />
                </div>
            </AppCard>

            <AppCard title="Pejabat Penandatangan">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormSelect
                        v-model="form.signatory.nip"
                        label="Penandatangan"
                        required
                        searchable
                        endpoint="/references/pegawai"
                        placeholder="Cari penandatangan"
                        hint="Ketik minimal dua karakter nama atau NIP; hanya pegawai aktif ditampilkan."
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
                <AppButton type="submit" gradient :loading="saving">{{ editing ? 'Simpan perubahan' : 'Terbitkan SPT' }}</AppButton>
            </div>
        </form>
    </div>
</template>
