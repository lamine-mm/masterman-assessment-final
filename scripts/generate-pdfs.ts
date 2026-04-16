/**
 * Generate 4 static stage-based PDF roadmaps using pdf-lib.
 * Run: npx tsx scripts/generate-pdfs.ts
 * Output: public/pdfs/stage-{1,2,3,4}-roadmap.pdf
 */

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

const roadmaps = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../content/stage-roadmaps.json"), "utf8")
).stages;

const copy = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../content/copy.json"), "utf8")
);

const disclaimer = copy.disclaimer.short;

// Colors
const cream = rgb(250 / 255, 247 / 255, 242 / 255);
const dark = rgb(26 / 255, 18 / 255, 9 / 255);
const gold = rgb(200 / 255, 169 / 255, 74 / 255);
const muted = rgb(92 / 255, 74 / 255, 42 / 255);
const faint = rgb(138 / 255, 112 / 255, 87 / 255);
const white = rgb(1, 1, 1);

const W = 595;
const H = 842;
const M = 50; // margin
const TW = W - M * 2; // text width

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawText(
  page: PDFPage, text: string, x: number, y: number,
  font: PDFFont, size: number, color: ReturnType<typeof rgb>, maxW: number, lh: number
): number {
  for (const line of wrap(text, font, size, maxW)) {
    if (y < 45) break;
    page.drawText(line, { x, y, size, font, color });
    y -= lh;
  }
  return y;
}

function drawTextCentered(
  page: PDFPage, text: string, y: number,
  font: PDFFont, size: number, color: ReturnType<typeof rgb>, maxW: number, lh: number
): number {
  for (const line of wrap(text, font, size, maxW)) {
    if (y < 45) break;
    const lw = font.widthOfTextAtSize(line, size);
    page.drawText(line, { x: (W - lw) / 2, y, size, font, color });
    y -= lh;
  }
  return y;
}

function header(page: PDFPage, f: PDFFont, n: number) {
  page.drawRectangle({ x: 0, y: H - 38, width: W, height: 38, color: dark });
  page.drawText("MASTERMAN", { x: M, y: H - 26, size: 9, font: f, color: gold });
  page.drawText(`STAGE ${n} ROADMAP`, { x: W - M - 105, y: H - 26, size: 9, font: f, color: faint });
}

function footer(page: PDFPage, f: PDFFont) {
  page.drawRectangle({ x: 0, y: 0, width: W, height: 30, color: dark });
  page.drawText(disclaimer.substring(0, 90) + "...", { x: 24, y: 10, size: 5.5, font: f, color: faint });
}

function rule(page: PDFPage, y: number) {
  page.drawLine({ start: { x: 100, y }, end: { x: W - 100, y }, thickness: 0.5, color: gold, opacity: 0.4 });
}

function pg(doc: PDFDocument, f: PDFFont, n: number): PDFPage {
  const p = doc.addPage([W, H]);
  p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
  header(p, f, n);
  footer(p, f);
  return p;
}

async function gen(stageNum: number) {
  const r = roadmaps[stageNum.toString()];
  const doc = await PDFDocument.create();
  const rom = await doc.embedFont(StandardFonts.TimesRoman);
  const bld = await doc.embedFont(StandardFonts.TimesRomanBold);
  const itl = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const url = `https://mastermangroup.com?utm_source=masterman&utm_medium=pdf&utm_campaign=stage-${stageNum}`;

  // ── COVER ──────────────────────────────────────────────────────────────────
  {
    const p = doc.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
    p.drawRectangle({ x: 0, y: H - 50, width: W, height: 50, color: dark });
    const wm = "MASTERMAN";
    p.drawText(wm, { x: (W - rom.widthOfTextAtSize(wm, 12)) / 2, y: H - 34, size: 12, font: rom, color: gold });

    const yr = "YOUR ROADMAP";
    p.drawText(yr, { x: (W - rom.widthOfTextAtSize(yr, 13)) / 2, y: 520, size: 13, font: rom, color: faint });

    const st = `STAGE ${stageNum}`;
    p.drawText(st, { x: (W - bld.widthOfTextAtSize(st, 60)) / 2, y: 440, size: 60, font: bld, color: dark });

    const nm = r.name;
    p.drawText(nm, { x: (W - bld.widthOfTextAtSize(nm, 24)) / 2, y: 400, size: 24, font: bld, color: dark });

    rule(p, 378);

    drawTextCentered(p, r.tagline, 352, itl, 16, muted, 360, 24);
    footer(p, rom);
  }

  // ── WHAT THIS STAGE IS ─────────────────────────────────────────────────────
  {
    const p = pg(doc, rom, stageNum);
    let y = H - 68;
    p.drawText(`WHAT STAGE ${stageNum} IS`, { x: M, y, size: 11, font: rom, color: gold });
    y -= 30;
    p.drawText(r.name, { x: M, y, size: 22, font: bld, color: dark });
    y -= 32;
    for (const para of r.whatThisStageIs.split("\n\n")) {
      y = drawText(p, para, M, y, rom, 15, muted, TW, 22);
      y -= 12;
    }
  }

  // ── CONSTRAINTS ────────────────────────────────────────────────────────────
  {
    const p = pg(doc, rom, stageNum);
    let y = H - 68;
    p.drawText("THE CONSTRAINTS YOU ARE FACING", { x: M, y, size: 11, font: rom, color: gold });
    y -= 28;
    for (const c of r.constraints) {
      p.drawText(c.title, { x: M, y, size: 15, font: bld, color: dark });
      y -= 22;
      y = drawText(p, c.body, M, y, rom, 14, muted, TW, 21);
      y -= 22;
    }
  }

  // ── SOLUTIONS ──────────────────────────────────────────────────────────────
  // May need 2 pages for solutions — split if needed
  {
    let p = pg(doc, rom, stageNum);
    let y = H - 68;
    p.drawText("HOW TO BREAK THROUGH", { x: M, y, size: 11, font: rom, color: gold });
    y -= 28;

    for (const sol of r.solutions) {
      // Check if we need a new page
      if (y < 200) {
        p = pg(doc, rom, stageNum);
        y = H - 68;
      }
      p.drawText(sol.title, { x: M, y, size: 15, font: bld, color: dark });
      y -= 22;
      y = drawText(p, sol.body, M, y, rom, 14, muted, TW, 21);
      y -= 8;
      y = drawText(p, sol.islamicAnchor, M + 6, y, itl, 13, faint, TW - 12, 19);
      y -= 22;
    }
  }

  // ── 7-DAY PLAN ─────────────────────────────────────────────────────────────
  {
    const p = pg(doc, rom, stageNum);
    let y = H - 68;
    p.drawText("YOUR FIRST 7 DAYS", { x: M, y, size: 11, font: rom, color: gold });
    y -= 24;
    y = drawText(p, "One action per day. Each one builds on the last.", M, y, rom, 15, muted, TW, 22);
    y -= 14;

    const plan = r.sevenDayPlan;
    for (let d = 1; d <= 7; d++) {
      const txt = (plan as Record<string, string>)[`day${d}`];
      p.drawText(`DAY ${d}`, { x: M, y, size: 11, font: bld, color: gold });
      y -= 18;
      y = drawText(p, txt, M, y, rom, 13, muted, TW, 19);
      y -= 12;
    }
  }

  // ── CTA ────────────────────────────────────────────────────────────────────
  {
    const p = pg(doc, rom, stageNum);
    let y = H - 90;

    if (stageNum < 4) {
      p.drawText(`WHAT STAGE ${stageNum + 1} LOOKS LIKE`, { x: M, y, size: 11, font: rom, color: gold });
      y -= 24;
      y = drawText(p, r.advanceCriteria, M, y, rom, 14, muted, TW, 21);
      y -= 28;
      rule(p, y);
      y -= 32;
    } else {
      y -= 30;
    }

    y = drawTextCentered(p, r.cta.title, y, bld, 22, dark, 400, 28);
    y -= 14;
    y = drawTextCentered(p, r.cta.body, y, rom, 15, muted, 420, 22);
    y -= 24;

    // Button
    const btn = r.cta.buttonText;
    const btnW = bld.widthOfTextAtSize(btn, 14) + 60;
    const btnH = 46;
    const btnX = (W - btnW) / 2;
    const btnY = y - btnH;
    p.drawRectangle({ x: btnX, y: btnY, width: btnW, height: btnH, color: gold });
    p.drawText(btn, { x: btnX + 30, y: btnY + 17, size: 14, font: bld, color: dark });
    y = btnY - 20;

    // URL
    const urlShort = "mastermangroup.com";
    p.drawText(urlShort, { x: (W - rom.widthOfTextAtSize(urlShort, 11)) / 2, y, size: 11, font: rom, color: faint });
    y -= 50;

    p.drawText("This is not therapy. It is a mirror.", {
      x: (W - itl.widthOfTextAtSize("This is not therapy. It is a mirror.", 12)) / 2,
      y, size: 12, font: itl, color: muted,
    });
  }

  const bytes = await doc.save();
  fs.writeFileSync(path.join(__dirname, `../public/pdfs/stage-${stageNum}-roadmap.pdf`), bytes);
  console.log(`stage-${stageNum}-roadmap.pdf (${bytes.length} bytes)`);
}

async function main() {
  for (let i = 1; i <= 4; i++) await gen(i);
  console.log("Done — all 4 PDFs in public/pdfs/");
}
main().catch(console.error);
