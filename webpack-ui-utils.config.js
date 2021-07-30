const path = require("path");

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const webAppDir = __dirname;
const rootDir = path.resolve(webAppDir, ".");
const distrDir = path.join(webAppDir, "dist_ui_utils");

module.exports = {
    mode: "development",
    context: rootDir,
    entry: "./ui_utils/index.ts",
    output: {
        path: distrDir,
        filename: "bundle.[hash].js",
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: {
                    loader: "ts-loader",
                },
                include: rootDir,
                exclude: [/node_modules/, /\.test\.ts/],
            },
            {
                test: /\.css$/i,
                use: ["css-loader"],
              },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./ui_utils/index.html",
            minify: false
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css'
        }),
        new CopyPlugin({
            patterns: [
                // { from: "./monitor/testdata.json", to: distrDir },
                { from: "./ui_utils/main.css", to: distrDir },
            ],
        }),
    ],
    devServer: {
        port: 3000,
        contentBase: distrDir,
        compress: false,
        historyApiFallback: true,
    },
    watchOptions: {
        ignored: [distrDir, "node_modules"],
        aggregateTimeout: 1500,
    },
};
