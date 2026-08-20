<script setup>
import { ref } from 'vue';
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline';
import AppButton from './AppButton.vue';
import AppCard from './AppCard.vue';
import DataTable from './DataTable.vue';
import FormDatePicker from './FormDatePicker.vue';
import FormSelect from './FormSelect.vue';

/*
 * ReportViewer — pola umum laporan: filter bar → tombol Tampilkan →
 * tabel hasil + tombol export.
 * Slot `filters` bisa dipakai untuk menambah filter khusus per laporan.
 * Saat ini memakai data mock; nanti sambungkan ke endpoint laporan backend.
 */
defineProps({
    title: { type: String, default: 'Laporan' },
    columns: { type: Array, required: true },
    rows: { type: Array, default: () => [] },
    unitOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
});

const emit = defineEmits(['apply', 'export']);

const tanggalMulai = ref('');
const tanggalSelesai = ref('');
const unit = ref('');

function apply() {
    emit('apply', {
        tanggalMulai: tanggalMulai.value,
        tanggalSelesai: tanggalSelesai.value,
        unit: unit.value,
    });
}
</script>

<template>
    <AppCard :title="title">
        <div class="flex flex-col gap-4">
            <!-- Filter bar -->
            <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
                <FormDatePicker v-model="tanggalMulai" label="Tanggal mulai" />
                <FormDatePicker v-model="tanggalSelesai" label="Tanggal selesai" />
                <FormSelect
                    v-model="unit"
                    label="Unit kerja"
                    :options="unitOptions"
                    placeholder="Semua unit"
                    searchable
                />
                <div class="flex items-end gap-2">
                    <AppButton class="flex-1" @click="apply">Tampilkan</AppButton>
                    <!-- Export dinonaktifkan: membutuhkan endpoint server (generate file di backend) -->
                    <span title="Membutuhkan endpoint server">
                        <AppButton variant="secondary" disabled>
                            <ArrowDownTrayIcon class="h-4 w-4" aria-hidden="true" />
                            Export
                        </AppButton>
                    </span>
                </div>
            </div>

            <slot name="filters" />

            <!-- Hasil -->
            <DataTable :columns="columns" :rows="rows" :loading="loading" empty-title="Belum ada hasil — atur filter lalu klik Tampilkan" />
        </div>
    </AppCard>
</template>
