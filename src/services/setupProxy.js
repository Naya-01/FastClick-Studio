const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/flatconfig',
    createProxyMiddleware({
      target: 'http://localhost:80',
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );

  app.use(
    '/clickconfig',
    createProxyMiddleware({
      target: 'http://localhost:80',
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );

  app.use(
    '/command',
    createProxyMiddleware({
      target: 'http://localhost:80',
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );

  app.use(
    '/handlers',
    createProxyMiddleware({
      target: 'http://localhost:80',
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );
};
