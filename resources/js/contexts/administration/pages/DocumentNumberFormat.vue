<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import FormInput from '@/shared/components/FormInput.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const message = ref('');
const errors = ref({});
const formats = ref(null);
const form = reactive({
    spt_format: '',
    sppd_format: '',
});

const samples = computed(() => ({
    spt: preview(form.spt_format || formats.value?.spt?.effective_value, 'SPT'),
    sppd: preview(form.sppd_format || formats.value?.sppd?.effective_value, 'SPPD'),
}));

function preview(format, type) {
    return (format ?? '')
        .replaceAll('{number}', '00001')
        .replaceAll('{year}', '2026')
        .replaceAll('{type}', type);
}

function fieldError(field) {
    return errors.value[field]?.[0] ?? '';
}

function sourceLabel(source) {
    return {
        application: 'pengaturan aplikasi',
        environment: '.env.local',
        default: 'nilai bawaan',
    }[source] ?? 'nilai bawaan';
}

function useFallback() {
    form.spt_format = '';
    form.sppd_format = '';
}

async function load() {
    loading.value = true;
    message.value = '';

    try {
        const result = await perjadinApi.documentNumberFormats();
        formats.value = result.data;
        form.spt_format = result.data?.spt?.custom_value ?? '';
        form.sppd_format = result.data?.sppd?.custom_value ?? '';
    } catch (exception) {
        message.value = exception.message;
    } finally {
        loading.value = false;
    }
}

async function submit() {
    saving.value = true;
    message.value = '';
    errors.value = {};

    try {
        const result = await perjadinApi.updateDocumentNumberFormats({
            spt_format: form.spt_format.trim(),
            sppd_format: form.sppd_format.trim(),
        });
        formats.value = result.data;
        form.spt_format = result.data?.spt?.custom_value ?? '';
        form.sppd_format = result.data?.sppd?.custom_value ?? '';
        toast.success('Format nomor dokumen berhasil disimpan.');
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
    <LoadingSpinner v-if="loading" label="Memuat format nomor…" size="lg" />
    <div v-else>
        <PageHeader
            title="Format Nomor Dokumen"
            subtitle="Berlaku untuk SPT dan SPPD yang dibuat setelah pengaturan disimpan."
        />

        <AppAlert v-if="message" type="danger" class="mb-4">{{ message }}</AppAlert>

        <AppCard>
            <form class="space-y-5" @submit.prevent="submit">
                <AppAlert type="info">
                    Gunakan <code>{number}</code> untuk nomor urut lima digit, <code>{year}</code> untuk tahun, dan
                    <code>{type}</code> untuk jenis dokumen. Placeholder <code>{number}</code> wajib ada.
                </AppAlert>

                <div class="grid gap-4 lg:grid-cols-2">
                    <section class="space-y-3 rounded-md border p-4">
                        <div>
                            <h2 class="font-semibold text-dark">Nomor SPT</h2>
                            <p class="mt-1 text-sm text-slate-500">
                                Aktif dari {{ sourceLabel(formats?.spt?.source) }}:
                                <code>{{ formats?.spt?.effective_value }}</code>
                            </p>
                        </div>
                        <FormInput
                            v-model="form.spt_format"
                            label="Format SPT"
                            placeholder="823-{number}/BKD-{type}/{year}"
                            :error="fieldError('spt_format')"
                            hint="Kosongkan untuk kembali memakai .env.local atau nilai bawaan."
                        />
                        <p class="rounded bg-light px-3 py-2 text-sm text-dark">
                            Contoh: <strong>{{ samples.spt }}</strong>
                        </p>
                    </section>

                    <section class="space-y-3 rounded-md border p-4">
                        <div>
                            <h2 class="font-semibold text-dark">Nomor SPPD</h2>
                            <p class="mt-1 text-sm text-slate-500">
                                Aktif dari {{ sourceLabel(formats?.sppd?.source) }}:
                                <code>{{ formats?.sppd?.effective_value }}</code>
                            </p>
                        </div>
                        <FormInput
                            v-model="form.sppd_format"
                            label="Format SPPD"
                            placeholder="823-{number}/BKD-{type}/{year}"
                            :error="fieldError('sppd_format')"
                            hint="Kosongkan untuk kembali memakai .env.local atau nilai bawaan."
                        />
                        <p class="rounded bg-light px-3 py-2 text-sm text-dark">
                            Contoh: <strong>{{ samples.sppd }}</strong>
                        </p>
                    </section>
                </div>

                <div class="flex flex-wrap justify-end gap-2">
                    <AppButton variant="secondary" :disabled="saving" @click="useFallback">
                        Gunakan fallback
                    </AppButton>
                    <AppButton type="submit" :loading="saving">Simpan format</AppButton>
                </div>
            </form>
        </AppCard>
    </div>
</template>
