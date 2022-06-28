$(function () {
  // 导入layer form laypage
  var layer = layui.layer;
  var form = layui.form;
  var laypage = layui.laypage;

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
        // console.log(res);

        // 使用模板引擎渲染页面的数据
        var htmlStr = template("tpl-table", res);
        $("tbody").html(htmlStr);
        // 调用渲染分页的方法
        renderPage(res.total);
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

  // 定义渲染分页的方法
  function renderPage(total) {
    laypage.render({
      elem: "pageBox", // 分页容器的id
      count: total, // 总数据条数
      limit: query.pagesize, // 每页显示的数据条数
      curr: query.pagenum, // 设置默认被选中的页面
      layout: ["count", "limit", "prev", "page", "next", "skip"],
      limits: [2, 3, 5, 10],

      // 出发 jump 的方法有两种
      // 1 点击页码的时候
      // 2 只要调用了 laypage.render就会触发 jump 方法
      // 可以通过 first 的值 判断是通过哪种方式触发的jump回调
      // first 为true，第二种；为 undefined，第一种
      jump: function (obj, first) {
        //obj包含了当前分页的所有参数，比如：
        query.pagenum = obj.curr;
        // 将最新的条目数，赋值到 query 查询参数对象的 pagesize 属性中
        query.pagesize = obj.limit;
        //首次不执行
        if (!first) {
          // 根据最新的数据页码渲染文章列表
          initTable();
        }
      },
    });
  }

  // 通过代理的方式为删除按钮绑定点击事件处理函数
  $("tbody").on("click", ".btn-delete", function () {
    // 获取删除按钮的个数
    var len = $(".btn-delete").length;
    console.log(len);
    // 获取到文章的id
    var id = $(this).attr("data-id");
    // 询问用户是否删除数据
    layer.confirm("确认删除？", { icon: 3, title: "提示" }, function (index) {
      $.ajax({
        method: "get",
        url: "/my/article/delete/" + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg("删除文章失败！");
          }
          layer.msg("删除文章成功！");
          // 当数据删除完成后需判断当前页是否还有剩余数据
          // 若没有剩余数据，将页码值减一，再重新调用 initTable 函数
          if (len === 1) {
            // 如果len的值为1，证明删除完毕后没有任何数据了
            // 页码值最小必须是 1
            query.pagenum = query.pagenum === 1 ? 1 : query.pagenum - 1;
          }
          initTable();
          layer.close(index);
        },
      });
    });
  });

  // 通过代理的方式为编辑按钮绑定点击事件处理函数
  $("tbody").on("click", ".btn-edit", function () {
    var id = $(this).attr("data-id");

    // 1.根据 Id 获取到文章详情
    // 2.将数据存到本地
    // 3.跳转到发布页面
    $.ajax({
      method: "get",
      url: "/my/article/" + id,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("获取文章信息失败！");
        }
        localStorage.setItem("data", JSON.stringify(res.data));
        // 获取成功后 跳转到发布页面
        location.href = "/article/art_pub.html";
        // 表单赋值
        // var data = res.data;
        // form.val("form-pub", {
        //   title: data.title,
        //   cate_id: data.cate_id,
        //   content: data.content,
        // });

        // 更新文章信息
      },
    });
  });
});
