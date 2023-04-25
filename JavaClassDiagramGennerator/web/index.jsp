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
      <script src="jquery.js"></script>
      <link type="text/css" rel="stylesheet" href="./chatStyles.css" >
      <script src="ChatManager.js"></script>
      <script src="ExternalClassChat.js"></script>
      <script src="ClassChat.js"></script>
      <script src="drawer.js"></script>
      <script src="myJavaParser/MyJavaParser.js"></script>
      <script src="myJavaParser/CompilationUnit.js"></script>
      <script src="myJavaParser/EnumModifier.js"></script>
      <script src="myJavaParser/PackageContainer.js"></script>
      <script src="myJavaParser/ReferenceContainer.js"></script>
      <script src="myJavaParser/ClassOrInterfaceContainer.js"></script>
      <script src="myJavaParser/Tools.js"></script>
      <script src="myJavaParser/ConstructorContainer.js"></script>
      <script src="myJavaParser/FunctionContainer.js"></script>
      <script src="myJavaParser/VariableContainer.js"></script>
      <script src="myJavaParser/InterfaceFunctionContainer.js"></script>
      <script src="analyzer.js"></script>

  </head>
  <body>
  <script>
    // document.documentElement.style.overflow="hidden";
  </script>

  <div id="userInterface">
    <div id="QAdocument">

      <div class="question" index="1">
        <div class="question-title" >
          <div>></div>
          <b>如何使用本网站把一个java文件或文件包转化为结构图？</b>
        </div>
        <div class="question-answer">
          你需要先将想要转换的文件夹通过右侧的转换器提交（不能重名），转换器会将文件或文件夹转换为json数据包，等待程序处理完成后会将json包中的信息打印出来，此时点击“绘制类关系示意图”按钮即可绘制出类关系图；此外你也可以点击“下载result.json文件”将json包下载下来，需要用时直接在主页的右侧json包导入器中导入result.json即可。
        </div>
      </div>

      <div class="question" index="2">
        <div class="question-title" >
          <div>></div>
          <b>几种实现方式有什么区别?</b>
        </div>
        <div class="question-answer">
          <br/>·快速方式： （其实并不快）大多数情况下它产生的result.json包较小，生成的类图只提供基础的关系查看功能。 ·注意：只对java18及兼容的java版本有效<br/>·完整方式： （推荐使用）生成的result.json包通常比项目本身的字节数还要多，绘制的类图可以双击查看类的构造器、方法、内部类的详细代码。<br/>·本地方式： 不能单独使用，必须下载并传入前两种方式生成的result.json才能使用，包来自哪个实现入口绘制的类图就具有它的功能。
        </div>
      </div>

      <div class="question" index="4">
        <div class="question-title" >
          <div>></div>
          <b>绘制完成后如何查看?</b>
        </div>
        <div class="question-answer">
          <br/>·按住左键拖拽可以平移画面<br/>·按住ctrl可以使类图半透明，可以更清晰地看到被遮挡的关系连线<br/>·点击“构造器>”或“方法>”可以显示隐藏的内容，隐藏这些是为了让类图更紧凑<br/>·点击左侧包导航栏中的标签可以跳转到对应包下的某个类的类图，并着重标记每个处于同一包下的类<br/>·如果你使用的是完整方式，那么你可以双击类图显示其完整的类信息，包括方法体、内部类等。
        </div>
      </div>

      <div class="question" index="3">
        <div class="question-title" >
          <div>></div>
          <b>打印的结果是[]?</b>
        </div>
        <div class="question-answer">
          当你通过快速方式入口上传了一系列.class文件但他们的版本对应更早版本的java就会导致这个现象，只有能在java18环境下载入的类才可以被解析。这是因为快速方式采用反射机制实现，不能被加载的类自然就无法获取反射。
        </div>
      </div>

      <div class="question" index="5">
        <div class="question-title" >
          <div>></div>
          <b>服务器生成的result.json文件有什么用？</b>
        </div>
        <div class="question-answer">
          如果你需要对同一个文件再次生成API关系图、或在另一个设备上再次展现你的API关系图同时希望消耗最少的存储空间，保存并使用result.json可以帮你省去分析文件所消耗的时间（这个时间通常占大头），此功能无需网络。
        </div>
      </div>

      <div class="question" index="6" id="chatInsertP">
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
        <label>快速方式（不获取代码体）</label>
        <div>选择文件夹</div>
        <input type="file" webkitdirectory="true" id="fileInputer" name="single">
        <div>选择文件（支持多个）</div>
        <input type="file" multiple="true" id="fileInputer2" name="multi">
        <input id="submitBtn1" type="submit" value="上传">
      </form>

      <form action="<%=request.getContextPath() %>/getBody" method="post" enctype="multipart/form-data">
        <label>完整方式（实现全部功能）</label>
        <div>选择文件夹</div>
        <input type="file" webkitdirectory="true" name="single">
        <div>选择文件</div>
        <input type="file" multiple="true" name="multi">
        <input type="submit" value="上传" style="margin-top: 10px">
      </form>

      <div id="jsonLoader">
        <label>本地方式</label>
        <div>导入result.json</div>
        <input type="file"  id="fileInputer3">
      </div>

      <div>
        <label>本地js解析</label>
        <div>选择文件夹</div>
        <input type="file" webkitdirectory="true" name="single" id="jsParser1" >
        <div>选择文件</div>
        <input type="file" multiple="true" id="jsParser2">
      </div>

      <script>
        //中间文件解析
        let jsonInputer = document.getElementById("fileInputer3");
        jsonInputer.onchange = function (e){
          let inputFiles = jsonInputer.files;
          if (inputFiles[0].type !== "application/json"){
              alert("文件类型错误，请确保传入的是本站生成的result.json文件");
          }else {
              let reader = new FileReader();
              reader.onload = function (){
                  let data;
                  if (this.result.length!==0) data = JSON.parse(this.result);
                  let a = document.getElementById("chatInsertP");
                  DrawRelationChat(data,a);
              }
              reader.onloadstart = function () {
                  // console.log("started")
              }
              reader.onloadend = function () {
                  // console.log("end")
              }
              reader.readAsText(inputFiles[0]);
          }
        }

        // js解析java
        let jsDirectoryParser = document.getElementById("jsParser1");
        let jsFilesParser = document.getElementById("jsParser2");
        jsDirectoryParser.addEventListener("change",javaParserByJS);
        jsFilesParser.addEventListener("change",javaParserByJS);
        function javaParserByJS(e){
          let inputFiles = this.files;
          let legalFiles = new Array(); //java源文件数组
          let ilegalFiles = new Array(); //非java文件

          // 进行分拣，把非java文件排除并提示用户
          for (item in inputFiles) {
            if (inputFiles[item].name && inputFiles[item].name != "item") {
              let x = inputFiles[item].name.split(".");
              if (x[x.length - 1] == "java") {
                legalFiles[legalFiles.length] = inputFiles[item];
              } else {
                ilegalFiles[ilegalFiles.length] = inputFiles[item];
              }
            }
          }

          //输出提示信息，提示用户应该传入.java结尾的文件
          for (y in ilegalFiles) {
            console.log("文件" + ilegalFiles[y].name + '不是java文件')
          }
          // console.log(legalFiles)

          if (legalFiles.length>0){
              let compilationUnitList = [];
              for (let i in legalFiles){
                  readFile(legalFiles[i]).then(function (result){
                    compilationUnitList.push(result);
                    if (compilationUnitList.length === legalFiles.length){
                      let classInfo = analyzer(compilationUnitList);
                      //跳转到新页面去绘制图像
                      window.sessionStorage.setItem("data",JSON.stringify(classInfo) );
                      window.location.href = "feedbackPageForEntrance4.jsp";
                    }
                  })

                  function readFile(file){
                    return  new Promise((resolve,reject)=>{
                      let reader = new FileReader();
                      reader.readAsText(file);
                      reader.onload = function (){
                          let compilationUnit = MyJavaParser.parser(this.result);
                          resolve(compilationUnit);
                      }
                    })
                  }
             }
          }

        }
      </script>

    </div>


  </div>



  </body>
</html>
