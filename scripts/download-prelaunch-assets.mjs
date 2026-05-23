/**
 * One-shot script: download Figma-exported prelaunch assets into public/prelaunch/.
 * Run: node scripts/download-prelaunch-assets.mjs
 * URLs expire after 600s — re-run with fresh URLs from MoMorph if you get 403s.
 *
 * MoMorph screen: Countdown - Prelaunch page (screenId: 8PJQswPZmU)
 * Figma file: 9ypp4enmFmdK3YAFJLIu6C
 *
 * To refresh URLs:
 *   1. Open MoMorph screen https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
 *   2. Run get_media_files(screenId="8PJQswPZmU") via MCP
 *   3. Replace the URL below with the fresh signed URL for node 2268:35129
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "prelaunch");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// nodeId → [filename, url]
// Node 2268:35129 — MM_MEDIA_BG Image (1512×1077 dark organic/root pattern background)
const ASSETS = [
  [
    "bg-image.png",
    // Refresh this URL via MoMorph MCP get_media_files(screenId="8PJQswPZmU") — expires in 600s
    "REPLACE_WITH_FRESH_URL",
  ],
];

/**
 * @param {string} filename
 * @param {string} url
 * @returns {Promise<"ok"|"fail">}
 */
function download(filename, url) {
  return new Promise((resolve) => {
    if (url === "REPLACE_WITH_FRESH_URL") {
      console.error(`SKIP ${filename}: URL not set. Get a fresh URL from MoMorph MCP.`);
      resolve("fail");
      return;
    }

    const dest = path.join(OUT_DIR, filename);
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlink(dest, () => {});
          download(filename, /** @type {string} */ (res.headers.location)).then(resolve);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          console.error(`FAIL ${filename}: HTTP ${res.statusCode}`);
          resolve("fail");
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          const size = fs.statSync(dest).size;
          console.log(`OK   ${filename} (${(size / 1024).toFixed(1)} KB)`);
          resolve("ok");
        });
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(dest, () => {});
        console.error(`FAIL ${filename}: ${err.message}`);
        resolve("fail");
      });
  });
}

const results = await Promise.all(ASSETS.map(([f, u]) => download(f, u)));
const ok = results.filter((r) => r === "ok").length;
const fail = results.filter((r) => r === "fail").length;
console.log(`\nDone: ${ok} downloaded, ${fail} failed`);
if (fail > 0) process.exit(1);
