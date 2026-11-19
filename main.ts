// gta6-meme-x-01 entry (Node 22, standard library only, no network): it copies
// POST.json, meme.png and README.md from the repository root to /output and writes
// a manifest.json describing the meme. The entry itself is the X post named in
// POST.json: the house reads the post from X (its first picture and its text) and
// hands that to the judge. Nothing this program writes is judged.
//
// Mount-safe: /output may be a mount point in the grader, so this program NEVER
// removes the output directory itself. It creates it if missing, clears only its
// CHILDREN, then copies and writes into it.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in
// for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The proposed text of the X post (the user posts this from their own phone;
// the parent fills POST.json with the real post URL afterwards).
const PROPOSED_POST_TEXT =
  'Waited 13 years for GTA 6… my ghost already got paid cruising Vice City \u{1F47B} ' +
  'On make.fun, you and your AI agent can win real money in bounties — this $500 one included! @makefunai\n' +
  'Play: makefun-mammoth-windmill-cattail\n' +
  'https://make.fun/bounty/gta6-meme-x-01';

// Create the output directory if needed, then clear only its children.
// Never rmSync/rmdir the output directory itself: it may be a mount point.
mkdirSync(OUTPUT_DIR, { recursive: true });
for (const child of readdirSync(OUTPUT_DIR)) {
  rmSync(join(OUTPUT_DIR, child), { recursive: true, force: true });
}

// Copy the entry files into the output directory.
for (const name of ['POST.json', 'meme.png', 'README.md']) {
  try {
    copyFileSync(join(BOT_DIR, name), join(OUTPUT_DIR, name));
  } catch (err) {
    console.error(`${name} could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
    process.exit(1);
  }
}

// A deterministic manifest describing the meme. Fixed strings only: no clock,
// no randomness, no environment reads, so two runs write identical bytes.
const manifest = {
  competition: 'gta6-meme-x-01',
  title: 'Waited 13 years for GTA 6',
  meme_file: 'meme.png',
  joke: 'We waited 13 years since GTA V for GTA 6 — and while everyone was waiting, the make.fun ghost already got paid, cruising Vice City in a pink convertible with its magenta star coin.',
  makefun_element:
    'The make.fun ghost mascot (white ghost, thick black outline, two black four-pointed sparkle eyes, holding a magenta coin with a white star) driving a pink convertible through a Vice City neon sunset, with the name make.fun in large white letters on a magenta banner.',
  post_file: 'POST.json',
  play_code: 'makefun-mammoth-windmill-cattail',
  bounty: 'https://make.fun/bounty/gta6-meme-x-01',
  proposed_post_text: PROPOSED_POST_TEXT,
};
writeFileSync(join(OUTPUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
