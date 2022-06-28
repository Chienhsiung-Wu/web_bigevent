$(function () {
  // 导入layer form
  var layer = layui.layer;
  var form = layui.form;

  initCate();
  // 初始化富文本编辑器
  initEditor();

  // 定义加载文章分类的方法
  function initCate() {
    $.ajax({
      method: "get",
      url: "/my/article/cates",
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("初始化文章分类失败！");
        }

        // 调用模版引擎，渲染分类的下拉菜单
        var htmlStr = template("tpl-cate", res);
        $("[name=cate_id]").html(htmlStr);
        // 一定要调用 form.render() 方法

        form.render();
      },
    });
  }

  // 1. 初始化图片裁剪器
  var $image = $("#image");

  // 2. 裁剪选项
  var options = {
    aspectRatio: 400 / 280,
    preview: ".img-preview",
  };

  // 3. 初始化裁剪区域
  $image.cropper(options);

  // 根据本地localStorage是否有数据，判断当前为新增模式还是修改模式
  // 如果为修改模式，重新渲染表单，
  var data = JSON.parse(localStorage.getItem("data")) || null;
  console.log(data);
  if (data !== null) {
    // 先给标题 文章内容赋值
    form.val("form-pub", data);
    // 给文章类别赋值
    console.log($("[name=cate_id]"));
    console.log(data.cate_id);
    var t = $("[name=cate_id]").find("option[lay-value=" + data.cate_id + "]");
    console.log($("[name=cate_id]").find("option[lay-value='2']")[0]);
  }
  // var info = localStorage.getItem('')

  // 为选择封面的点击按钮绑定点击事件的处理函数
  $("#btnChooseImage").on("click", function () {
    $("#coverFile").click();
  });

  // 监听coverFile的change事件 获取用户选择的文件列表
  $("#coverFile").on("change", function (e) {
    // 获取到文件的列表数组
    var files = e.target.files;
    // 判断用户是否选择了文件
    if (files.length === 0) {
      return;
    }
    // 根据选择的文件，创建一个对应的 URL 地址：
    var newImgURL = URL.createObjectURL(files[0]);
    // 为裁剪区域重新设置图片
    $image
      .cropper("destroy") // 销毁旧的裁剪区域
      .attr("src", newImgURL) // 重新设置图片路径
      .cropper(options); // 重新初始化裁剪区域
  });

  // 定义文章的发布状态
  var art_state = "已发布";
  // 为存为草稿按钮绑定点击事件处理函数
  $("#btnSave2").on("click", function () {
    art_state = "草稿";
  });

  // 为表单绑定 submit 事件
  $("#form-pub").on("submit", function (e) {
    // 阻止表单默认提交事件
    e.preventDefault();
    // 基于form表单快速创建一个formData对象
    var fd = new FormData($(this)[0]);
    // 将文章的发布状态存到 fd 中
    fd.append("state", art_state);

    // 将封面裁剪过的图片，输出为一个文件对象
    $image
      .cropper("getCroppedCanvas", {
        // 创建一个 Canvas 画布
        width: 400,
        height: 280,
      })
      .toBlob(function (blob) {
        // 将 Canvas 画布上的内容，转化为文件对象
        // 得到文件对象后，进行后续的操作
        // 将文件对象存储在fd中
        fd.append("cover_img", blob);
        // 发起 ajax 请求
        publishArticle(fd);
      });
  });

  function publishArticle(fd) {
    $.ajax({
      method: "post",
      url: "/my/article/add",
      data: fd,
      // 注意：如果向服务器提交的是 FormData 格式的数据
      // 必须添加以下两个配置项
      processData: false,
      contentType: false,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("发布文章失败！");
        }
        layer.msg("发布文章成功！");
        // 发布成功 跳转到文章列表页
        location.href = "/article/art_list.html";
        // 将文章列表的样式设为选中
        var art_manage = window.parent.document.getElementById("art_manage");
        $(art_manage)
          .addClass("layui-this")
          .siblings()
          .removeClass("layui-this");
      },
    });
  }
});
