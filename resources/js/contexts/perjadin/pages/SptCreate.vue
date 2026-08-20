<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import FormDatePicker from '@/shared/components/FormDatePicker.vue';
import FormInput from '@/shared/components/FormInput.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { perjadinApi } from '@/services/perjadinApi';

const router = useRouter();
const saving = ref(false);
const errors = ref({});
const message = ref('');
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

async function submit() {
    saving.value = true;
    errors.value = {};
    message.value = '';

    try {
        const payload = {
            ...form,
            destination: { ...form.destination, duration_days: Number(form.destination.duration_days) },
        };
        const result = await perjadinApi.createSpt(payload);
        router.push({ name: 'spt.show', params: { id: result.data.id } });
    } catch (exception) {
        errors.value = exception.errors ?? {};
        message.value = exception.message;
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <div>
        <PageHeader title="Buat Surat Tugas" subtitle="Nomor dokumen akan dibuat oleh Perjadin API saat disimpan.">
            <AppButton variant="secondary" @click="router.push({ name: 'spt.index' })">Batal</AppButton>
        </PageHeader>

        <form class="space-y-4" @submit.prevent="submit">
            <AppAlert v-if="message" type="danger">{{ message }}</AppAlert>

            <AppCard title="Informasi Surat Tugas">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormInput v-model="form.unit_id" label="ID Unit" required hint="UUID unit sesuai kewenangan Perjadin." :error="fieldError('unit_id')" />
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
                <AppButton type="submit" gradient :loading="saving">Terbitkan SPT</AppButton>
            </div>
        </form>
    </div>
</template>
