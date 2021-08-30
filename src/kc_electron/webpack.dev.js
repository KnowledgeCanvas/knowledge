// This file was generated following the guide provided at
// https://www.sitepen.com/blog/getting-started-with-electron-typescript-react-and-webpack
const {merge} = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'development',
});
