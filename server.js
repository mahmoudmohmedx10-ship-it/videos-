const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// إعداد مجلد رفع الملفات للعمل في بيئة Vercel المقتصرة على القراءة فقط (Read-Only)
// نستخدم المجلد المؤقت /tmp المسموح بالكتابة فيه
const uploadDir = path.join('/tmp', 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.log('Read-only filesystem detected, skipping local folder creation.');
}

// إعداد Multer لتخزين الملفات في المجلد المؤقت
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// الميدل وير الأساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خادم الملفات الثابتة (Static Files)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// إعداد ملف Robots.txt ومحركات البحث
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: https://${req.get('host')}/sitemap.xml`);
});

// إعداد ملف Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.index/schemas/sitemap/0.9">
  <url>
    <loc>https://${req.get('host')}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// المسار الرئيسي لتشغيل تطبيقك
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Server is running successfully on Vercel!');
  }
});

// تشغيل السيرفر محلياً
app.listen(PORT, () => {
  console.log(`Server connected on port ${PORT}`);
});

// أهم سطر لتشغيل السيرفر على Vercel بدون أخطاء
module.exports = app;
