const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// إنشاء مجلد التخزين تلقائياً
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعدادات رفع الملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// إتاحة الوصول للملفات العامة
app.use(express.static('public'));

// مسار رفع الفيديو
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'يرجى اختيار فيديو للرفع' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
});

// ملف خريطة الموقع للظهور في جوجل (Sitemap)
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://${req.get('host')}/</loc>
        <priority>1.0</priority>
      </url>
    </urlset>`);
});

// ملف تعليمات عناكب البحث (Robots.txt)
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: https://${req.get('host')}/sitemap.xml`);
});

app.listen(PORT, () => {
    console.log(`Server connected on port ${PORT}`);
});
module.exports = app;