import p5 from "p5";
import "../css/style.css";

/** @type {p5.Image} */
let img;

const IMAGE_WIDTH = 860;
const IMAGE_HEIGTH = 512;

const FACTOR = 1;
const IMG_RESIZE = 2;

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
    p.preload = () => {
      // preload garante que a imagem carregue antes de iniciar o sketch
      img = p.loadImage("./dog.jpg");
    };

    p.setup = () => {
      p.createCanvas(IMAGE_WIDTH, IMAGE_HEIGTH);
      img.resize(IMAGE_WIDTH / IMG_RESIZE, IMAGE_HEIGTH / IMG_RESIZE);
      p.noLoop(); // Executa o draw() apenas uma vez
    };

    p.draw = () => {
      img.filter("gray");
      img.loadPixels();

      for (let y = 0; y < img.height - 1; y++) {
        for (let x = 0; x < img.width - 1; x++) {
          let idx = getIndex(x, y);

          let [oldR, oldG, oldB] = getRGB(idx);

          const [newR, newG, newB] = quantizateColor([oldR, oldG, oldB]);

          setRGB(idx, [newR, newG, newB]);

          let errorR = oldR - newR;
          let errorG = oldG - newG;
          let errorB = oldB - newB;

          let rightIdx = getIndex(x + 1, y);
          addRGB(rightIdx, [
            errorR * (7 / 16),
            errorG * (7 / 16),
            errorB * (7 / 16),
          ]);

          let downLeftIdx = getIndex(x - 1, y + 1);
          addRGB(downLeftIdx, [
            errorR * (3 / 16),
            errorG * (3 / 16),
            errorB * (3 / 16),
          ]);

          let downIdx = getIndex(x, y + 1);
          addRGB(downIdx, [
            errorR * (5 / 16),
            errorG * (5 / 16),
            errorB * (5 / 16),
          ]);

          let downRightIdx = getIndex(x + 1, y + 1);
          addRGB(downRightIdx, [
            errorR * (1 / 16),
            errorG * (1 / 16),
            errorB * (1 / 16),
          ]);
        }
      }

      img.updatePixels();

      // AGORA desenhamos a imagem na tela, DEPOIS de ter alterado ela
      p.background(255); // Fundo branco pra você ver a diferença

      p.noSmooth();
      p.image(img, 0, 0, IMAGE_WIDTH, IMAGE_HEIGTH);
    };
  },
  "one",
);
