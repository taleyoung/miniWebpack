// @ts-nocheck
const webpack = require("webpack");
const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const merger = require("webpack-merge");
const devConfig = require("./webpack.dev");
const prodConfig = require("./webpack.prod");

const clientPath = path.resolve(__dirname, "../src");
const devMode = process.env.NODE_ENV !== "production";

const commonConfig = {
  entry: {
    main: path.resolve(clientPath, "index.tsx")
  },
  output: {
    publicPath: "/",
    path: path.resolve(process.cwd(), "dist"),
    filename: "src/[name]_[hash].js",
    chunkFilename: "src/[name].chunk.js"
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: "all"
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_mudules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.(png|jpg|gif｜jpeg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/img"
            }
          }
        ]
      },
      {
        test: /\.(css|less|scss)$/,
        exclude: /node_modules/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "typings-for-css-modules-loader",
            options: {
              modules: true,
              namedExport: true,
              camelCase: true,
              minimize: true,
              localIdentName: "[local]_[hash:base64:5]",
              sass: true
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          "sass-loader"
        ]
      }
    ]
  },
  resolve: {
    alias: {
      "@src": clientPath,
      "@assets": path.resolve(clientPath, "assets"),
      "@pages": path.resolve(clientPath, "pages"),
      "@redux": path.resolve(clientPath, "redux"),
      "@components": path.resolve(clientPath, "components"),
      "@routes": path.resolve(clientPath, "routes"),
      "@utils": path.resolve(clientPath, "utils"),
      "@config": path.resolve(clientPath, "config")
    },
    //顺序是从左向右
    extensions: [".tsx", ".ts", ".js", ".d.ts"],
    //默认就是index 太多影响性能
    mainFiles: ["index", "main"]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(process.cwd(), "public/index.html"),
      filename: "index.html",
      favicon: path.resolve(process.cwd(), "public/favicon.ico")
    }),
    new webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
    new MiniCssExtractPlugin({
      //被页面直接引用的文件走filename， 不被直接引用的走chunkFilename
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
    }),
    new CleanWebpackPlugin()
  ]
};

module.exports = env => {
  if (env && env.production) {
    return merger(commonConfig, prodConfig);
  } else {
    return merger(commonConfig, devConfig);
  }
};
