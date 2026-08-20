<script setup>
import { computed } from 'vue';

/*
 * AppButton — tombol standar dengan varian token.
 * Target sentuh >= 40px (min-h-10).
 * Prop `gradient` (default false) memakai utility `bg-gradient-brand`
 * untuk varian primary — aksen gradien ala Color Admin (gradient enabled).
 */
const props = defineProps({
    variant: { type: String, default: 'primary' }, // primary|secondary|success|warning|danger|ghost
    size: { type: String, default: 'md' }, // sm|md
    type: { type: String, default: 'button' },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    gradient: { type: Boolean, default: false },
});

const classes = computed(() => {
    const variants = {
        primary: props.gradient
            ? 'bg-gradient-brand text-white hover:opacity-90 focus-visible:outline-brand-500 disabled:bg-none disabled:bg-brand-300'
            : 'bg-brand-500 text-white hover:bg-brand-600 focus-visible:outline-brand-500 disabled:bg-brand-300',
        secondary: 'bg-surface text-dark border hover:bg-light focus-visible:outline-brand-500 disabled:text-slate-400',
        success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:outline-success-500 disabled:bg-success-100',
        warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:outline-warning-500 disabled:bg-warning-100',
        danger: 'bg-danger-500 text-white hover:bg-danger-600 focus-visible:outline-danger-500 disabled:bg-danger-100',
        ghost: 'text-brand-600 hover:bg-brand-50 focus-visible:outline-brand-500 disabled:text-slate-400',
    };
    const sizes = {
        sm: 'min-h-10 px-3 text-sm',
        md: 'min-h-10 px-4 text-sm',
    };
    return [
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold',
        'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed',
        variants[props.variant] ?? variants.primary,
        sizes[props.size] ?? sizes.md,
    ];
});
</script>

<template>
    <button :type="type" :class="classes" :disabled="disabled || loading" :aria-busy="loading || undefined">
        <svg
            v-if="loading"
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
        <slot />
    </button>
</template>
