// 注意：每次调用 $.get() 或 $.post() 或 $.ajax() 的时候，
// 会先调用 ajaxPrefilter 这个函数
// 该函数中，可以拿到自己提供给Ajax提供的配置对象
// 根路径
var rootPath = "http://www.liulongbin.top:3007";
$.ajaxPrefilter(function (options) {
  options.url = rootPath + options.url;
  console.log(options.url);
});
