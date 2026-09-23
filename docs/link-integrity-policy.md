# External Link & Source Integrity Policy

## Overview

This repository documents public crowdfunding campaigns and news reporting related to the ParkNest fire in Amsterdam-Oost. Because external sites (such as crowdfunding platforms, news publishers, and social media networks) may change, rate-limit automated requests, or employ anti-bot protections (e.g. Cloudflare or Instagram login walls), this site maintains a resilient link integrity policy and automated check.

## Principles

1. **Source Transparency:**
   Every listed campaign, context reference, and news source must point to a valid, well-formed external URL (`http://` or `https://`).

2. **Resilience to Anti-Bot & Rate-Limiting Controls:**
   - Automated tools visiting external sites (e.g., WhyDonate, Instagram, Online Gallery, news outlets) may encounter HTTP status codes such as `429 Too Many Requests`, `403 Forbidden`, or `999` (anti-scraping response).
   - An anti-bot or rate-limiting response does **not** indicate that a source link is broken or invalid.
   - The link check tool MUST distinguish between **definitive source failures** (e.g., HTTP `404 Not Found`, `410 Gone`, DNS resolution failures, malformed URL syntax) and **resilient anti-bot/rate-limit responses** (HTTP `429`, `403`, `999`).

3. **Classification Rules:**
   - **Pass (Valid / Reachable):** HTTP 2xx or 3xx status codes.
   - **Pass with Warning (Resilient Rate Limit / Anti-Bot):** HTTP 429, 403, 999, or Cloudflare/anti-bot challenge responses. These indicate active origin servers enforcing automated client restrictions.
   - **Fail (Broken Link / Invalid Source):**
     - HTTP 404 (Not Found) or 410 (Gone)
     - HTTP 500, 502, 503, 504 server errors
     - Network errors: ENOTFOUND (DNS failure), ECONNREFUSED, timeout with no response
     - Malformed URL syntax or non-http(s) schemes

4. **CI & Offline Execution:**
   - The automated check runs in CI (`.github/workflows/foundation-check.yml`) on every pull request and push to `main`.
   - When run locally or in restricted CI environments without external internet access, the link check tool supports an `--offline` flag to validate URL structure and extraction without making network calls.

5. **Remediation Procedure:**
   - If a link check fails due to a `404 Not Found` or `410 Gone` status:
     1. Verify whether the target URL was updated or moved on the source platform.
     2. Update the reference URL in `data/fundraisers.json` and/or `data/content.json` following the `content-approved` PR workflow defined in `CONTRIBUTING.md`.
