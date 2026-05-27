// In dev (Vite on :3003) the proxy in vite.config.js forwards /api → the
// backend. In prod, Express on the same domain serves /api itself, so a
// relative path "/api" works in both environments — no rebuild needed when
// the domain changes.
export const baseUrl = "/api";

// Host that serves uploaded files (photos, videos). Same origin as the API
// but without the /api prefix. Relative "" means "current origin".
export const assetHost = baseUrl.replace(/\/api\/?$/, '');

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
