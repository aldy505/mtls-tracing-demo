import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import * as Sentry from "@sentry/vue";
import './index.css'
import App from './App.vue'
import Index from "@/pages/index.vue";
import Dashboard from "@/pages/dashboard.vue";

const app = createApp(App);
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: Index},
        {path: '/dashboard', component: Dashboard}
    ],
});

Sentry.init({
    app,
    // TODO: Replace this with your own DSN. This DSN points to a demo project that doesn't exist.
    dsn: 'https://5e395fdfe91f8044f6f0c50adf8660a0@sentry.teknologiumum.com/24',
    integrations: [
        Sentry.browserTracingIntegration({
            router,
            enableInp: true,
        }),
        Sentry.replayIntegration({}),
        Sentry.browserProfilingIntegration(),
        Sentry.feedbackIntegration({
            colorScheme: 'system',
        }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [/localhost/],

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    trackComponents: true,
});

app.use(router);
app.mount('#app');
