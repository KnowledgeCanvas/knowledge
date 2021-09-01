const path = require('path');

var webpack_config =
    {
        entry: {
            electron: path.join(__dirname, 'src', 'electron.ts'),
            preload: path.join(__dirname, 'src', 'preload.js')
        },
        target: 'electron-main', // Webpack knows about the electron main process specifically
        module: {
            rules: [{
                test: /\.ts$/, // This particular rule matches all .ts files
                use: [{loader: 'ts-loader'}] // Which loader to use when the rule matches
            }]
        },
        output: {
            path: path.join(process.cwd(), 'dist'), // all output files are placed here
            filename: '[name].js' // Primary output bundle
        },
        externals: {
            // NOTE: this had to be added after manually installing Chokidar 3.5
            // NOTE: https://github.com/yan-foto/electron-reload/issues/71
            fsevents: "require('fsevents')"
        },
        resolve: {
            extensions: ['.ts', '.js', '.json']
        },
        plugins: [],
    };

module.exports = webpack_config;
