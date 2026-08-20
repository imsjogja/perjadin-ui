/*
 * Placeholder composable Echo — wrapper tipis di atas window.Echo.
 * Saat backend Reverb belum aktif, semua method no-op yang aman dipanggil.
 *
 * Nanti:
 *   const { listen } = useEcho();
 *   listen('wfh.map', 'WfhLocationUpdated', (payload) => { ... });
 */
export function useEcho() {
    function getEcho() {
        return typeof window !== 'undefined' ? window.Echo ?? null : null;
    }

    function listen(channel, event, callback) {
        const echo = getEcho();
        if (!echo) {
            // Mode mock: tidak ada koneksi realtime, abaikan dengan senyap
            return () => {};
        }
        echo.channel(channel).listen(event, callback);
        return () => echo.leaveChannel(channel);
    }

    function listenPrivate(channel, event, callback) {
        const echo = getEcho();
        if (!echo) return () => {};
        echo.private(channel).listen(event, callback);
        return () => echo.leaveChannel(channel);
    }

    return { listen, listenPrivate };
}
