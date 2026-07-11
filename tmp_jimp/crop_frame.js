// Crop assets/suved-badge.png to the gold frame's outer edge, discarding
// the navy padding (and its baked-in stray sparkles) around the plaque.
const { Jimp, intToRGBA } = require('jimp');

(async () => {
  const image = await Jimp.read('../assets/suved-badge.png');
  const w = image.bitmap.width;
  const h = image.bitmap.height;

  const isGold = (x, y) => {
    const { r, g, b } = intToRGBA(image.getPixelColor(x, y));
    return r > 140 && g > 90 && r - b > 40 && g - b > 20;
  };

  const rowCount = new Array(h).fill(0);
  const colCount = new Array(w).fill(0);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (isGold(x, y)) { rowCount[y]++; colCount[x]++; }

  // A frame border is a near-continuous gold line; stray sparkles are not.
  const rowHit = rowCount.map(c => c > w * 0.35);
  const colHit = colCount.map(c => c > h * 0.35);
  const top = rowHit.indexOf(true);
  const bottom = rowHit.lastIndexOf(true);
  const left = colHit.indexOf(true);
  const right = colHit.lastIndexOf(true);
  console.log(`image ${w}x${h}; frame rows ${top}..${bottom}, cols ${left}..${right}`);

  // keep 2px beyond the frame edge for the antialiased fringe
  const m = 2;
  const x = Math.max(0, left - m);
  const y = Math.max(0, top - m);
  const cw = Math.min(w, right + m + 1) - x;
  const ch = Math.min(h, bottom + m + 1) - y;
  console.log(`crop x=${x} y=${y} w=${cw} h=${ch}`);

  image.crop({ x, y, w: cw, h: ch });
  await image.write('../assets/suved-badge-cut.png');
  console.log('wrote assets/suved-badge-cut.png');
})().catch(e => { console.error(e); process.exit(1); });
