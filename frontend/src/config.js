const e = import.meta.env;
export const CONFIG = {
  githubUser: e.VITE_GITHUB_USERNAME || '',
  githubUrl: e.VITE_GITHUB_URL || (e.VITE_GITHUB_USERNAME ? `https://github.com/${e.VITE_GITHUB_USERNAME}` : 'https://github.com'),
  linkedinUrl: e.VITE_LINKEDIN_URL || 'https://linkedin.com',
  email: e.VITE_CONTACT_EMAIL || 'raghulvel63@gmail.com',
  apiUrl: e.VITE_API_URL ?? (e.PROD ? '/' : ''),   // '/' = same origin as the site (Django serves both). Empty in dev = offline demo mode.
  liveUrl: e.VITE_LIVE_URL || '#',         // placeholder until deployed
  repoUrl: e.VITE_REPO_URL || '#',         // placeholder until published
  heroImage: e.VITE_HERO_IMAGE || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
};
export const APP = { currency: e.VITE_CURRENCY || 'USD', deliveryFee: 2.99, freeDeliveryOver: 30, promoCode: 'FRESH10', promoPercent: 10 };
