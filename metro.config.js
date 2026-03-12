const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Enhance the middleware to serve static files from public folder
if (!config.server) {
  config.server = {};
}

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Handle static assets from public folder
    if (req.url.startsWith('/assets/')) {
      const filePath = path.join(__dirname, 'public', req.url);
      try {
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Cache-Control', 'no-cache');
          res.sendFile(filePath);
          return;
        }
      } catch (err) {
        console.error('Error serving static file:', err);
      }
    }
    return middleware(req, res, next);
  };
};

module.exports = config;
