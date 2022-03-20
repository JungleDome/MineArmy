const env = process.env.NODE_ENV;
const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");

module.exports = {
    mode: env == 'production' || env == 'none' ? env : 'development',
    entry: {
        main: "./web/main.js",
    },
    output: {
        path: path.resolve(__dirname, "./web/dist"),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
            },
            {
                test: /\.s?css$/,
                use: [
                    'vue-style-loader',
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
                loader: "file-loader",
            },
            {
                test: /\.(png|jpe?g|gif|webm|mp4|svg)$/,
                loader: "file-loader",
            }
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    resolve: {
        extensions: ["*", ".js", ".vue", ".json"],
    },
    devServer: {
        historyApiFallback: true,
        hot: true,
        client: {
            progress: true,
            logging: 'info'
        },
        static: {
            directory: path.join(__dirname, 'web/public'),
        },
        port: 8081
    },
    devtool: 'inline-source-map',
};