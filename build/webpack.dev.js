const webpack = require("webpack");

const path = require("path");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.resolve(process.cwd(), "dist"),
    //解决单页应用 直接访问某地址出现404的问题，即把/app/overview转发到/路径
    historyApiFallback: true,
    host: "127.0.0.1",
    port: 7000,
    hot: true,
    inline: true,
    compress: true,
    //出现错误时在浏览器中弹出层提示
    overlay: true,
    stats: "errors-only",
    open: true,
    disableHostCheck: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:7001",
        changeOrigin: true
      }
    }
  },
  plugins: [
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
    })
  ]
};
