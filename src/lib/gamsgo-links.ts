// Copied from the owner's GamsGo product recommendation dashboard, 2026-10-31.
export const gamsgoProductLinks: Record<string, string> = {
  "youtube-premium-cheap": "https://www.gamsgo.com/details/youtube/partner/rQT9a",
  "disney-plus-discount": "https://www.gamsgo.com/details/disneyplus/partner/rQT9a",
  "netflix-discount": "https://www.gamsgo.com/accounts/netflix/partner/rQT9a",
  "chatgpt-discount": "https://www.gamsgo.com/details/chatgpt/partner/rQT9a",
  "claude-discount": "https://www.gamsgo.com/accounts/claude/partner/rQT9a",
  "gemini-discount": "https://www.gamsgo.com/details/gemini/partner/rQT9a",
  "tving-discount": "https://www.gamsgo.com/details/tving/partner/rQT9a",
  "suno-plans": "https://www.gamsgo.com/details/suno/partner/rQT9a",
  "midjourney-pricing": "https://www.gamsgo.com/details/midjourney_official/partner/rQT9a",
  "genspark-pricing": "https://www.gamsgo.com/details/genspark/partner/rQT9a",
  "adobe-discount": "https://www.gamsgo.com/details/adobe1/partner/rQT9a",
  "capcut-pricing": "https://www.gamsgo.com/details/capcut/partner/rQT9a",
  "spotify-discount": "https://www.gamsgo.com/details/spotify/partner/rQT9a",
  "canva-subscription": "https://www.gamsgo.com/details/cannva/partner/rQT9a",
  "duolingo-discount-code": "https://www.gamsgo.com/details/duolingo/partner/rQT9a"
};

export function gamsgoAffiliateLink(slug?: string) {
  return (slug && gamsgoProductLinks[slug]) || 'https://www.gamsgo.com/partner/rQT9a';
}
