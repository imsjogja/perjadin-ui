<script setup>
import { computed } from 'vue';
import AppBadge from './AppBadge.vue';
import { resolveStatusColor, statusColors } from '../status-colors';

/*
 * StatusBadge — badge status dokumen (draft|verified|rejected|cancelled).
 * Label otomatis Bahasa Indonesia dari status-colors.js, bisa dioverride via slot.
 */
const props = defineProps({
    status: { type: String, required: true },
});

const color = computed(() => resolveStatusColor(props.status));
const label = computed(() => statusColors[props.status]?.label ?? props.status);
</script>

<template>
    <AppBadge :color="color"><slot>{{ label }}</slot></AppBadge>
</template>
