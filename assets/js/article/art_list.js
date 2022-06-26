$(function () {
  // 导入layer form
  var layer = layui.layer;
  var form = layui.form;

  // 定义美化时间的过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date);

    var y = padZero(dt.getFullYear());
    var m = padZero(dt.getMonth() + 1);
    var d = padZero(dt.getDate());

    var hh = padZero(dt.getHours());
    var mm = padZero(dt.getMinutes());
    var ss = padZero(dt.getSeconds());

    return y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;
  };

  // 定义补零函数
  function padZero(n) {
    return n > 9 ? n : "0" + n;
  }

  // 定义一个查询的参数对象，将来请求数据的时候，
  // 需要将请求参数对象提交到服务器
  var query = {
    pagenum: 1, // 默认请求第一页的数据
    pagesize: 2, // 默认每页显示两条数据
    cate_id: "", // 文章分类的Id
    state: "", // 文章的发布状态 草稿 | 已发布
  };

  var data = {
    status: 0,
    message: "获取文章列表成功！",
    data: [
      {
        Id: 1,
        title: "abab",
        pub_date: "2020-01-03 12:19:57.690",
        state: "已发布",
        cate_name: "最新",
      },
      {
        Id: 2,
        title: "666",
        pub_date: "2020-01-03 12:20:19.817",
        state: "已发布",
        cate_name: "股市",
      },
    ],
    total: 5,
  };

  initTable();
  initCate();

  // 获取文章列表数据的方法
  function initTable() {
    $.ajax({
      method: "get",
      url: "/my/article/list",
      data: query,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("获取文章列表失败");
        }
        console.log(res);

        // 使用模板引擎渲染页面的数据
        var htmlStr = template("tpl-table", res);
        $("tbody").html(htmlStr);
      },
    });
  }

  // 初始化文章分类的方法
  function initCate() {
    $.ajax({
      method: "get",
      url: "/my/article/cates",
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("获取分类数据失败！");
        }

        // 获取数据成功
        // 调用模板引擎渲染分类的可选项
        var htmlStr = template("tpl-cate", res);
        $("[name=cate_id]").html(htmlStr);
        // 通过layui 重新渲染表单区域的UI结构
        form.render();
      },
    });
  }

  // 为筛选表单绑定 submit 事件
  $("#form-search").on("submit", function (e) {
    e.preventDefault();
    console.log("ok");
    // 获取表单中选中项的值
    var cate_id = $("[name=cate_id]").val();
    var state = $("[name=state]").val();
    // 为查询参数对象 query 中对应的属性赋值
    query.cate_id = cate_id;
    query.state = state;
    console.log(query);
    // 根据最新的筛选条件，重新渲染数据
    initTable();
  });
});
