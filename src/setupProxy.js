const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

    const proxyConfig = {
        target: process.env.REACT_APP_API_URL,
        changeOrigin: true,
        headers: {
          'Content-Type': 'text/plain'
        }
      };
  app.use(
    '/flatconfig',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/flatconfig`,
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );

  app.use(
    '/clickconfig',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/clickconfig`,
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );

  app.use(
    '/command',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/command`,
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );

  app.use(
    '/handlers',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/handlers`,
      changeOrigin: true,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  );

  app.use(
    '/fastclick',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/fastclick': '',
      },
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  );

  
};