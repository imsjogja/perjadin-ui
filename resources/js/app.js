import { createApp } from 'vue';
import '../css/app.css';
import router from './router';
import Root from './Root.vue';
import AppToast from './shared/components/AppToast.vue';

const app = createApp(Root);

app.component('AppToast', AppToast);
app.use(router);
app.mount('#app');
