class CopyrightWebpackPlugin {
  constructor(options) {
    //webpack.config.js中定义的参数将会传到这里的option中
    console.log("使用插件");
    console.log("options :", options);
  }
  apply(compiler) {
    //compiler.hooks 中定义了打包过程中中的很多时刻

    compiler.hooks.compile.tap("CopyrightWebpackPlugin", compilation => {
      console.log("compile");
    });
    //emit是个异步的时刻 所以函数有cb参数，且需要调用一下
    compiler.hooks.emit.tapAsync(
      "CopyrightWebpackPlugin",
      (compilation, cb) => {
        console.log(compilation.assets);
        debugger;
        compilation.assets["copyright.txt"] = {
          source: function() {
            return "copyright by ty";
          },
          size: function() {
            return 21;
          }
        };
        cb();
      }
    );
  }
}
module.exports = CopyrightWebpackPlugin;
