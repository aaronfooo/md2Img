
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.ts': 'text/javascript',
  '.tsx': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  // 处理基本的路由，如果是根路径则返回 index.html
  let filePath = req.url === '/' ? './index.html' : '.' + req.url;
  
  // 移除查询参数
  filePath = filePath.split('?')[0];

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 如果找不到文件（例如 SPA 路由），则重定向到 index.html
        fs.readFile('./index.html', (err, indexContent) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexContent, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
