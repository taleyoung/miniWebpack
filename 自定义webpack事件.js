//1. 引入tapaable，获得你想要的hook
const { SyncHook } = require("tapable");
//2. 实例化你拿到的hook， 然后挂载到compiler上
compiler.hooks.myHook = new SyncHook(["data"]);
//3. 在你需要监听的事件的位置tap监听
compiler.hooks.myHook.tap("Listen4Myplugin", data => {
  console.log("@Listen4Myplugin", data);
});

//4.在你所需要广播时间的时间执行call方法并传入data
compiler.hooks.environment.tap(pluginName, () => {
  //广播自定义事件
  compiler.hooks.myHook.call("It's my plugin.");
});
