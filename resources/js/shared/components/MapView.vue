<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/*
 * MapView — wrapper Leaflet.
 * Tile default: OpenStreetMap. Untuk produksi bisa diganti Google tiles, contoh:
 *   L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { subdomains: ['mt0','mt1','mt2','mt3'] })
 * (perhatikan ketentuan lisensi Google Maps sebelum dipakai).
 *
 * Realtime: komponen ini menerima array `markers`; pembaruan posisi live nanti
 * cukup mengganti array dari luar (mis. hasil subscribe channel `wfh.map` via useEcho).
 */
const props = defineProps({
    center: { type: Array, default: () => [-6.2, 106.816666] }, // Jakarta
    zoom: { type: Number, default: 12 },
    markers: { type: Array, default: () => [] }, // [{ lat, lng, label, status }]
    height: { type: String, default: '320px' },
});

const mapEl = ref(null);
let map = null;
let markerLayer = null;

function renderMarkers() {
    if (!map) return;
    if (markerLayer) markerLayer.remove();
    markerLayer = L.layerGroup(
        props.markers.map((m) => {
            const marker = L.marker([m.lat, m.lng]);
            if (m.label) marker.bindPopup(m.label);
            return marker;
        }),
    ).addTo(map);
}

onMounted(() => {
    map = L.map(mapEl.value, { scrollWheelZoom: false }).setView(props.center, props.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(map);
    renderMarkers();
});

watch(() => props.markers, renderMarkers, { deep: true });

onBeforeUnmount(() => {
    if (map) map.remove();
    map = null;
});
</script>

<template>
    <div ref="mapEl" class="w-full rounded-md border" :style="{ height }" role="application" aria-label="Peta lokasi" />
</template>
