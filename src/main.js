import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import Pinia
import App from './App.vue';
import router from './router';
import './assets/main.css'; // Assuming you have a global CSS file

const app = createApp(App);
const pinia = createPinia(); // Create a Pinia instance

app.use(pinia); // Tell Vue to use Pinia
app.use(router);

app.mount('#app');