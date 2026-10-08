import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import fs from "fs/promises";
import path from "path";
import pdf from "pdf-parse";

const id = process.env.ID || process.argv[2] || "24901";
const pdfUrl = `https://finbandy.torneopal.fi/poytakirjat/${id}.pdf`;
const outDir = "/tmp/bandyliiga-pdf-test";
const pdfPath = path.join(outDir, `${id}.pdf`);

await fs.mkdir(outDir, { recursive: true });

const browser = await playwright.launch({
  args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
  executablePath: await chromium.executablePath(),
  headless: true
});

try {
  const page = await browser.newPage();
  const responses = [];

  page.on("response", r => {
    if (r.url().includes("finbandy") || r.url().includes("torneopal")) {
      responses.push({ status: r.status(), url: r.url() });
    }
  });

  const result = await page.evaluate(async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const b = await r.arrayBuffer();
    return {
      status: r.status,
      contentType: r.headers.get("content-type"),
      bytes: b.byteLength,
      base64: btoa(String.fromCharCode(...new Uint8Array(b)))
    };
  }, pdfUrl);

  await fs.writeFile(pdfPath, Buffer.from(result.base64, "base64"));

  const data = await pdf(await fs.readFile(pdfPath));

  const output = {
    ok: true,
    id,
    pdfUrl,
    httpStatus: result.status,
    contentType: result.contentType,
    bytes: result.bytes,
    pages: data.numpages,
    text: data.text,
    textLength: data.text.length,
    metadata: data.info || {},
    first5000Chars: data.text.slice(0, 5000),
    responses
  };

  console.log(JSON.stringify(output, null, 2));
} catch (err) {
  console.log(JSON.stringify({
    ok: false,
    id,
    pdfUrl,
    error: String(err?.stack || err)
  }, null, 2));
} finally {
  await browser.close();
}
