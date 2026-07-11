const Jimp = require('jimp');

Jimp.read('../assets/suved-badge.png').then(image => {
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  // get background color at 0,0
  const bg = Jimp.intToRGBA(image.getPixelColor(0,0));
  
  function diff(rgba) {
      return Math.abs(rgba.r - bg.r) + Math.abs(rgba.g - bg.g) + Math.abs(rgba.b - bg.b);
  }
  
  const threshold = 15;
  let top = 0, bottom = h - 1, left = 0, right = w - 1;
  
  for(let y=0; y<h; y++) {
    let empty = true;
    for(let x=0; x<w; x++) { 
        let d = diff(Jimp.intToRGBA(image.getPixelColor(x, y)));
        if(d > threshold) { empty = false; break; } 
    }
    if(!empty) { top = y; break; }
  }
  for(let y=h-1; y>=0; y--) {
    let empty = true;
    for(let x=0; x<w; x++) { 
        let d = diff(Jimp.intToRGBA(image.getPixelColor(x, y)));
        if(d > threshold) { empty = false; break; } 
    }
    if(!empty) { bottom = y; break; }
  }
  for(let x=0; x<w; x++) {
    let empty = true;
    for(let y=0; y<h; y++) { 
        let d = diff(Jimp.intToRGBA(image.getPixelColor(x, y)));
        if(d > threshold) { empty = false; break; } 
    }
    if(!empty) { left = x; break; }
  }
  for(let x=w-1; x>=0; x--) {
    let empty = true;
    for(let y=0; y<h; y++) { 
        let d = diff(Jimp.intToRGBA(image.getPixelColor(x, y)));
        if(d > threshold) { empty = false; break; } 
    }
    if(!empty) { right = x; break; }
  }
  console.log(`w=${w}, h=${h}`);
  console.log(`top=${top}, bottom=${bottom}, left=${left}, right=${right}`);
  console.log(`clip-path: inset(${(top/h*100).toFixed(2)}% ${((w-1-right)/w*100).toFixed(2)}% ${((h-1-bottom)/h*100).toFixed(2)}% ${(left/w*100).toFixed(2)}%);`);
}).catch(console.error);
