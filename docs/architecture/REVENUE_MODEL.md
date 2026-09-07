# Revenue Model

## Current State

SuperTool already has a live donation flow on `/support` through the existing TreatMeDialog and DonationForm experience. The repository also already contains subscription-oriented schema pieces, including `subscriptions` and related billing tables, but those subscription records are not yet enforcing premium access anywhere in the shipped product. No Google AdSense placements are live yet, so the project is currently monetized by donations only.

This means the repository already has the beginnings of a premium foundation, but the actual user experience is still missing the product rules that turn those database structures into a clear paid tier. It also means ad work must be introduced deliberately so it does not conflict with the existing support flow or undermine trust on account, auth, and payment surfaces.

## Decided Model

The decided monetization model is a hybrid: free users get product quotas plus consent-gated Google AdSense on tool pages only, while premium users get ad-free unlimited usage. Donations remain available as a separate support path and do not replace the premium plan. The premium tier is therefore defined by two benefits together: usage limits are removed, and ads are suppressed.

Google AdSense is the explicit ads provider for this plan. Ads are part of the free-user experience only, and they must never become a prerequisite for product usability. Premium remains the clean, no-ads, unlimited-usage path, while free remains the accessible path with quotas and carefully constrained ad placement.

This document intentionally does not set pricing, packaging, or a launch date. Those decisions remain out of scope for this task and should only be made when the premium gate, paywall UX, and monetization funnel instrumentation are ready.

## Placement and Guardrails

Google AdSense is limited to tool pages only and must appear below the fold after the main result area. Ads must never render above the fold, and they must never interrupt the primary interaction flow before a user reaches the result they came for. The placement rule exists to preserve trust, minimize distraction, and protect tool usability.

Ads must never appear on `/support`, authentication pages, checkout flows, account pages, or other sensitive surfaces. Consent is required before any AdSense script is loaded, which means ad infrastructure must be gated behind an explicit consent decision rather than loaded by default. Ad-block detection, if implemented later, must remain a soft prompt only and cannot become a hard dependency for product access.

Premium ad suppression must be SSR-safe. The server-rendered output for premium users must avoid emitting ad slots or loading ad scripts so premium users do not see layout shift, hydration flicker, or delayed ad removal after the page becomes interactive. This guardrail is part of the premium promise and should be treated as a correctness requirement, not just a polish detail.

## Execution Scope

The execution scope for this monetization direction includes premium gating, paywall UI, ad-consent infrastructure, shared ad-slot architecture, tool-page wiring, and supporting analytics and operational documentation. Those changes should build on existing Supabase tables and views for subscription and usage enforcement, keeping the implementation within the project’s $0/month infrastructure ceiling. The goal is to reuse what already exists rather than introducing a paid external monetization stack.

The execution scope explicitly excludes changes to Polar checkout and webhook write paths. In practice, that means monetization work may read from the safe, existing subscription state but must not rewrite `app/api/payment/checkout/route.ts`, `app/api/webhooks/polar/route.ts`, or the write-path behavior around the Polar integration. The hybrid revenue model should be delivered by layering product rules, UI, and ads infrastructure on top of the existing billing foundation rather than reworking the billing core.

The expected implementation sequence remains: establish feature flags and supporting documentation, add the premium-gating helper, build the paywall UI, instrument the monetization funnel, and then ship AdSense infrastructure with consent and premium suppression. This keeps the monetization rollout incremental, testable, and aligned with the Wave 1 through Phase 3.5 structure in `.sisyphus/plans/supertool-improvement.md`.