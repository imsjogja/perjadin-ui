<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppAlert from '@/shared/components/AppAlert.vue';
import AppButton from '@/shared/components/AppButton.vue';
import FormInput from '@/shared/components/FormInput.vue';
import { useAuth } from '@/shared/composables/useAuth';

const router = useRouter();
const { login } = useAuth();
const form = reactive({ email: '', password: '' });
const loading = ref(false);
const error = ref('');

async function submit() {
    loading.value = true;
    error.value = '';

    try {
        await login(form);
        router.push({ name: 'dashboard.index' });
    } catch (exception) {
        error.value = exception.message;
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <main class="flex min-h-screen items-center justify-center bg-body-bg p-4">
        <section class="w-full max-w-md">
            <div class="mb-6 text-center">
                <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-brand text-lg font-bold text-white shadow-md">P</span>
                <h1 class="mt-3 text-xl font-bold text-dark">Perjadin</h1>
                <p class="mt-1 text-sm text-slate-500">Sistem Perjalanan Dinas</p>
            </div>

            <form class="card p-5" @submit.prevent="submit">
                <h2 class="text-base font-bold text-dark">Masuk ke aplikasi</h2>
                <p class="mt-1 text-sm text-slate-500">Gunakan akun yang terdaftar pada Perjadin API.</p>
                <AppAlert v-if="error" type="danger" class="mt-4">{{ error }}</AppAlert>
                <div class="mt-4 space-y-4">
                    <FormInput v-model="form.email" label="Email" type="email" required autocomplete="email" />
                    <FormInput v-model="form.password" label="Kata sandi" type="password" required autocomplete="current-password" />
                </div>
                <AppButton type="submit" class="mt-5 w-full" :loading="loading" gradient>Masuk</AppButton>
            </form>
        </section>
    </main>
</template>
