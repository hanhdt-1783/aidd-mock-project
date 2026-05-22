/**
 * One-shot script: download Figma-exported home assets into public/home/.
 * Run: npm run download-assets:home
 * URLs expire after 600s — re-run with fresh URLs from MoMorph if you get 403s.
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "home");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// nodeId → [filename, url]
const ASSETS = [
  // Keyvisual background (2167:9028)
  ["keyvisual-bg.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/e0f38eedefdfe5eed3120c3a02d1c9b0.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=dc46bed07ca7544d15e614330abcb776909dc51bcd8419f46e03cc429c6add21&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // Header logo (I2167:9091;178:1033;178:1030)
  ["logo-header.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/b1e72bf604326f7af02ce0e47ef0a638.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=0d94b5cd0023bf5305cf65caa35a7a1495e2eb0e35c386319834315a0dd4fc50&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // Root Further logo (2788:12911)
  ["root-further-logo.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/2e900e000847f138c2a99f075b1db9a8.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=8b6424c6f5c1896d1c28626e2c3eca6bd9a1a3cd15d8d623ad7064dec36c03fc&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // ROOT decorative text (3204:10155)
  ["root-text.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/8267dbb1e5cf982bca779122fba970ff.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=5bdaafa5c463c4ea20f308b920741219b6e65924239877f07b6ff88da4b1b1e0&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // FURTHER decorative text (3204:10154)
  ["further-text.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/78e0d2d0cccc45a09d6c32ba7920f372.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=884f22cec69091a5dc17794b81dc0d47440765293ba0229650715e542aeabdf8&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // Award card background — shared (I2167:9075;214:1019;81:2442)
  ["award-bg.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/0f4ce32dc567f2776759cbca1944b830.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=2c70b3539fe49da0d5b02177235a459241b9e077c8937e670bc388e335720627&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // Award name images
  ["award-top-talent.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/9309c7d879696beb4bc114c6689f239b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=f93098675e75cf7c294ff131e9fb9011fef026546064239223dbf6501dbd3aab&X-Amz-SignedHeaders=host&x-id=GetObject"],
  ["award-top-project.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/d4e73905902fae0bc0d6974b52c8a166.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=7e8189d68161d4e19c566fc27c005e3a718dcc431cbb6afcf2efba5350d6a95f&X-Amz-SignedHeaders=host&x-id=GetObject"],
  ["award-top-project-leader.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/39e50136b036fe90209e8d417a6267ac.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=dd533b21505c572f8fb5069d5be9792eee8464e427e24a11acb6a05266e3ddf2&X-Amz-SignedHeaders=host&x-id=GetObject"],
  ["award-best-manager.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/856054bb913119d19a82cb39fc7a8c92.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=602dfa245b5f665f20f4b328e24d8d119f8a9d8d01886830189727deb65f3e4a&X-Amz-SignedHeaders=host&x-id=GetObject"],
  ["award-signature-creator.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/dda76859098289dafb7555d22033b711.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=e3cc1b7c4feb8e08444776d0315c0d7aaf1be1c4966f82c90cbe1815051d8812&X-Amz-SignedHeaders=host&x-id=GetObject"],
  ["award-mvp.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/1070a91f60f7aeea1eb92db14d84fb0a.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=2556e8a7d1c67a768321dd7b3c716a8ed19467c972ae16550a41ed5e0345b220&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // Kudos section background (I3390:10349;313:8416)
  ["kudos-bg.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/f58422b0fb62fda6b13c54b5753c5ce2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=89f4dcad2ba21114c22ae7e69a88920a1f157817278e0319caf4a11ddaeae261&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // Kudos logo SVG (I3390:10349;329:2948)
  ["kudos-logo.svg", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/65302db591506dae741fe897e7d6e47f.svg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=a1a07c636c76eb278abed1c8c5a1840e637fa7a19eebf195d19641a8f9cb888a&X-Amz-SignedHeaders=host&x-id=GetObject"],
  // Footer logo (I5001:14800;342:1408;178:1030)
  ["logo-footer.png", "https://sdo-morpheus-prod.jp-osa-1.linodeobjects.com/private/9ypp4enmFmdK3YAFJLIu6C/figma-media/9b31d520d55fc18dbb3fdf6660e61068.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DWVJBYS403NQ1U7AV8IA%2F20260522%2Fjp-osa-1%2Fs3%2Faws4_request&X-Amz-Date=20260522T091149Z&X-Amz-Expires=600&X-Amz-Signature=459ebdc093246926aa3ad6e2365ff094ae06ea05f9ac7926837b65ec0c313758&X-Amz-SignedHeaders=host&x-id=GetObject"],
];

/**
 * @param {string} filename
 * @param {string} url
 * @returns {Promise<"ok"|"fail">}
 */
function download(filename, url) {
  return new Promise((resolve) => {
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
