/* Webpack config for production */
/* Run it with $ npm run compile */
/* It produces a unique minified js file, articles-app.js */

var webpack = require('webpack');

module.exports = {
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
	  { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            __DEV__: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            output : {
		'comments'  : false
            },
            compress : {
		'unused'    : true,
		'dead_code' : true
            }
	})
    ],
};
