const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

/**
 * 对每个模块的代码进行分析，使用babel插件分析
 * @babel/parser 解析代码生成ast
 * @babel/traverse 借助生成的ast进行转换, 得到依赖关系
 * @babel/preset-env 对代码进行解析
 */
const moduleAnalyser = filename => {
  const content = fs.readFileSync(filename, "utf-8");
  //这样打印出来的就是AST 抽象语法树
  const ast = parser.parse(content, {
    sourceType: "module"
  });
  console.log("ast", ast);
  console.log("ast.program.body", ast.program.body);
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      console.log("node", node);
      const dirname = path.dirname(filename);
      const newFile = "./" + path.join(dirname, node.source.value);
      dependencies[node.source.value] = newFile;
    }
  });
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
  });
  const moduleAnalyserRes = {
    filename,
    dependencies,
    code
  };
  console.log("moduleAnalyserRes :", moduleAnalyserRes);
  return moduleAnalyserRes;
};

/**
 * 生成依赖图谱
 * 使用的算法类似队列+递归
 * 对每个模块进行分析，模块中若包含模块，即加入graphArray队列中再循环
 * 最后把gtaphArray结构整理好放进graph对象中
 */

const makeDependenciesGraph = entry => {
  const entryModule = moduleAnalyser(entry);
  console.log("entryModule :", entryModule);
  const graphArray = [entryModule];
  for (let i = 0; i < graphArray.length; i++) {
    const item = graphArray[i];
    const { dependencies } = item;
    if (dependencies) {
      for (let j in dependencies) {
        graphArray.push(moduleAnalyser(dependencies[j]));
      }
    }
  }
  console.log("graphArray", graphArray);
  //下面把graphArray数据结构转化为graph对象
  const graph = {};
  graphArray.forEach(item => {
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code
    };
  });
  console.log("graph", graph);
  return graph;
};

/**
 * 生成代码
 * 先讲graph代码形成字符串，
 * 字符串中要处理reqire, export
 */

const generateCode = entry => {
  const graph = JSON.stringify(makeDependenciesGraph(entry));
  return `
        (function(graph){
            function require(module){
                function localRequire(relativePath){
                    return require(graph[module].dependencies[relativePath])
                }
                var exports = {};
                (function(require,exports,code){
                    eval(code);
                })(localRequire,exports,graph[module].code);
                return exports;
            }
            require('${entry}')
        })(${graph})
    `;
};

const code = generateCode("./src/index.js");
console.log("code", code);
