<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import DataTable from '@/shared/components/DataTable.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const toast = useToast();
const router = useRouter();
const loading = ref(true);
const deletingId = ref(null);
const message = ref('');
const users = ref([]);

const columns = [
    { key: 'name', label: 'Nama', priority: 1, sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: 'Aksi' },
];
const rows = computed(() => users.value.map((user) => ({
    ...user,
    role: user.role?.name ?? 'Belum memiliki role',
})));

function editUser(user) {
    router.push({ name: 'user.edit', params: { userId: user.id } });
}

async function load() {
    loading.value = true;
    message.value = '';
    try {
        const userResult = await perjadinApi.users();
        users.value = userResult.data ?? [];
    } catch (exception) {
        message.value = exception.message;
    } finally {
        loading.value = false;
    }
}

async function removeUser(user) {
    if (!window.confirm(`Hapus pengguna ${user.name}? Tindakan ini tidak dapat dibatalkan.`)) return;

    deletingId.value = user.id;
    message.value = '';
    try {
        await perjadinApi.deleteUser(user.id);
        users.value = users.value.filter((item) => item.id !== user.id);
        toast.success('Pengguna berhasil dihapus.');
    } catch (exception) {
        message.value = exception.message;
    } finally {
        deletingId.value = null;
    }
}

onMounted(load);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat pengguna…" size="lg" />
    <div v-else>
        <PageHeader title="Manajemen Pengguna" subtitle="Atur akun yang dapat mengakses aplikasi perjalanan dinas.">
            <AppButton @click="router.push({ name: 'user.create' })">Tambah pengguna</AppButton>
        </PageHeader>

        <AppAlert v-if="message" type="danger" class="mb-4">{{ message }}</AppAlert>

        <AppCard title="Daftar Pengguna" :padded="false">
            <DataTable :columns="columns" :rows="rows" empty-title="Belum ada pengguna">
                <template #cell-actions="{ row }">
                    <div class="flex justify-end gap-2">
                        <AppButton size="sm" variant="secondary" @click="editUser(row)">Ubah</AppButton>
                        <AppButton size="sm" variant="danger" :loading="deletingId === row.id" @click="removeUser(row)">Hapus</AppButton>
                    </div>
                </template>
            </DataTable>
        </AppCard>
    </div>
</template>
