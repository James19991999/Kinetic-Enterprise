/** @type {import('next').NextConfig} */

// Scoped to what this app actually loads: Google Fonts (<link> tags, see
// layout.tsx), Firebase Auth/Firestore, Google OAuth popup, and Stripe
// Checkout. 'unsafe-inline' on script-src is a pragmatic tradeoff — Next.js
// injects an inline hydration bootstrap script, and a fully strict
// nonce-based CSP requires threading a per-request nonce through middleware
// into every script tag, which needs to be tested against a live Firebase
// project before enabling (a broken CSP can silently break sign-in). This
// still blocks the most common attack: loading an unauthorized external
// script from an untrusted origin.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://firebasestorage.googleapis.com",
  "connect-src 'self' https://*.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://api.stripe.com",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://checkout.stripe.com https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: CSP },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
