<script setup>
import { computed } from 'vue';
import { badgeClasses } from '../status-colors';

/* AppBadge — label status kecil berbasis token warna. */
const props = defineProps({
    color: { type: String, default: 'neutral' }, // success|warning|danger|info|neutral|brand
});

const classes = computed(
    () => badgeClasses[props.color] ?? badgeClasses.neutral,
);
</script>

<template>
    <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset"
        :class="classes"
    >
        <slot />
    </span>
</template>
