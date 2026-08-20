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
const roles = ref([]);
const permissionOptions = ref([]);

const columns = [
    { key: 'name', label: 'Role', priority: 1, sortable: true },
    { key: 'description', label: 'Keterangan' },
    { key: 'permissions_label', label: 'Hak akses' },
    { key: 'users_count', label: 'Pengguna' },
    { key: 'actions', label: 'Aksi' },
];
const rows = computed(() => roles.value.map((role) => ({
    ...role,
    permissions_label: role.permissions.includes('*')
        ? 'Semua hak akses'
        : role.permissions
            .map((permission) => permissionOptions.value.find((option) => option.value === permission)?.label ?? permission)
            .join(', '),
})));

function editRole(role) {
    router.push({ name: 'role.edit', params: { roleId: role.id } });
}

async function load() {
    loading.value = true;
    message.value = '';
    try {
        const result = await perjadinApi.roles();
        roles.value = result.data ?? [];
        permissionOptions.value = result.meta?.permission_options ?? [];
    } catch (exception) {
        message.value = exception.message;
    } finally {
        loading.value = false;
    }
}

async function removeRole(role) {
    if (!window.confirm(`Hapus role ${role.name}? Role yang masih digunakan tidak dapat dihapus.`)) return;

    deletingId.value = role.id;
    message.value = '';
    try {
        await perjadinApi.deleteRole(role.id);
        roles.value = roles.value.filter((item) => item.id !== role.id);
        toast.success('Role berhasil dihapus.');
    } catch (exception) {
        message.value = exception.message;
    } finally {
        deletingId.value = null;
    }
}

onMounted(load);
</script>

<template>
    <LoadingSpinner v-if="loading" label="Memuat role…" size="lg" />
    <div v-else>
        <PageHeader title="Manajemen Role" subtitle="Tetapkan hak akses yang dapat diberikan kepada pengguna.">
            <AppButton @click="router.push({ name: 'role.create' })">Tambah role</AppButton>
        </PageHeader>

        <AppAlert v-if="message" type="danger" class="mb-4">{{ message }}</AppAlert>

        <AppCard title="Daftar Role" :padded="false">
            <DataTable :columns="columns" :rows="rows" empty-title="Belum ada role">
                <template #cell-actions="{ row }">
                    <div class="flex justify-end gap-2">
                        <AppButton size="sm" variant="secondary" @click="editRole(row)">Ubah</AppButton>
                        <AppButton size="sm" variant="danger" :loading="deletingId === row.id" @click="removeRole(row)">Hapus</AppButton>
                    </div>
                </template>
            </DataTable>
        </AppCard>
    </div>
</template>
