import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const upiString = 'upi://pay?pa=7247066469@ptyes&pn=NARSINGH%20KUMAR%20KEWAT&cu=INR';
const targetPath = path.join(outDir, 'payment-qr.jpg');

QRCode.toFile(targetPath, upiString, {
  type: 'jpeg',
  quality: 0.95,
  width: 600,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
}, function (err) {
  if (err) throw err;
  console.log('Saved payment-qr.jpg to', targetPath);
});
