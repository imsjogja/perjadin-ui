import { reactive, readonly } from 'vue';

/*
 * Store toast sederhana berbasis reactive state.
 * Pakai: const toast = useToast(); toast.success('Berhasil disimpan');
 */
const state = reactive({
    items: [],
});

let nextId = 1;

function push(type, message, timeout = 4000) {
    const id = nextId++;
    state.items.push({ id, type, message });
    if (timeout > 0) {
        setTimeout(() => dismiss(id), timeout);
    }
    return id;
}

function dismiss(id) {
    const idx = state.items.findIndex((t) => t.id === id);
    if (idx !== -1) state.items.splice(idx, 1);
}

export function useToast() {
    return {
        items: readonly(state.items),
        dismiss,
        success: (msg, timeout) => push('success', msg, timeout),
        warning: (msg, timeout) => push('warning', msg, timeout),
        danger: (msg, timeout) => push('danger', msg, timeout),
        info: (msg, timeout) => push('info', msg, timeout),
    };
}
