const loaderUtils = require("loader-utils");

module.exports = function(source) {
  //this.query中含有webpack.config.js中配置的option  或者从loader-utils
  return source.replace("hello", "bye");
};
