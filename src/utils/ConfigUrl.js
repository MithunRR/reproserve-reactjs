// Set VITE_API_BASE_URL in .env.local to point at a specific backend
// (e.g. https://reproserve.creativecrows.com to hit live from your laptop).
// Leave it unset for the default flow:
//   - dev: Vite proxy (vite.config.js) forwards /api → http://localhost:3000
//   - prod: Express on the same origin serves /api itself
const apiHost = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

export const baseUrl = `${apiHost}/api`;

// Uploaded files (photos, videos) are served from the same origin as the API,
// just without the /api prefix.
export const assetHost = apiHost;

// Convert a server-relative asset path (e.g. /assets/photos/x.jpg) into
// an absolute URL. Pass-through anything that already looks absolute.
export const toAssetUrl = (path) => {
    if (!path || typeof path !== 'string') return path;
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }
    if (path.startsWith('/')) return `${assetHost}${path}`;
    return `${assetHost}/${path}`;
};
