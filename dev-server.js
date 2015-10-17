const webpack = require('webpack'),
      WebpackDevServer = require('webpack-dev-server'),
      config = require("./webpack-dev.config.js");

const server = new WebpackDevServer(webpack(config), {
  contentBase: "./",
  publicPath: "/dist/",
  hot    : true,
  lazy   : false,
  noInfo : true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  stats  : {
    colors : true
  },
  historyApiFallback : true
});

server.listen(config.WEBPACK_PORT, 'localhost', function () {
  console.log('Webpack dev server running at localhost:' + config.WEBPACK_PORT);
});

module.exports = exports = server;
