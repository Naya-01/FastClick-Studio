const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

    const proxyConfig = {
        target: process.env.REACT_APP_API_URL,
        changeOrigin: true,
      };
  app.use(
    '/flatconfig',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/flatconfig`,
      changeOrigin: true,
    })
  );

  app.use(
    '/clickconfig',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/clickconfig`,
      changeOrigin: true,
    })
  );

  app.use(
    '/command',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/command`,
      changeOrigin: true,
    })
  );

  app.use(
    '/handlers',
    createProxyMiddleware({
      target: `${process.env.REACT_APP_API_URL}/handlers`,
      changeOrigin: true,
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
    })
  );

  
};