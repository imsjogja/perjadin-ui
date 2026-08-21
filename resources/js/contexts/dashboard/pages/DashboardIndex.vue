<script setup>
import { computed, onMounted, ref } from 'vue';
import {
    ArrowPathIcon,
    ArrowTrendingUpIcon,
    CheckBadgeIcon,
    ClipboardDocumentListIcon,
    DocumentPlusIcon,
    MapPinIcon,
    UserGroupIcon,
} from '@heroicons/vue/24/outline';
import AppButton from '@/shared/components/AppButton.vue';
import ErrorState from '@/shared/components/ErrorState.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { perjadinApi } from '@/services/perjadinApi';

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const selectedVisual = ref('trend');
const selectedMonth = ref(null);
const selectedStatus = ref(null);
const loading = ref(true);
const error = ref('');
const dashboard = ref(null);

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });
const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const availableYears = computed(() => [currentYear, currentYear - 1, currentYear - 2]);
const kpis = computed(() => {
    const totals = dashboard.value?.kpis ?? {};

    return [
        {
            label: 'SPT diterbitkan',
            value: totals.spts ?? 0,
            description: `Dokumen tahun ${selectedYear.value}`,
            icon: ClipboardDocumentListIcon,
            tone: 'brand',
        },
        {
            label: 'Pelaksana tugas',
            value: totals.assignees ?? 0,
            description: 'Penugasan tercatat',
            icon: UserGroupIcon,
            tone: 'slate',
        },
        {
            label: 'SPPD dibuat',
            value: totals.sppds ?? 0,
            description: 'Terhubung dengan SPT',
            icon: MapPinIcon,
            tone: 'warning',
        },
        {
            label: 'SPPD terverifikasi',
            value: totals.verified_sppds ?? 0,
            description: 'Siap menjadi dokumen resmi',
            icon: CheckBadgeIcon,
            tone: 'success',
        },
    ];
});
const monthlySpts = computed(() => dashboard.value?.monthly_spts ?? []);
const statusTotals = computed(() => dashboard.value?.sppd_statuses ?? []);
const destinations = computed(() => dashboard.value?.destinations ?? []);
const recentSpts = computed(() => dashboard.value?.recent_spts ?? []);
const maxMonthlyTotal = computed(() => Math.max(...monthlySpts.value.map((item) => item.total), 1));
const maxDestinationTotal = computed(() => Math.max(...destinations.value.map((item) => item.total), 1));
const totalSppds = computed(() => statusTotals.value.reduce((total, item) => total + item.total, 0));
const selectedMonthData = computed(() => monthlySpts.value.find((item) => item.month === selectedMonth.value) ?? null);
const selectedStatusData = computed(() => statusTotals.value.find((item) => item.key === selectedStatus.value) ?? null);

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(value ?? 0);
}

function formatDate(value) {
    if (!value) return '-';

    return dateFormatter.format(new Date(value));
}

function monthLabel(month) {
    return monthFormatter.format(new Date(currentYear, month - 1, 1));
}

function barHeight(total) {
    if (!total) return 2;

    return Math.max(Math.round((total / maxMonthlyTotal.value) * 100), 10);
}

function destinationWidth(total) {
    if (!total) return 0;

    return Math.round((total / maxDestinationTotal.value) * 100);
}

function statusPercentage(total) {
    if (!totalSppds.value) return 0;

    return Math.round((total / totalSppds.value) * 100);
}

function selectVisual(visual) {
    selectedVisual.value = visual;
    selectedMonth.value = null;
    selectedStatus.value = null;
}

async function load() {
    loading.value = true;
    error.value = '';

    try {
        const result = await perjadinApi.dashboard({ year: selectedYear.value });
        dashboard.value = result.data;
    } catch (exception) {
        error.value = exception.message;
    } finally {
        loading.value = false;
    }
}

onMounted(load);
</script>

<template>
    <div>
        <PageHeader title="Dashboard" subtitle="Ikhtisar dokumen dan progres perjalanan dinas.">
            <div class="flex flex-wrap items-center gap-2">
                <label class="sr-only" for="dashboard-year">Tahun data dashboard</label>
                <select
                    id="dashboard-year"
                    v-model.number="selectedYear"
                    class="min-h-10 rounded-md border bg-surface px-3 text-sm font-semibold text-dark outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    @change="load"
                >
                    <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                </select>
                <AppButton variant="secondary" :loading="loading" aria-label="Muat ulang dashboard" @click="load">
                    <ArrowPathIcon class="h-4 w-4" aria-hidden="true" />
                    Perbarui
                </AppButton>
                <RouterLink
                    :to="{ name: 'spt.create' }"
                    class="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                    <DocumentPlusIcon class="h-4 w-4" aria-hidden="true" />
                    Buat SPT
                </RouterLink>
            </div>
        </PageHeader>

        <LoadingSpinner v-if="loading && !dashboard" label="Memuat ringkasan perjalanan dinas…" size="lg" />
        <ErrorState v-else-if="error && !dashboard" :message="error" @retry="load" />

        <template v-else-if="dashboard">
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article
                    v-for="kpi in kpis"
                    :key="kpi.label"
                    class="relative overflow-hidden rounded-lg border bg-surface p-4 shadow-sm"
                >
                    <div
                        class="absolute inset-x-0 top-0 h-1"
                        :class="{
                            brand: 'bg-brand-500',
                            slate: 'bg-slate-500',
                            warning: 'bg-warning-500',
                            success: 'bg-success-500',
                        }[kpi.tone]"
                    />
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ kpi.label }}</p>
                            <p class="mt-2 text-3xl font-bold tracking-tight text-dark">{{ formatNumber(kpi.value) }}</p>
                            <p class="mt-1 text-xs text-slate-500">{{ kpi.description }}</p>
                        </div>
                        <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                            :class="{
                                brand: 'bg-brand-50 text-brand-600',
                                slate: 'bg-slate-100 text-slate-600',
                                warning: 'bg-warning-50 text-warning-700',
                                success: 'bg-success-50 text-success-700',
                            }[kpi.tone]"
                        >
                            <component :is="kpi.icon" class="h-5 w-5" aria-hidden="true" />
                        </span>
                    </div>
                </article>
            </div>

            <p v-if="error" class="mt-3 text-sm text-danger-600">
                Data sebelumnya masih ditampilkan. {{ error }}
            </p>

            <div class="mt-4 grid gap-4 xl:grid-cols-3">
                <section class="card xl:col-span-2">
                    <div class="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                        <div>
                            <h2 class="text-sm font-bold text-dark">Analisis dokumen</h2>
                            <p class="mt-0.5 text-xs text-slate-500">
                                {{ selectedVisual === 'trend' ? 'Penerbitan SPT per bulan.' : 'Status SPPD pada tahun terpilih.' }}
                            </p>
                        </div>
                        <div class="inline-flex rounded-md bg-light p-1" role="group" aria-label="Pilih visual dashboard">
                            <button
                                type="button"
                                class="min-h-8 rounded px-3 text-xs font-semibold transition"
                                :class="selectedVisual === 'trend' ? 'bg-surface text-brand-700 shadow-sm' : 'text-slate-500 hover:text-dark'"
                                :aria-pressed="selectedVisual === 'trend'"
                                @click="selectVisual('trend')"
                            >
                                Tren SPT
                            </button>
                            <button
                                type="button"
                                class="min-h-8 rounded px-3 text-xs font-semibold transition"
                                :class="selectedVisual === 'status' ? 'bg-surface text-brand-700 shadow-sm' : 'text-slate-500 hover:text-dark'"
                                :aria-pressed="selectedVisual === 'status'"
                                @click="selectVisual('status')"
                            >
                                Status SPPD
                            </button>
                        </div>
                    </div>

                    <div v-if="selectedVisual === 'trend'" class="p-4">
                        <div class="flex min-h-7 items-center justify-between gap-3 text-xs">
                            <p class="font-semibold text-dark">
                                {{ selectedMonthData ? `${formatNumber(selectedMonthData.total)} SPT pada ${monthLabel(selectedMonthData.month)}` : 'Pilih batang untuk melihat detail bulanan.' }}
                            </p>
                            <span class="text-slate-500">{{ formatNumber(kpis[0].value) }} SPT total</span>
                        </div>
                        <div class="mt-5 grid h-56 grid-cols-12 items-end gap-2 border-b border-l px-3 pb-2 pt-3 sm:gap-3">
                            <button
                                v-for="item in monthlySpts"
                                :key="item.month"
                                type="button"
                                class="group flex h-full min-w-0 flex-col justify-end rounded-t outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                                :aria-label="`${monthLabel(item.month)}: ${item.total} SPT`"
                                :aria-pressed="selectedMonth === item.month"
                                @click="selectedMonth = item.month"
                            >
                                <span
                                    class="w-full rounded-t transition-all duration-300"
                                    :class="item.total ? (selectedMonth === item.month ? 'bg-brand-700' : 'bg-brand-400 group-hover:bg-brand-500') : 'bg-slate-200'"
                                    :style="{ height: `${barHeight(item.total)}%` }"
                                />
                                <span class="mt-2 truncate text-center text-[10px] font-semibold uppercase text-slate-500">{{ monthLabel(item.month) }}</span>
                            </button>
                        </div>
                    </div>

                    <div v-else class="p-4">
                        <div class="flex min-h-7 items-center justify-between gap-3 text-xs">
                            <p class="font-semibold text-dark">
                                {{ selectedStatusData ? `${formatNumber(selectedStatusData.total)} SPPD ${selectedStatusData.label.toLowerCase()}` : 'Pilih status untuk melihat proporsi dokumen.' }}
                            </p>
                            <span class="text-slate-500">{{ formatNumber(totalSppds) }} SPPD total</span>
                        </div>
                        <div class="mt-8 space-y-5">
                            <button
                                v-for="status in statusTotals"
                                :key="status.key"
                                type="button"
                                class="w-full rounded-md p-2 text-left transition hover:bg-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                                :class="selectedStatus === status.key ? 'bg-light' : ''"
                                :aria-pressed="selectedStatus === status.key"
                                @click="selectedStatus = status.key"
                            >
                                <span class="flex items-center justify-between gap-3 text-sm">
                                    <span class="font-semibold text-dark">{{ status.label }}</span>
                                    <span class="text-slate-600">{{ formatNumber(status.total) }} · {{ statusPercentage(status.total) }}%</span>
                                </span>
                                <span class="mt-2 block h-3 overflow-hidden rounded-full bg-slate-100">
                                    <span
                                        class="block h-full rounded-full transition-all duration-300"
                                        :class="status.key === 'verified' ? 'bg-success-500' : 'bg-warning-500'"
                                        :style="{ width: `${statusPercentage(status.total)}%` }"
                                    />
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                <section class="card">
                    <div class="border-b px-4 py-3">
                        <h2 class="text-sm font-bold text-dark">Tujuan terbanyak</h2>
                        <p class="mt-0.5 text-xs text-slate-500">Distribusi SPT berdasarkan lokasi tujuan.</p>
                    </div>
                    <div class="p-4">
                        <div v-if="destinations.length" class="space-y-4">
                            <div v-for="destination in destinations" :key="destination.label">
                                <div class="flex items-center justify-between gap-3 text-sm">
                                    <p class="truncate font-semibold text-dark" :title="destination.label">{{ destination.label }}</p>
                                    <span class="shrink-0 text-xs font-bold text-slate-500">{{ formatNumber(destination.total) }}</span>
                                </div>
                                <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div class="h-full rounded-full bg-brand-500" :style="{ width: `${destinationWidth(destination.total)}%` }" />
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex min-h-48 items-center justify-center rounded-md border border-dashed bg-light/40 p-4 text-center">
                            <p class="text-sm text-slate-500">Belum ada tujuan perjalanan pada tahun ini.</p>
                        </div>
                    </div>
                </section>
            </div>

            <div class="mt-4 grid gap-4 xl:grid-cols-3">
                <section class="card xl:col-span-2">
                    <div class="flex items-center justify-between gap-4 border-b px-4 py-3">
                        <div>
                            <h2 class="text-sm font-bold text-dark">Aktivitas dokumen terbaru</h2>
                            <p class="mt-0.5 text-xs text-slate-500">SPT terakhir diterbitkan pada tahun {{ selectedYear }}.</p>
                        </div>
                        <RouterLink :to="{ name: 'spt.index' }" class="text-sm font-semibold text-brand-600 hover:text-brand-800">Lihat semua</RouterLink>
                    </div>
                    <div v-if="recentSpts.length" class="divide-y">
                        <RouterLink
                            v-for="spt in recentSpts"
                            :key="spt.id"
                            :to="{ name: 'spt.show', params: { id: spt.id } }"
                            class="flex items-center gap-3 px-4 py-3 transition hover:bg-light/60"
                        >
                            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                                <ClipboardDocumentListIcon class="h-5 w-5" aria-hidden="true" />
                            </span>
                            <span class="min-w-0 flex-1">
                                <span class="block truncate text-sm font-semibold text-dark">{{ spt.document_number }}</span>
                                <span class="mt-0.5 block truncate text-xs text-slate-500">{{ spt.destination }}</span>
                            </span>
                            <span class="hidden text-right text-xs text-slate-500 sm:block">
                                <span class="block">{{ formatDate(spt.issued_date) }}</span>
                                <span class="mt-0.5 block">{{ formatNumber(spt.assignees_count) }} pelaksana · {{ formatNumber(spt.sppds_count) }} SPPD</span>
                            </span>
                        </RouterLink>
                    </div>
                    <div v-else class="flex min-h-40 items-center justify-center p-4 text-center">
                        <p class="text-sm text-slate-500">Belum ada SPT yang diterbitkan pada tahun {{ selectedYear }}.</p>
                    </div>
                </section>

                <section class="overflow-hidden rounded-lg bg-gradient-brand p-5 text-white shadow-sm">
                    <ArrowTrendingUpIcon class="h-7 w-7 text-white/80" aria-hidden="true" />
                    <h2 class="mt-6 text-lg font-bold">Pantau proses secara cepat</h2>
                    <p class="mt-2 text-sm leading-6 text-white/80">
                        Gunakan ringkasan ini untuk memantau penerbitan SPT, kelengkapan SPPD, dan dokumen yang telah diverifikasi.
                    </p>
                    <RouterLink
                        :to="{ name: 'spt.index' }"
                        class="mt-5 inline-flex min-h-10 items-center rounded-md bg-white px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                        Kelola Surat Tugas
                    </RouterLink>
                </section>
            </div>
        </template>
    </div>
</template>
