export function subscriptionImagePath(slug: string) {
  return `/subscription-images/${slug === 'netflix-discount' ? 'netflix-discount-v2' : slug}.png`;
}
