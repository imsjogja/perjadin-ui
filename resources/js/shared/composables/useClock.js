import { onBeforeUnmount, onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

/*
 * Jam realtime — locale Indonesia dan timezone Asia/Jakarta.
 * Mengembalikan ref string terformat, diperbarui tiap detik.
 */
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('id');

const TZ = 'Asia/Jakarta';

export function useClock(format = 'dddd, D MMMM YYYY • HH:mm:ss') {
    const now = ref(dayjs().tz(TZ).format(format));
    let timer = null;

    onMounted(() => {
        timer = setInterval(() => {
            now.value = dayjs().tz(TZ).format(format);
        }, 1000);
    });

    onBeforeUnmount(() => {
        if (timer) clearInterval(timer);
    });

    return { now };
}
