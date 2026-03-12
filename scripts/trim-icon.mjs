import sharp from 'sharp';
import { resolve } from 'path';

const input = resolve('C:/Users/Tom/Downloads/ChatGPT Image Mar 12, 2026, 07_32_31 PM.png');
const output = resolve('public/assets/images/icon.png');

const info = await sharp(input)
  .trim()
  .resize(1024, 1024, { fit: 'cover' })
  .png()
  .toFile(output);

console.log('Done:', JSON.stringify(info));
