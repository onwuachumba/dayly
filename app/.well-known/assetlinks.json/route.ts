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
 * NOTE: a DEBUG-TEST fingerprint is currently published below so the debug
 * test APK verifies without a URL bar. Before any Play release, replace it
 * with the release key fingerprint (step 3 above).
 */

const DEBUG_TEST_FINGERPRINT =
  "F9:4D:DC:AD:8F:51:DC:B1:C9:0D:A3:EC:08:E5:29:33:EA:6D:92:E6:0C:DD:4C:60:5B:BA:E5:7B:D7:7F:0B";
const RELEASE_FINGERPRINT = "REPLACE_WITH_RELEASE_SHA256";

// Served fingerprints: debug-test key (for the current test APK) always;
// release key only once it is a real fingerprint (never the placeholder).
const FINGERPRINTS = [DEBUG_TEST_FINGERPRINT];
if (!RELEASE_FINGERPRINT.startsWith("REPLACE_")) {
  FINGERPRINTS.push(RELEASE_FINGERPRINT);
}

export async function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.dayly.app",
          sha256_cert_fingerprints: FINGERPRINTS,
        },
      },
    ],
    { headers: { "Content-Type": "application/json" } },
  );
}
