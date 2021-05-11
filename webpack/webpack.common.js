const Path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    ...Object.fromEntries(
      fs
        .readdirSync(Path.resolve(__dirname, "../src/demo"), {
          withFileTypes: true,
        })
        .filter((f) => f.isDirectory())
        .map((f) => [
          f.name,
          Path.resolve(__dirname, "../src/demo/", f.name, "scripts/index.js"),
        ])
    ),
    main: Path.resolve(__dirname, "../src/scripts/index.js"),
  },
  output: {
    path: Path.join(__dirname, "../build"),
    filename: "js/[name].js",
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: "async",
  //   },
  // },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: Path.resolve(__dirname, "../public"), to: "public" }],
    }),
    new HtmlWebpackPlugin({
      chunks: ["main"],
      filename: "index.html",
      template: Path.resolve(__dirname, "../src/index.html"),
    }),
    ...fs
      .readdirSync(Path.resolve(__dirname, "../src/demo"), {
        withFileTypes: true,
      })
      .filter((f) => f.isDirectory())
      .map(
        (f) =>
          new HtmlWebpackPlugin({
            chunks: [f.name],
            filename: `${f.name}.html`,
            template: Path.resolve(
              __dirname,
              "../src/demo",
              f.name,
              "index.html"
            ),
          })
      ),
  ],
  resolve: {
    alias: {
      "~": Path.resolve(__dirname, "../src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
          },
        },
      },
    ],
  },
};
