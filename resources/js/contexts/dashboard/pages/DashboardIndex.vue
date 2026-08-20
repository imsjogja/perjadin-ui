<script setup>
import {
    ClipboardDocumentListIcon,
    DocumentPlusIcon,
    UserPlusIcon,
} from '@heroicons/vue/24/outline';
import AppCard from '@/shared/components/AppCard.vue';
import PageHeader from '@/shared/components/PageHeader.vue';

const workflow = [
    {
        title: 'Terbitkan SPT',
        text: 'Masukkan dasar, tujuan, waktu, dan pejabat penandatangan.',
        route: 'spt.create',
        icon: DocumentPlusIcon,
    },
    {
        title: 'Tambahkan pelaksana',
        text: 'Tambahkan pegawai dari SIKKEPO langsung pada detail SPT.',
        route: 'spt.index',
        icon: UserPlusIcon,
    },
    {
        title: 'Buat SPPD bila diperlukan',
        text: 'SPPD hanya dibuat untuk pelaksana yang telah tercatat pada SPT.',
        route: 'spt.index',
        icon: ClipboardDocumentListIcon,
    },
];
</script>

<template>
    <div>
        <PageHeader title="Dashboard" subtitle="Mulai dan pantau proses administrasi perjalanan dinas." />

        <AppCard title="Alur kerja Perjadin" subtitle="Data pegawai dibaca dari SIKKEPO melalui Perjadin API.">
            <ol class="grid gap-4 md:grid-cols-3">
                <li v-for="(step, index) in workflow" :key="step.title" class="rounded-md border bg-light/40 p-4">
                    <div class="flex items-center gap-3">
                        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">{{ index + 1 }}</span>
                        <component :is="step.icon" class="h-6 w-6 text-brand-500" aria-hidden="true" />
                    </div>
                    <h2 class="mt-3 text-sm font-bold text-dark">{{ step.title }}</h2>
                    <p class="mt-1 text-sm text-slate-600">{{ step.text }}</p>
                    <RouterLink :to="{ name: step.route }" class="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-800">
                        Buka modul
                    </RouterLink>
                </li>
            </ol>
        </AppCard>

        <div class="mt-4 grid gap-4 lg:grid-cols-2">
            <AppCard title="Ketentuan proses">
                <ul class="space-y-2 text-sm text-slate-600">
                    <li>Nomor SPT dan SPPD dibentuk server secara atomik per tahun.</li>
                    <li>Snapshot pegawai disimpan pada transaksi agar dokumen historis tetap konsisten.</li>
                    <li>Penambahan pelaksana menghasilkan revisi penugasan pada SPT.</li>
                </ul>
            </AppCard>
            <AppCard title="Koneksi API">
                <p class="text-sm text-slate-600">
                    Atur <code class="rounded bg-light px-1 py-0.5 text-xs">VITE_PERJADIN_API_URL</code> pada `.env` sebelum menggunakan data produksi.
                </p>
            </AppCard>
        </div>
    </div>
</template>
