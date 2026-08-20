<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import FormInput from '@/shared/components/FormInput.vue';
import LoadingSpinner from '@/shared/components/LoadingSpinner.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { useToast } from '@/shared/composables/useToast';
import { perjadinApi } from '@/services/perjadinApi';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const message = ref('');
const errors = ref({});
const permissionOptions = ref([]);
const form = reactive({
    name: '',
    description: '',
    permissions: [],
});
const editing = computed(() => Boolean(route.params.roleId));

function fieldError(field) {
    return errors.value[field]?.[0] ?? '';
}

function togglePermission(permission, checked) {
    form.permissions = checked
        ? [...new Set([...form.permissions, permission])]
        : form.permissions.filter((item) => item !== permission);
}

async function load() {
    loading.value = true;
    message.value = '';
    try {
        const result = await perjadinApi.roles();
        permissionOptions.value = result.meta?.permission_options ?? [];

        if (!editing.value) return;

        const role = (result.data ?? []).find((item) => item.id === Number(route.params.roleId));
        if (!role) {
            message.value = 'Role tidak ditemukan.';
            return;
        }

        Object.assign(form, {
            name: role.name,
            description: role.description ?? '',
            permissions: role.permissions.includes('*')
                ? permissionOptions.value.map((option) => option.value)
                : [...role.permissions],
        });
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
            name: form.name,
            description: form.description || null,
            permissions: form.permissions,
        };

        if (editing.value) await perjadinApi.updateRole(route.params.roleId, payload);
        else await perjadinApi.createRole(payload);

        toast.success(editing.value ? 'Role berhasil diperbarui.' : 'Role berhasil ditambahkan.');
        router.push({ name: 'role.index' });
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
    <LoadingSpinner v-if="loading" label="Memuat formulir role…" size="lg" />
    <div v-else>
        <PageHeader :title="editing ? 'Ubah Role' : 'Tambah Role'" subtitle="Tetapkan hak akses yang dapat diberikan kepada pengguna.">
            <AppButton variant="secondary" @click="router.push({ name: 'role.index' })">Kembali</AppButton>
        </PageHeader>

        <AppAlert v-if="message" type="danger" class="mb-4">{{ message }}</AppAlert>

        <AppCard>
            <form class="space-y-4" @submit.prevent="submit">
                <div class="grid gap-4 md:grid-cols-2">
                    <FormInput v-model="form.name" label="Nama role" required :error="fieldError('name')" />
                    <div>
                        <label class="block text-sm font-semibold text-dark" for="role-description">Keterangan</label>
                        <textarea id="role-description" v-model="form.description" rows="2" class="mt-1 block w-full rounded-md border text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500" />
                        <p v-if="fieldError('description')" class="mt-1 text-xs text-danger-600">{{ fieldError('description') }}</p>
                    </div>
                </div>

                <fieldset>
                    <legend class="text-sm font-semibold text-dark">Hak akses</legend>
                    <div class="mt-2 grid gap-2 md:grid-cols-3">
                        <label v-for="option in permissionOptions" :key="option.value" class="flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm text-dark">
                            <input
                                type="checkbox"
                                :checked="form.permissions.includes(option.value)"
                                @change="togglePermission(option.value, $event.target.checked)"
                            />
                            {{ option.label }}
                        </label>
                    </div>
                    <p v-if="fieldError('permissions')" class="mt-1 text-xs text-danger-600">{{ fieldError('permissions') }}</p>
                </fieldset>

                <div class="flex justify-end gap-2">
                    <AppButton variant="secondary" @click="router.push({ name: 'role.index' })">Batal</AppButton>
                    <AppButton type="submit" :loading="saving">{{ editing ? 'Simpan perubahan' : 'Tambah role' }}</AppButton>
                </div>
            </form>
        </AppCard>
    </div>
</template>
