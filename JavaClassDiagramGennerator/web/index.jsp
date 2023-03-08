<%--
  Created by IntelliJ IDEA.
  User: 86186
  Date: 2023/2/19
  Time: 18:34
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
  <head>
    <title>首页</title>
    <link type="text/css" rel="stylesheet" href="ui.css" >
    <script src="https://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js"></script>
  </head>
  <body>
  <script>
    document.documentElement.style.overflow="hidden";
  </script>

  <div id="userInterface">
    <div id="QAdocument">

      <div class="question" index="1">
        <div class="question-title" >
          <div>></div>
          <b>如何使用本网站把一个java文件或文件包转化为结构图？</b>
        </div>
        <div class="question-answer">
          你需要先将想要转换的文件夹通过右侧的转换器提交（不能重名），转换器会将文件或文件夹转换为json数据包，等待程序处理完成后会将json包中的信息打印出来，此时点击“绘制类关系示意图”按钮即可绘制出类关系图；此外你也可以点击“下载result.json文件”将json包下载下来，需要用时直接在主页的右侧json包导入器中导入result.json即可。<br/>·注意：只对java18及兼容的java版本有效
        </div>
      </div>

      <div class="question" index="2">
        <div class="question-title" >
          <div>></div>
          <b>打印的结果是[]?</b>
        </div>
        <div class="question-answer">
          当你上传了一系列.class文件但他们的版本对应更早版本的java就会导致这个现象，只有能在java18环境下载入的类才可以被解析。
        </div>
      </div>

      <div class="question" index="3">
        <div class="question-title" >
          <div>></div>
          <b>绘制完成后如何查看?</b>
        </div>
        <div class="question-answer">
          <br/>·按住左键拖拽可以平移画面<br/>·按住ctrl可以使类图半透明，可以更清晰地看到被遮挡的关系连线<br/>·点击“构造器>”或“方法>”可以显示隐藏的内容，隐藏这些是为了让类图更紧凑
        </div>
      </div>

      <div class="question" index="4">
        <div class="question-title" >
          <div>></div>
          <b>服务器生成的result.json文件有什么用？</b>
        </div>
        <div class="question-answer">
          如果你需要对同一个文件再次生成API关系图、或在另一个设备上再次展现你的API关系图同时希望消耗最少的存储空间，保存并使用result.json可以帮你省去分析文件所消耗的时间（这个时间通常占大头），但是由于此功能设定为无需网络的，收到浏览器安全规则限制，必须配置本地虚拟服务器使用或者将本网站下载到本地然后将result.json放在资源文件中，这样它才能被调用。
        </div>
      </div>

      <div class="question" index="5">
        <div class="question-title" >
          <div>></div>
          <b>可能出现的bug和解决办法：</b>
        </div>
        <div class="question-answer">
          <br/>·在类图上拖拽后松开鼠标左键图像仍在平移？你可能在拖拽时将鼠标移动出了画布范围再释放鼠标左键，这会使之丢失捕捉目标，在画布内左键点击一下就可以恢复。<br/>·上传文件后跳转到报错页面？可能是上传的文件中的java语法有错误或文件中所需java版本过低/高无法被编译，也可能是上传的文件中有重复的文件，需要注意的是x.java与x.class也是重复文件，因为服务器会将所有.java文件编译成.class文件。
        </div>
      </div>

    </div>

    <div id="originalFileInputer">
      <form action="<%=request.getContextPath() %>/test" method="post" enctype="multipart/form-data">
        <div>选择文件夹</div>
        <input type="file" webkitdirectory="true" id="fileInputer" name="single">
        <div>选择文件（支持多个）</div>
        <input type="file" multiple="true" id="fileInputer2" name="multi">
        <input id="submitBtn1" type="submit" value="上传">
      </form>

      <div>
        <div>导入result.json(暂未实现)</div>
        <input type="file"  id="fileInputer3">
      </div>
      <script>
        let jsonInputer = document.getElementById("fileInputer3");
        jsonInputer.onchange = function (e){
          console.log(jsonInputer.value);
          $.ajax({
            url:jsonInputer.value,
            type:"GET",
            dataType:"json",
            success:function (data){
              console.log(data);
            }
          })

        }
      </script>
    </div>


  </div>



  </body>
</html>
