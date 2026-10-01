import p5 from "p5";
import "../css/style.css";

/** @type {p5.Image} */
let img;

/** @type {p5.Element} */
let cam;

const DOWNSCALE = 6;
const CAM_W = 1280;
const CAM_H = 720;

var FACTOR = 2;
const IMG_RESIZE = 2;

var setFactor = (num) => {
  if (!num) return;

  FACTOR = num;
};

document.setFactor = setFactor;

const getIndex = (x, y) => {
  return (x + y * img.width) * 4;
};

const getRGB = (idx) => {
  return [img.pixels[idx], img.pixels[idx + 1], img.pixels[idx + 2]];
};

const setRGB = (idx, rgb) => {
  const [r, g, b] = rgb;
  img.pixels[idx] = r;
  img.pixels[idx + 1] = g;
  img.pixels[idx + 2] = b;
};

const addRGB = (idx, rgb) => {
  const [r, g, b] = rgb;

  img.pixels[idx] += r;
  img.pixels[idx + 1] += g;
  img.pixels[idx + 2] += b;
};

const quantizateColor = (rgb) => {
  const [r, g, b] = rgb;

  let newR = Math.round((r / 255) * FACTOR) * (255 / FACTOR);
  let newG = Math.round((g / 255) * FACTOR) * (255 / FACTOR);
  let newB = Math.round((b / 255) * FACTOR) * (255 / FACTOR);

  return [newR, newG, newB];
};

new p5(
  /** @param {import('p5')} p */ (p) => {
    p.preload = () => {};

    p.setup = () => {
      p.createCanvas(CAM_W, CAM_H, "webgl");

      let camConstraints = {
        video: {
          mandatory: {
            frameRate: 60,
            minWidth: CAM_W,
            minHeight: CAM_H,
          },
          // optional: [{ maxFrameRate: 30 }],
        },
        audio: false,
      };

      cam = p.createCapture(camConstraints);
      cam.size(CAM_W / DOWNSCALE, CAM_H / DOWNSCALE);
      cam.hide();
    };

    p.draw = () => {
      if (cam.width === 0) return;

      img = cam.get();

      img.resize(512 / IMG_RESIZE, 512 / IMG_RESIZE);

      img.filter(p.GRAY);

      img.loadPixels();

      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          let idx = getIndex(x, y);

          let [oldR, oldG, oldB] = getRGB(idx);
          const [newR, newG, newB] = quantizateColor([oldR, oldG, oldB]);
          setRGB(idx, [newR, newG, newB]);

          let errorR = oldR - newR;
          let errorG = oldG - newG;
          let errorB = oldB - newB;

          if (x < img.width - 1) {
            addRGB(getIndex(x + 1, y), [
              errorR * (7 / 16),
              errorG * (7 / 16),
              errorB * (7 / 16),
            ]);
          }

          if (y < img.height - 1) {
            if (x > 0)
              addRGB(getIndex(x - 1, y + 1), [
                errorR * (3 / 16),
                errorG * (3 / 16),
                errorB * (3 / 16),
              ]);
            addRGB(getIndex(x, y + 1), [
              errorR * (5 / 16),
              errorG * (5 / 16),
              errorB * (5 / 16),
            ]);
            if (x < img.width - 1)
              addRGB(getIndex(x + 1, y + 1), [
                errorR * (1 / 16),
                errorG * (1 / 16),
                errorB * (1 / 16),
              ]);
          }
        }
      }

      img.updatePixels();

      p.background(0);
      p.noSmooth();

      let [centerX, centerY] = [(CAM_W / 2) * -1, (CAM_H / 2) * -1];

      p.image(img, centerX, centerY, CAM_W, CAM_H);
    };
  },
  "one",
);
