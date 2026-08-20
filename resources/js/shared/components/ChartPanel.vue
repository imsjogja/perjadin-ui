<script setup>
import { computed } from 'vue';
import { Bar, Line, Doughnut } from 'vue-chartjs';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    ArcElement,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';

/*
 * ChartPanel — wrapper vue-chartjs agar konteks tidak perlu registrasi Chart.js manual.
 * Warna dataset diambil dari token desain (lihat tailwind.config).
 */
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
);

const props = defineProps({
    type: { type: String, default: 'bar' }, // bar|line|doughnut
    labels: { type: Array, default: () => [] },
    datasets: { type: Array, default: () => [] }, // format Chart.js: [{ label, data, backgroundColor }]
    height: { type: Number, default: 280 },
});

const components = { bar: Bar, line: Line, doughnut: Doughnut };
const chartComponent = computed(() => components[props.type] ?? Bar);

const chartData = computed(() => ({ labels: props.labels, datasets: props.datasets }));

const options = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: props.datasets.length > 1, position: 'bottom' },
    },
}));
</script>

<template>
    <div :style="{ height: `${height}px` }" role="img" aria-label="Grafik data">
        <component :is="chartComponent" :data="chartData" :options="options" />
    </div>
</template>
