<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import AppCard from '@/shared/components/AppCard.vue';
import FormInput from '@/shared/components/FormInput.vue';
import FormSelect from '@/shared/components/FormSelect.vue';
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
const roles = ref([]);
const form = reactive({
    name: '',
    email: '',
    password: '',
    role_id: '',
});
const editing = computed(() => Boolean(route.params.userId));
const roleOptions = computed(() => roles.value.map((role) => ({ value: role.id, label: role.name })));

function fieldError(field) {
    return errors.value[field]?.[0] ?? '';
}

async function load() {
    loading.value = true;
    message.value = '';
    try {
        const [roleResult, userResult] = await Promise.all([
            perjadinApi.roles(),
            editing.value ? perjadinApi.users() : Promise.resolve(null),
        ]);
        roles.value = roleResult.data ?? [];

        if (!editing.value) return;

        const user = (userResult?.data ?? []).find((item) => item.id === Number(route.params.userId));
        if (!user) {
            message.value = 'Pengguna tidak ditemukan.';
            return;
        }

        Object.assign(form, {
            name: user.name,
            email: user.email,
            password: '',
            role_id: user.role_id ?? '',
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
            email: form.email,
            role_id: Number(form.role_id),
            ...(form.password ? { password: form.password } : {}),
        };

        if (editing.value) await perjadinApi.updateUser(route.params.userId, payload);
        else await perjadinApi.createUser(payload);

        toast.success(editing.value ? 'Pengguna berhasil diperbarui.' : 'Pengguna berhasil ditambahkan.');
        router.push({ name: 'user.index' });
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
    <LoadingSpinner v-if="loading" label="Memuat formulir pengguna…" size="lg" />
    <div v-else>
        <PageHeader :title="editing ? 'Ubah Pengguna' : 'Tambah Pengguna'" :subtitle="editing ? 'Kosongkan kata sandi bila tidak perlu diubah.' : 'Tetapkan role untuk menentukan hak akses pengguna.'">
            <AppButton variant="secondary" @click="router.push({ name: 'user.index' })">Kembali</AppButton>
        </PageHeader>

        <AppAlert v-if="message" type="danger" class="mb-4">{{ message }}</AppAlert>

        <AppCard>
            <form class="grid gap-4 md:grid-cols-2" @submit.prevent="submit">
                <FormInput v-model="form.name" label="Nama" required :error="fieldError('name')" />
                <FormInput v-model="form.email" type="email" label="Email" required :error="fieldError('email')" />
                <FormInput
                    v-model="form.password"
                    type="password"
                    :label="editing ? 'Kata sandi baru' : 'Kata sandi'"
                    :required="!editing"
                    hint="Minimal delapan karakter."
                    :error="fieldError('password')"
                />
                <FormSelect v-model="form.role_id" label="Role" required placeholder="Pilih role" :options="roleOptions" :error="fieldError('role_id')" />
                <div class="flex justify-end gap-2 md:col-span-2">
                    <AppButton variant="secondary" @click="router.push({ name: 'user.index' })">Batal</AppButton>
                    <AppButton type="submit" :loading="saving">{{ editing ? 'Simpan perubahan' : 'Tambah pengguna' }}</AppButton>
                </div>
            </form>
        </AppCard>
    </div>
</template>
