const path = require("path");

const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// const createStyledComponentsTransformer = require("typescript-plugin-styled-components").default;
// const styledComponentsTransformer = createStyledComponentsTransformer({ ssr: false });

const webAppDir = __dirname;
const rootDir = path.resolve(webAppDir, ".");
const buildDir = path.join(webAppDir, "dist");

module.exports = {
    mode: "development",
    context: rootDir,
    // devtool: isProd ? 'source-map' : 'inline-source-map',
    entry: "./monitor/index.ts",
    output: {
        path: buildDir,
        filename: "bundle.[hash].js",
        publicPath: "/",
    },
    module: {
        rules: [
            {
                test: /\.(j|t)sx?$/,
                use: {
                    loader: "ts-loader",
                    // options: {
                    //     getCustomTransformers: () => ({ before: [styledComponentsTransformer] }),
                    //     onlyCompileBundledFiles: true,
                    // },
                },
                include: rootDir,
                exclude: [/node_modules/, /\.test\.ts/],
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
        new CopyPlugin({
            patterns: [
                { from: "./monitor/testdata.json", to: buildDir },
                { from: "./monitor/main.css", to: buildDir },
            ],
        }),
    ],
    optimization: {
        namedModules: true,
        namedChunks: true,
        splitChunks: {
            chunks: "all",
        },
        noEmitOnErrors: true,
    },
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
