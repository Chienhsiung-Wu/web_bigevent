$(function () {
  // 导入layer 弹出组件
  var layer = layui.layer;
  // 导入form
  var form = layui.form;
  initArtCateList();

  // 获取文章分类的列表
  function initArtCateList() {
    $.ajax({
      method: "get",
      url: "/my/article/cates",
      success: function (res) {
        console.log(res);
        var htmlStr = template("tpl-table", res);
        $("tbody").html(htmlStr);
      },
    });
  }

  // 未"添加类别"按钮绑定点击事件
  var indexAdd = null;
  $("#btnAddCate").on("click", function () {
    indexAdd = layer.open({
      type: 1,
      area: ["500px", "300px"],
      title: "添加文章分类",
      content: $("#dialog-add").html(),
    });
  });

  // 通过代理的形式，为 form-add 表单绑定submit事件
  $("body").on("submit", "#form-add", function (e) {
    e.preventDefault();
    // console.log("ok");
    $.ajax({
      method: "post",
      url: "/my/article/addcates",
      data: $(this).serialize(),
      headers: localStorage.getItem("token"),
      success: function (res) {
        console.log(res);
        if (res.status !== 0) {
          return layer.msg("新增分类失败！");
        }
        layer.msg("新增分类成功！");
        initArtCateList();
        layer.close(indexAdd);
      },
    });
  });

  // 通过代理的形式，为 btn-edit 按钮绑定点击事件
  var indexEdit = null;
  $("tbody").on("click", ".btn-edit", function (e) {
    // 弹出一个修改文章分类的层
    indexEdit = layer.open({
      type: 1,
      area: ["500px", "300px"],
      title: "修改文章分类",
      content: $("#dialog-edit").html(),
    });

    var id = $(this).attr("data-Id");
    console.log(id);

    // 发起请求获取分类的数据
    $.ajax({
      method: "get",
      url: "/my/article/cates/" + id,
      success: function (res) {
        form.val("form-edit", res.data);
      },
    });
  });

  // 事件委托，为修改分类的表单绑定 submit 事件
  $("body").on("submit", "#form-edit", function (e) {
    e.preventDefault();
    $.ajax({
      method: "post",
      url: "/my/article/updatecate",
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("更新分类数据失败！");
        }
        layer.msg("更新分类数据成功！");
        layer.close(indexEdit);
        initArtCateList();
      },
    });
  });

  // 事件委托 为删除按钮绑定点击事件
  $("tbody").on("click", ".btn-delete", function (e) {
    // 获取要删除文章类型的id
    var id = $(this).attr("data-Id");
    // 询问是否删除
    layer.confirm("确认删除？", { icon: 3, title: "提示" }, function (index) {
      $.ajax({
        method: "get",
        url: "/my/article/deletecate/" + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg("删除分类失败！");
          }

          layer.msg("删除分类成功");
          initArtCateList();
          layer.close(index);
        },
      });
    });
  });
});
