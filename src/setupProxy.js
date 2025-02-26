const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

  app.use(
    '/flatconfig',
    createProxyMiddleware({
      changeOrigin: true,
      router: (req) => {
        const base = req.headers['x-api-target'];
        return `${base}/flatconfig`;
      }
    })
  );

  app.use(
    '/clickconfig',
    createProxyMiddleware({
      changeOrigin: true,
      router: (req) => {
        const base = req.headers['x-api-target'];
        return `${base}/clickconfig`;
      }
    })
  );

  app.use(
    '/command',
    createProxyMiddleware({
      changeOrigin: true,
      router: (req) => {
        const base = req.headers['x-api-target'];
        return `${base}/command`;
      }
    })
  );

  app.use(
    '/handlers',
    createProxyMiddleware({
      changeOrigin: true,
      router: (req) => {
        const base = req.headers['x-api-target'];
        return `${base}/handlers`;
      }
    })
  );

  app.use(
    '/fastclick',
    createProxyMiddleware({
      changeOrigin: true,
      router: (req) => {
        return req.headers['x-api-target'];
      },
      pathRewrite: {
        '^/fastclick': '',
      },
    })
  );

  
};