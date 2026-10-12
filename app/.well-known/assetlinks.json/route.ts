import { NextResponse } from "next/server";

/**
 * Digital Asset Links for the DAYLY Trusted Web Activity (Android).
 *
 * Play Store verification fetches this at:
 *   https://dayly001.netlify.app/.well-known/assetlinks.json
 * and requires Content-Type application/json (handled below).
 *
 * COMPLETING THIS FILE (do NOT invent a fingerprint):
 * 1. Publish the app with a package name of `com.dayly.app`.
 * 2. Open Play Console → the DAYLY app → Setup → App signing, and copy the
 *    SHA-256 certificate fingerprint of the *app signing* key.
 *    (Local alternative: `keytool -list -v -keystore <your-keystore>` and
 *    copy the SHA256 line.)
 * 3. Replace REPLACE_WITH_RELEASE_SHA256 below with that fingerprint
 *    (69 hex chars with colons, e.g. "AA:BB:…").
 * 4. Redeploy, then verify at https://developers.google.com/digital-asset-links/tools/generator
 *    (or Play Console's verification check) before release review.
 */

const RELEASE_FINGERPRINT = "REPLACE_WITH_RELEASE_SHA256";

export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.dayly.app",
          sha256_cert_fingerprints: [RELEASE_FINGERPRINT],
        },
      },
    ],
    { headers: { "Content-Type": "application/json" } },
  );
}
