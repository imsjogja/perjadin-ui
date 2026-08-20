<script setup>
/*
 * PermissionTree — pohon permission dengan checkbox TRI-STATE fungsional.
 * Meniru metadata dari AccessRoleCatalog backend (menu > aksi CRUD/extra).
 *
 * Props nodes: [{ key, label, children?: [...] }]
 * v-model:selected = array key leaf yang dicentang.
 * Node induk otomatis: dicentang penuh / indeterminate / kosong mengikuti anaknya.
 * State tunggal dipegang pemanggil (selected), sehingga semua level sinkron.
 */
const props = defineProps({
    nodes: { type: Array, default: () => [] },
    selected: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:selected']);

function leafKeys(node) {
    if (!node.children || node.children.length === 0) return [node.key];
    return node.children.flatMap(leafKeys);
}

function stateOf(node) {
    const leaves = leafKeys(node);
    const hit = leaves.filter((k) => props.selected.includes(k)).length;
    if (hit === 0) return 'unchecked';
    if (hit === leaves.length) return 'checked';
    return 'indeterminate';
}

function toggle(node) {
    const leaves = leafKeys(node);
    const next = new Set(props.selected);
    if (stateOf(node) === 'checked') {
        leaves.forEach((k) => next.delete(k));
    } else {
        leaves.forEach((k) => next.add(k));
    }
    emit('update:selected', [...next]);
}
</script>

<template>
    <ul class="flex flex-col gap-1 text-sm">
        <li v-if="nodes.length === 0" class="text-xs text-slate-500">Struktur permission belum dimuat.</li>
        <li v-for="node in nodes" :key="node.key">
            <div class="flex min-h-10 items-center gap-2">
                <input
                    :id="`perm-${node.key}`"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                    :checked="stateOf(node) === 'checked'"
                    :indeterminate.prop="stateOf(node) === 'indeterminate'"
                    :aria-label="`Permission ${node.label}`"
                    @change="toggle(node)"
                />
                <label :for="`perm-${node.key}`" class="cursor-pointer text-dark">{{ node.label }}</label>
            </div>
            <div v-if="node.children?.length" class="ml-6 border-l pl-3">
                <PermissionTree
                    :nodes="node.children"
                    :selected="selected"
                    @update:selected="emit('update:selected', $event)"
                />
            </div>
        </li>
    </ul>
</template>
