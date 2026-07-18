import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './Context/LanguageContext';
import { ToastProvider } from './Context/ToastContext';
import { ensureCsrfCookie } from './lib/api';

ensureCsrfCookie();

createInertiaApp({
    title: (title) => (title ? `${title} — Mirror Business Cards` : 'Mirror Business Cards'),
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <LanguageProvider>
                <ToastProvider>
                    <App {...props} />
                </ToastProvider>
            </LanguageProvider>,
        );
    },
});
