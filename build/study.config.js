/**
 * webpack所有的配置 用于学习
 */

const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const clientPath = path.resolve(__dirname, "src");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: path.resolve(clientPath, "index.tsx"),
    //如果有多页面打包的话，就写两个入口
    list: ""
  },
  //当你这个库需要引入另一个库的时候 这样可以避免重复下载
  externals: {
    lodash: {
      root: "_", //script标签引入时 将_挂载到全局
      commonjs: "lodash"
    }
  },
  output: {
    //publicPath:"http://cdn.xxx.com" 这样html引入的js带这个前缀
    publicPath: "/",
    path: path.resolve(process.cwd(), "dist"),
    //加hash的原因是防止代码改变但文件名不变时 用户浏览器使用缓存
    filename: "src/[name]_[hash].js",
    chunkFilename: "[name].chunk.js",
    //下面两种是库打包需要的 library允许script标签引入 libraryTarget允许es commonjs
    library: "library",
    libraryTarget: "umd" //如果是this即表示library作为全局对象挂载到this
  },
  //sourceMap 是一个映射 dist中出错的代码映射到src中的代码
  //source-map会生成一个map文件，inline-source-map会吧映射关系写进main.js中
  //cheap-source-map  只告诉我是哪行出错就行了
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.resolve(process.cwd(), "dist"), //本地服务器所加载的页面所在的目录
    //解决单页应用 直接访问某地址出现404的问题，即把/app/overview转发到/路径
    historyApiFallback: true, //不跳转
    host: "127.0.0.1",
    port: 7000,
    hot: true, //开启热模块更新 还需配置下面的plugins
    inline: true, //实时刷新
    compress: true, //允许gzip压缩
    overlay: true, //Shows a full-screen overlay in the browser
    stats: "errors-only", //To show only errors in your bundle
    open: true, //自动打开浏览器
    disableHostCheck: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:7001",
        changeOrigin: true
      }
    } //重定向
  },

  optimization: {
    //进行代码分割
    splitChunks: {
      chunks: "all",
      minSize: 30000, //30kb
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          //优先级 和下面default对比 谁优先级大 优先给谁
          priority: -10,
          filename: "vendor.js"
        },
        default: {
          priority: -20,
          reuseExistingChunk: true,
          filename: "common.js"
        }
      }
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
              //如果地址低于8192 就用url-loader打包【以base64形式打包到bundle.js中 而不是图片地址】
              limit: 8192
            }
          }
        ]
      },
      {
        //file-loader打包特殊后缀名的文件
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
              //开启css modules
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
        //css-loader 分析css文件之间的关联关系 合并到一个文件中 style-loader将css挂载到head中
        //use数组中从右往左进行解析
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 2
            }
          },
          // "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
  resolve: {
    //配置路径别名，让webpack帮我们找路径
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
    extensions: [".tsx", ".ts", ".js", ".d.ts"]
  },
  plugins: [
    //打包后自动生成index.html 并引入生成的js
    new HtmlWebPackPlugin({
      //模板文件 没有的话生成的index.html没有任何根组件
      template: path.resolve(process.cwd(), "public/index.html"),
      filename: "index.html",
      favicon: path.resolve(process.cwd(), "public/favicon.ico")
    }),
    //如果是
    // new HtmlWebPackPlugin({
    //   template: path.resolve(process.cwd(), "public/index.html"),
    //   filename: "list.html",
    //   favicon: path.resolve(process.cwd(), "public/favicon.ico"),
    //    chunk:['runtime', 'ventor', 'list']
    // }),
    new webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
    }),
    //热模块更新， 代码更改的时候只更新本模块的内容，即不重新请求刷新整个文件
    new webpack.HotModuleReplacementPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: "server",
      analyzerHost: "127.0.0.1",
      analyzerPort: 8888,
      reportFilename: "report.html",
      defaultSizes: "parsed",
      openAnalyzer: true,
      generateStatsFile: false,
      statsFilename: "stats.json",
      statsOptions: null,
      logLevel: "info"
    }),
    new CleanWebpackPlugin()
  ]
};
