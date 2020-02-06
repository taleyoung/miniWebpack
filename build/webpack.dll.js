const path = require("path");
module.exports = {
  mode: "production",
  entry: {
    vendors: ["react", "react-dom"]
  },
  output: {
    filename: "[name].dll.js",
    path: path.resolve(__dirname, "../dll"),
    //打包成库的形式，以全局变量暴露出去
    library: "[name]"
  }
};
