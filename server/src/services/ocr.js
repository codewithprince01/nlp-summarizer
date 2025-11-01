import sharp from 'sharp';
import Tesseract from 'tesseract.js';

export async function extractTextFromImage(buffer) {
  // Basic pre-processing: grayscale and threshold to improve OCR
  const processed = await sharp(buffer)
    .grayscale()
    .normalise()
    .toBuffer();

  const { data } = await Tesseract.recognize(processed, 'eng', {
    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
  });
  return (data.text || '').trim();
}
