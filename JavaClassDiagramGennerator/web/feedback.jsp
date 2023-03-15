<%--
  Created by IntelliJ IDEA.
  User: 86186
  Date: 2023/2/20
  Time: 20:09
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" pageEncoding="UTF-8" %>
<html lang="zh">
<head>
    <title>feedback</title>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    <%
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");
    %>
    <link type="text/css" rel="stylesheet" href="./chatStyles.css" >
    <script src="jquery.js"></script>
    <script src="ChatManager.js"></script>
    <script src="ExternalClassChat.js"></script>
    <script src="ClassChat.js"></script>
    <script src="drawer.js"></script>
</head>
<body>
    <%
        String message = (String) request.getAttribute("message");
        String classInfo = (String) request.getAttribute("classInfo");
        Integer mode = (int) request.getAttribute("mode");
    %>
    <script>
        var classInfo = <%=classInfo%>;
        var mode = <%=mode%>
        var dontClickTwice = false;
        console.log(classInfo);
    </script>

    <h1><%=message%></h1>
    <div id="buttonContainer" style="display: flex;flex-direction: row;width: 100vw;height: 100px;align-items: center;">
        <h2>处理结果</h2>
        <div onclick="javascript:window.location.href='<%=request.getContextPath() %>/download'" id="downloadBtn" style="border: solid black 1px;border-radius: 3px;height: 20px;margin-left: 50px;font-size: smaller;background-color: #eeeeee;cursor: pointer;user-select: none;padding-left: 3px;padding-right: 3px;">
            下载result.json文件
        </div>
        <div id="drawBtn" style="border: solid black 1px;border-radius: 3px;height: 20px;margin-left: 50px;font-size: smaller;background-color: #eeeeee;cursor: pointer;user-select: none;padding-left: 3px;padding-right: 3px;">
            绘制类关系示意图
        </div>
        <script>
            let drawBtn = document.getElementById("drawBtn");
            drawBtn.onclick = function (){
                //防止双击多次执行
                if (dontClickTwice){
                    return;
                }
                dontClickTwice = true;
                let buttonContainer = document.getElementById("buttonContainer");
                DrawRelationChat(classInfo,buttonContainer);
            }
        </script>
    </div>
    <h3><%=classInfo%></h3>

</body>
</html>
