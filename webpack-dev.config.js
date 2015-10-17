/* Webpack config for development */
/* Run it with $ npm start */
/* Includes react-hot-loader to reload react components without losing the app state.
   Access on http://localhost:3000/webpack-dev-server/
   Everytime you modify a js file the changes will be sent to the browsers currently displaying the app and update the parts that changed.
   */

var webpack = require("webpack");

const server_port = 3000;

module.exports = {
    debug: true,
    devtool: "inline-source-map",
    WEBPACK_PORT: server_port,
    entry: {
	projo: "./projo.js",
        tv: "./tv.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name]-app.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loaders: ["babel"] }
        ]
    },
    plugins: [
	new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            __DEV__: true
        }),
        new webpack.NoErrorsPlugin(),
    ],
};
