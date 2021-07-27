const path = require("path");

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const webAppDir = __dirname;
const rootDir = path.resolve(webAppDir, ".");
const buildDir = path.join(webAppDir, "dist");

module.exports = {
    mode: "development",
    context: rootDir,
    entry: "./monitor/index.ts",
    output: {
        path: buildDir,
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
            template: "./monitor/index.html",
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css'
        }),
        new CopyPlugin({
            patterns: [
                { from: "./monitor/testdata.json", to: buildDir },
                { from: "./monitor/main.css", to: buildDir },
            ],
        }),
    ],
    devServer: {
        port: 3000,
        contentBase: buildDir,
        compress: false,
        historyApiFallback: true,
    },
    watchOptions: {
        ignored: [buildDir, "node_modules"],
        aggregateTimeout: 1500,
    },
};
