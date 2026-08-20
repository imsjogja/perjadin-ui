<script setup>
import { computed, ref } from 'vue';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline';
import LoadingSpinner from './LoadingSpinner.vue';
import EmptyState from './EmptyState.vue';

/*
 * DataTable — tabel data dengan pencarian, sort, dan pagination.
 * Saat ini seluruh proses dilakukan CLIENT-SIDE terhadap prop `rows`.
 *
 * API-ready: nanti aktifkan mode server-side dengan mengisi prop `endpoint`
 * (endpoint Yajra DataTables di backend). Pada mode itu, emit `query-change`
 * membawa { search, sortKey, sortDir, page, perPage } dan parent mengganti
 * `rows` dari respons server — markup komponen tidak perlu diubah.
 */
const props = defineProps({
    columns: { type: Array, required: true }, // [{ key, label, sortable?, priority? (1 = tampil di card mobile) }]
    rows: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    searchable: { type: Boolean, default: true },
    searchPlaceholder: { type: String, default: 'Cari…' },
    perPageOptions: { type: Array, default: () => [10, 25, 50] },
    endpoint: { type: String, default: '' }, // reserved: mode server-side (Yajra)
    emptyTitle: { type: String, default: 'Belum ada data' },
});

const emit = defineEmits(['query-change']);

const search = ref('');
const sortKey = ref('');
const sortDir = ref('asc');
const page = ref(1);
const perPage = ref(10);

function notifyQuery() {
    emit('query-change', {
        search: search.value,
        sortKey: sortKey.value,
        sortDir: sortDir.value,
        page: page.value,
        perPage: perPage.value,
    });
}

const filtered = computed(() => {
    if (!search.value) return props.rows;
    const q = search.value.toLowerCase();
    return props.rows.filter((row) =>
        props.columns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q)),
    );
});

const sorted = computed(() => {
    if (!sortKey.value) return filtered.value;
    const key = sortKey.value;
    return [...filtered.value].sort((a, b) => {
        const va = a[key] ?? '';
        const vb = b[key] ?? '';
        const cmp = String(va).localeCompare(String(vb), 'id');
        return sortDir.value === 'asc' ? cmp : -cmp;
    });
});

const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage.value)));

const paged = computed(() => {
    const start = (page.value - 1) * perPage.value;
    return sorted.value.slice(start, start + perPage.value);
});

function toggleSort(col) {
    if (!col.sortable) return;
    if (sortKey.value === col.key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = col.key;
        sortDir.value = 'asc';
    }
    page.value = 1;
    notifyQuery();
}

function goTo(p) {
    page.value = Math.min(Math.max(1, p), totalPages.value);
    notifyQuery();
}

function onSearchInput() {
    page.value = 1;
    notifyQuery();
}

// Kolom prioritas 1 ditampilkan sebagai judul kartu pada viewport < lg
const primaryKey = computed(() => props.columns.find((c) => c.priority === 1)?.key ?? props.columns[0]?.key);
</script>

<template>
    <div class="flex flex-col gap-3 p-2">
        <div v-if="searchable" class="relative max-w-xs">
            <MagnifyingGlassIcon
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
            />
            <label class="sr-only" for="datatable-search">Pencarian tabel</label>
            <input
                id="datatable-search"
                v-model="search"
                type="search"
                :placeholder="searchPlaceholder"
                class="block w-full rounded-md border pl-9 text-sm shadow-sm min-h-10 focus:border-brand-500 focus:ring-brand-500"
                @input="onSearchInput"
            />
        </div>

        <LoadingSpinner v-if="loading" />
        <EmptyState v-else-if="paged.length === 0" :title="emptyTitle" />

        <template v-else>
            <!-- Tampilan tabel untuk viewport >= lg -->
            <div class="hidden overflow-x-auto lg:block">
                <table class="w-full border-collapse text-sm">
                    <thead>
                        <tr class="border-b bg-light text-left">
                            <th
                                v-for="col in columns"
                                :key="col.key"
                                scope="col"
                                class="px-3 py-2 font-semibold text-dark"
                                :class="col.sortable ? 'cursor-pointer select-none hover:text-brand-600' : ''"
                                :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined"
                                @click="toggleSort(col)"
                            >
                                <span class="inline-flex items-center gap-1">
                                    {{ col.label }}
                                    <span v-if="col.sortable && sortKey === col.key" aria-hidden="true">
                                        {{ sortDir === 'asc' ? '▲' : '▼' }}
                                    </span>
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, idx) in paged" :key="row.id ?? idx" class="border-b last:border-0 hover:bg-brand-50/40">
                            <td v-for="col in columns" :key="col.key" class="px-3 py-2 text-slate-700">
                                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                                    {{ row[col.key] }}
                                </slot>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Tampilan kartu untuk viewport < lg (kolom priority) -->
            <ul class="flex flex-col gap-2 lg:hidden">
                <li v-for="(row, idx) in paged" :key="row.id ?? idx" class="card p-3">
                    <p class="text-sm font-bold text-dark">{{ row[primaryKey] }}</p>
                    <dl class="mt-1 flex flex-col gap-1">
                        <div
                            v-for="col in columns.filter((c) => c.key !== primaryKey)"
                            :key="col.key"
                            class="flex items-center justify-between gap-2 text-xs"
                        >
                            <dt class="text-slate-500">{{ col.label }}</dt>
                            <dd class="text-right text-slate-700">
                                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                                    {{ row[col.key] }}
                                </slot>
                            </dd>
                        </div>
                    </dl>
                </li>
            </ul>
        </template>

        <!-- Pagination -->
        <div class="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <p>
                Menampilkan {{ paged.length }} dari {{ sorted.length }} data
            </p>
            <div class="flex items-center gap-1">
                <button
                    type="button"
                    class="min-h-10 min-w-10 inline-flex items-center justify-center rounded-md border bg-surface hover:bg-light disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="page <= 1"
                    aria-label="Halaman sebelumnya"
                    @click="goTo(page - 1)"
                >
                    <ChevronLeftIcon class="h-4 w-4" aria-hidden="true" />
                </button>
                <span class="px-2 text-xs">Halaman {{ page }} / {{ totalPages }}</span>
                <button
                    type="button"
                    class="min-h-10 min-w-10 inline-flex items-center justify-center rounded-md border bg-surface hover:bg-light disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="page >= totalPages"
                    aria-label="Halaman berikutnya"
                    @click="goTo(page + 1)"
                >
                    <ChevronRightIcon class="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    </div>
</template>
