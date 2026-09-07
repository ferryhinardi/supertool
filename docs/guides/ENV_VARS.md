## Environment Variables

This document tracks every custom environment variable consumed by SuperTool runtime code.
It keeps local setup, deployment configuration, and example env files aligned.
Do not store real secrets in example files or committed documentation.

## Verification Status

- Runtime code usage was verified from `app/`, `lib/`, and `next.config.ts`.
- Example files were synced against the current codebase inventory.
- Vercel Production presence verification is currently **blocked** because `vercel env ls` could not run without Vercel credentials in this session.

## Usage Rules

- `NEXT_PUBLIC_` variables are exposed to the client bundle and must never contain secrets.
- Server-only variables must be stored in managed secret stores such as Vercel project environment variables.
- `FEATURE_<NAME>` is a generic feature-flag convention. Example: `FEATURE_EXAMPLE=false`.

## Runtime Variable Inventory

| Variable | Scope | Required | Example / Placeholder | Where consumed | Purpose |
| --- | --- | --- | --- | --- | --- |
| `ANALYZE` | Build-time server | No | `false` | `next.config.ts` | Enables bundle analyzer output during builds. |
| `EXCHANGE_RATE_API_KEY` | Server-only | Yes for exchange-rates API | `your_exchange_rate_api_key` | `app/api/exchange-rates/route.ts` | Authenticates requests to the exchange-rate provider. |
| `FEATURE_<NAME>` | Server/build-time pattern | Optional | `FEATURE_EXAMPLE=false` | `lib/feature-flags.ts` | Generic environment-backed feature-flag convention used by `isFeatureEnabled(name)`. |
| `GITHUB_TOKEN` | Server-only | Yes for GitHub integration | `your_github_personal_access_token` | `lib/services/github/client.ts` | Authenticates GitHub API requests for MCP and GitHub flows. |
| `NEXT_PUBLIC_AFFILIATE_1PASSWORD_REF` | Public | No | `your_1password_ref` | `lib/services/ads-config.ts` | Affiliate reference for 1Password placements. |
| `NEXT_PUBLIC_AFFILIATE_BITWARDEN_REF` | Public | No | `your_bitwarden_ref` | `lib/services/ads-config.ts` | Affiliate reference for Bitwarden placements. |
| `NEXT_PUBLIC_AFFILIATE_CLOUDFLARE_REF` | Public | No | `your_cloudflare_ref` | `lib/services/ads-config.ts` | Affiliate reference for Cloudflare placements. |
| `NEXT_PUBLIC_AFFILIATE_CLOUDINARY_REF` | Public | No | `your_cloudinary_ref` | `lib/services/ads-config.ts` | Affiliate reference for Cloudinary placements. |
| `NEXT_PUBLIC_AFFILIATE_DASHLANE_REF` | Public | No | `your_dashlane_ref` | `lib/services/ads-config.ts` | Affiliate reference for Dashlane placements. |
| `NEXT_PUBLIC_AFFILIATE_EXPRESSVPN_REF` | Public | No | `your_expressvpn_ref` | `lib/services/ads-config.ts` | Affiliate reference for ExpressVPN placements. |
| `NEXT_PUBLIC_AFFILIATE_INSOMNIA_REF` | Public | No | `your_insomnia_ref` | `lib/services/ads-config.ts` | Affiliate reference for Insomnia placements. |
| `NEXT_PUBLIC_AFFILIATE_NORDVPN_REF` | Public | No | `your_nordvpn_ref` | `lib/services/ads-config.ts` | Affiliate reference for NordVPN placements. |
| `NEXT_PUBLIC_AFFILIATE_POSTMAN_REF` | Public | No | `your_postman_ref` | `lib/services/ads-config.ts` | Affiliate reference for Postman placements. |
| `NEXT_PUBLIC_AFFILIATE_SUPABASE_REF` | Public | No | `your_supabase_ref` | `lib/services/ads-config.ts` | Affiliate reference for Supabase placements. |
| `NEXT_PUBLIC_AFFILIATE_TINYPNG_REF` | Public | No | `your_tinypng_ref` | `lib/services/ads-config.ts` | Affiliate reference for TinyPNG placements. |
| `NEXT_PUBLIC_AFFILIATE_VERCEL_REF` | Public | No | `your_vercel_ref` | `lib/services/ads-config.ts` | Affiliate reference for Vercel placements. |
| `NEXT_PUBLIC_BASE_URL` | Public | Yes | `https://supertool.dev` | `app/layout.tsx`, `app/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, tool metadata layouts, `app/api/payment/checkout/route.ts` | Canonical base URL for SEO metadata, sitemap generation, and absolute links. |
| `NEXT_PUBLIC_CARBON_PLACEMENT` | Public | No | `your-carbon-placement` | `lib/services/ads-config.ts` | Carbon Ads placement identifier. |
| `NEXT_PUBLIC_CARBON_SERVE_ID` | Public | No | `your-carbon-serve-id` | `lib/services/ads-config.ts` | Carbon Ads serve identifier. |
| `NEXT_PUBLIC_COPILOT_DEFAULT_REPO` | Public | No | `ferryhinardi/supertool` | `lib/constants/layout.ts` | Default repository string for Copilot and MCP-related UX. |
| `NEXT_PUBLIC_ENABLE_ADS` | Public | No | `false` | `lib/services/ads-config.ts` | Global ad-rendering feature switch. |
| `NEXT_PUBLIC_ENABLE_ADSENSE` | Public | No | `false` | `lib/services/ads-config.ts` | Enables Google AdSense when ads are globally enabled. |
| `NEXT_PUBLIC_ENABLE_AFFILIATES` | Public | No | `false` | `lib/services/ads-config.ts` | Enables affiliate placements. |
| `NEXT_PUBLIC_ENABLE_CARBON_ADS` | Public | No | `false` | `lib/services/ads-config.ts` | Enables Carbon Ads placements. |
| `NEXT_PUBLIC_ENABLE_ETHICAL_ADS` | Public | No | `false` | `lib/services/ads-config.ts` | Enables EthicalAds placements. |
| `NEXT_PUBLIC_ETHICAL_ADS_PUBLISHER_ID` | Public | No | `your-ethicalads-publisher-id` | `lib/services/ads-config.ts` | EthicalAds publisher identifier. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Public | No | `G-XXXXXXXXXX` | `app/layout.tsx`, `lib/services/analytics.ts` | Enables GA4 analytics initialization. |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` | Public | No | `ca-pub-xxxxxxxxxxxxxxxx` | `lib/services/ads-config.ts` | Google AdSense publisher identifier. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Public | No | `your_google_site_verification_token` | `app/layout.tsx` | Search Console verification token injected into metadata. |
| `NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID` | Public | Yes for donation checkout | `your_polar_donation_product_id` | `lib/services/polar.ts`, `components/features/support/DonationForm.tsx`, `components/features/shared/TreatMeDialog.tsx` | Public Polar product ID used to start donation checkout. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes | `your_supabase_anon_key` | `app/auth/callback/route.ts`, `lib/auth/supabaseClient.ts`, dev/test auth page | Public Supabase anon key for browser auth and client initialization. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes | `https://your-project.supabase.co` | `app/auth/callback/route.ts`, `lib/auth/supabaseClient.ts`, `lib/auth/supabaseServer.ts`, dev/test auth page | Supabase project URL for auth and client/server initialization. |
| `OPENAI_API_KEY` | Server-only | Yes for AI tools | `your_openai_api_key` | AI route handlers under `app/api/*`, `lib/services/copilot/client-manager.ts` | Authenticates OpenAI-backed AI tools and Copilot flows. |
| `POLAR_ACCESS_TOKEN` | Server-only | Yes for server-side Polar API calls | `your_polar_access_token` | `lib/services/polar.ts` | Polar API access token for checkout and session creation. |
| `POLAR_ORGANIZATION_ID` | Server-only | Yes for Polar integration | `your_polar_organization_id` | `lib/services/polar.ts` | Polar organization identifier used by server integrations. |
| `POLAR_WEBHOOK_SECRET` | Server-only | Yes for webhooks | `your_polar_webhook_secret` | `lib/services/polar.ts` | Verifies Polar webhook signatures. |
| `RESEND_API_KEY` | Server-only | Yes for email sending | `your_resend_api_key` | `lib/services/email.ts` | Authenticates Resend transactional email requests. |
| `RESEND_FROM_EMAIL` | Server-only | No | `onboarding@resend.dev` | `lib/services/email.ts` | Default sender email for transactional messages. |
| `RESEND_REPLY_TO_EMAIL` | Server-only | No | `support@supertool.dev` | `lib/services/email.ts` | Optional reply-to email for outgoing messages. |
| `SCREENSHOTONE_ACCESS_KEY` | Server-only | Yes for screenshot API | `your_screenshotone_access_key` | `app/api/screenshot/route.ts` | Authenticates ScreenshotOne API requests. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | Yes for privileged server auth and storage flows | `your_supabase_service_role_key` | `lib/auth/supabaseServer.ts`, `lib/services/copilot/session-store.ts` | Privileged Supabase server key. Must never be exposed client-side. |
| `WEB3FORMS_ACCESS_KEY` | Server-only | Yes for feedback form delivery | `your_web3forms_access_key` | `app/api/feedback/route.ts` | Authenticates Web3Forms feedback submissions. |

## Deployment Notes

- Keep all server-only variables out of client-exposed configuration and never prefix them with `NEXT_PUBLIC_`.
- Store production secrets in Vercel environment variables or another managed secret store.
- Once Vercel credentials are available, rerun `vercel env ls` and update this document with a verified Production presence status.
