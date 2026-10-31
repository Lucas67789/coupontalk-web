export const subscriptionVisualUpdatedAt = '2026-10-31';

export function subscriptionImagePath(slug: string, kind: 'cover' | 'price' | 'how' = 'cover') {
  const version = kind === 'cover' ? 'v4' : 'v3';
  return `/subscription-images/${version}/${slug}-${kind}.png`;
}

export function subscriptionImagePaths(slug: string) {
  return (['cover', 'price', 'how'] as const).map(kind => subscriptionImagePath(slug, kind));
}
