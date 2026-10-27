const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const { VueLoaderPlugin } = require("vue-loader");

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[contenthash].js",
    assetModuleFilename: "[hash][ext][query]",
  },
  module: {
    parser: {
      javascript: {
        fullySpecified: false,
      },
    },
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: [
          MiniCSSExtractPlugin.loader,
          { loader: "css-loader", options: { importLoaders: 1 } },
          "postcss-loader",
        ],
      },
      {
        test: /\.png$/,
        loader: "url-loader",
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".vue"],
    alias: {},
    // Hook de resolución interno de Webpack para redirigir el import fallido del snippet multihilo
    plugins: [
      {
        apply: (resolver) => {
          resolver.hooks.resolve.tap("RedirectWasmSnippets", (request) => {
            if (
              request.request === "../.." &&
              request.context.issuer &&
              request.context.issuer.includes("solver-mt")
            ) {
              return {
                ...request,
                request: path.resolve(__dirname, "pkg/solver-mt/solver.js"),
              };
            }
          });
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({ patterns: [{ from: "public" }] }),
    new HTMLWebpackPlugin({ template: "index.html" }),
    new MiniCSSExtractPlugin({ filename: "[contenthash].css" }),
    new VueLoaderPlugin(),
    // Intercepta cualquier intento de importar solver.js desde los snippets y lo redirige de forma absoluta
    new webpack.NormalModuleReplacementPlugin(/solver\.js$/, (resource) => {
      if (resource.context && resource.context.includes("snippets")) {
        resource.request = path.resolve(__dirname, "pkg/solver-mt/solver.js");
      }
    }),
    new webpack.NormalModuleReplacementPlugin(
      /css-loader[/\\]dist[/\\]runtime/,
      (resource) => {
        if (resource.request.includes("noSourceMaps.js")) {
          resource.request = path.resolve(
            __dirname,
            "node_modules/css-loader/dist/runtime/noSourceMaps.js"
          );
        } else if (resource.request.includes("api.js")) {
          resource.request = path.resolve(
            __dirname,
            "node_modules/css-loader/dist/runtime/api.js"
          );
        }
      }
    ),
  ],
  experiments: {
    asyncWebAssembly: false,
    syncWebAssembly: false,
  },
};
