$(function () {
  // 调用 getUserInfo 获取用户基本信息
  getUserInfo();

  // 导出layer
  var layer = layui.layer;

  // 点击按钮实现退出功能
  $("#btnLogout").on("click", function () {
    // 提示用户是否退出
    layer.confirm(
      "确定退出登录？",
      { icon: 3, title: "提示" },
      function (index) {
        //do something
        console.log("ok");
        // 清空本地的 token
        localStorage.removeItem("token");
        // 重新跳转到登陆页面
        location.href = "/login.html";
        // 关闭 confirm 询问框
        layer.close(index);
      }
    );
  });
});

// 获取用户的基本信息
function getUserInfo() {
  $.ajax({
    url: "/my/userinfo",
    method: "get",
    // headers 就是请求头配置对象
    // headers: {
    //   Authorization: localStorage.getItem("token") || "",
    // },
    success: function (res) {
      // 请求失败
      if (res.status !== 0) {
        return layui.layer.msg("获取用户信息失败");
      }
      // 请求成功
      // 调用renderAvatar 渲染用户的头像
      renderAvater(res.data);
    },
    // 不论成功还是失败，都会调用 complete 回调函数
    // complete: function (res) {
    //   console.log("执行了complete函数");
    //   console.log(res);
    //   // 在 complete 回调函数中，可以使用 res.responseJSON 拿到服务器响应回来的数据
    //   if (
    //     res.responseJSON.status === 1 &&
    //     res.responseJSON.message == "身份认证失败！"
    //   ) {
    //     // 强制清空 token
    //     localStorage.removeItem("token");
    //     // 强制跳转到登陆页面
    //     location.href = "/login.html";
    //   }
    // },
  });
}

// 定义渲染头像函数
function renderAvater(user) {
  // 获取用户的名称
  var name = user.nickname || user.username;
  // 设置用户的名称
  $("#welcome").html("欢迎&nbsp;&nbsp;" + name);
  // 按需渲染用户的头像
  if (user.user_pic !== null) {
    // 渲染图片头像
    $(".layui-nav-img").attr("src", user.user_pic).show();
    $(".text-avatar").hide();
  } else {
    // 渲染文本头像
    $(".layui-nav-img").hide();
    var first = name[0].toUpperCase();
    $(".text-avatar").html(first).show();
  }
}
