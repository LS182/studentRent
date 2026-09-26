const defaultApiBase = import.meta.env.DEV
  ? '/__studentrent_api__'
  : 'https://studentrent.infinityfree.io';
const configuredApiBase = import.meta.env.VITE_API_BASE_URL || defaultApiBase;

export const API_BASE_URL = configuredApiBase.replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return API_BASE_URL + '/' + path.replace(/^\/+/, '');
}

export function propertyImageUrl(imagePath: string | null | undefined, fallback: string): string {
  if (!imagePath) return fallback;
  const source = imagePath.trim();
  if (/^https?:\/\//i.test(source)) {
    return source.replace(/^http:\/\//i, 'https://');
  }
  return API_BASE_URL + '/' + source.replace(/^\/+/, '');
}

export const fallbackPropertyPhotos = [
  '/images/photo-1554995207-c18c203602cb.jpg',
  '/images/photo-1502672260266-1c1ef2d93688.jpg',
  '/images/photo-1522708323590-d24dbb6b0267.jpg',
  '/images/photo-1493809842364-78817add7ffb.jpg',
  '/images/photo-1600607687939-ce8a6c25118c.jpg',
  '/images/photo-1484154218962-a197022b5858.jpg',
  '/images/photo-1505693416388-ac5ce068fe85.jpg',
  '/images/photo-1595526114035-0d45ed16cfbf.jpg',
];
