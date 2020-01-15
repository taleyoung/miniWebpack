const loaderUtils = require("loader-utils");

module.exports = function(source) {
  //this.query中含有webpack.config.js中配置的option  或者从loader-utils
  const options = loaderUtils.getOptions(this);
  const callback = this.async();
  setTimeout(() => {
    const result = source.replace("hello", "bye");
    callback(null, result);
  }, 1000);
  //   return source.replace("hello", "bye");
};
