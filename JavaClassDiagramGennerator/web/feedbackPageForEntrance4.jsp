<%--
  Created by IntelliJ IDEA.
  User: 86186
  Date: 2023/4/21
  Time: 13:16
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <title>入口四结果</title>
    <link type="text/css" rel="stylesheet" href="./chatStyles.css" >
    <script src="ChatManager.js"></script>
    <script src="ExternalClassChat.js"></script>
    <script src="ClassChat.js"></script>
    <script src="drawer.js"></script>
</head>
<body>
    <label id="insertP" style="width: 0;height: 0;"></label>
    <script>
        let data = JSON.parse(window.sessionStorage.getItem("data"));
        console.log(data)
        let a = document.getElementById("insertP");
        DrawRelationChat(data,a);
    </script>
</body>
</html>
