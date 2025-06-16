const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
  const safePath = decodeURIComponent(req.url.split('?')[0]);
  const sanitized = path
    .normalize(safePath)
    .replace(/^([\.]{2,}[\/])+/, '');
  const filePath = path.join(publicDir, sanitized === '/' ? 'index.html' : sanitized);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4'
    }[ext] || 'application/octet-stream';

    if (ext === '.mp4') {
      const range = req.headers.range;
      if (!range) {
        res.writeHead(200, {
          'Content-Type': 'video/mp4',
          'Content-Length': stats.size,
          'Accept-Ranges': 'bytes'
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4'
        });

        fs.createReadStream(filePath, { start, end }).pipe(res);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
