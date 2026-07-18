import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        Accept: 'application/json',
    },
});

/**
 * Sanctum's SPA auth needs a CSRF cookie present before the first mutating
 * request. Laravel sets it on any 'web'-group response, but we prime it
 * explicitly on boot so the very first action (e.g. signup) isn't racy.
 */
export function ensureCsrfCookie() {
    return axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

/**
 * Normalizes Laravel's error shapes into a consistent, predictable object:
 *   { status, message, errors: { field: [messages] } | null }
 */
export function normalizeApiError(error) {
    if (!error.response) {
        return {
            status: 0,
            message: 'Network error — please check your connection and try again.',
            errors: null,
        };
    }

    const { status, data } = error.response;

    if (status === 401) {
        return { status, message: 'Please log in to continue.', errors: null };
    }

    if (status === 403) {
        return {
            status,
            message: data?.message || 'You are not authorized to do that.',
            errors: null,
        };
    }

    if (status === 422) {
        return {
            status,
            message: data?.message || 'Please check the highlighted fields.',
            errors: data?.errors || null,
        };
    }

    return {
        status,
        message: data?.message || 'Something went wrong. Please try again.',
        errors: null,
    };
}

export default api;
