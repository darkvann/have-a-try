//绘制图像
function DrawRelationChat(jsonObject,buttonContainer){
    const bodyObj = document.body;
    // console.log(bodyObj);
    //创建画布
    let canvas;
    if (document.getElementById("canvas")){
        canvas = document.getElementById("canvas");
    }else {
        canvas = document.createElement("canvas");
        canvas.id = "canvas";
        canvas.style.height = (window.innerHeight || document.documentElement.clientHeight)*1.2 + "px";
        canvas.style.width = window.innerWidth || document.documentElement.clientWidth +"px";
        canvas.width = window.innerWidth || document.documentElement.clientWidth;
        canvas.height = (window.innerHeight || document.documentElement.clientHeight)*1.2;
        canvas.style.backgroundColor = "#eee";
        canvas.style.position = "absolute";
        canvas.style.zIndex = "1";
        canvas.innerText = "若浏览器不支持canvas请更换浏览器";
        // let ctx = canvas.getContext("2d");
        buttonContainer.after(canvas);
    }

    //创建类标签的容器
    var chatContainer;
    if (document.getElementById("chatContainer")){
        chatContainer = document.getElementById("chatContainer");
    }else {
        chatContainer = document.createElement("div");
        chatContainer.id = "chatContainer";
        chatContainer.style.height = (window.innerHeight || document.documentElement.clientHeight)*1.2+"px";
        chatContainer.style.width = window.innerWidth || document.documentElement.clientWidth +"px";
        chatContainer.style.position = "absolute";
        chatContainer.style.overflow = "hidden";
        chatContainer.style.zIndex = "10";
        buttonContainer.after(chatContainer);
    }

    //绘制类标签
    let chatList = new Array(jsonObject.length);
    let isSet = new Array(jsonObject.length); //记录已经调整过位置的chat
    let floor = 0; //记录当前最大层数
    for (let p=0;p<chatList.length;p++){
        isSet[p] = false;   //初始化
        chatList[p] = new ClassChat(chatContainer,jsonObject[p]);
        chatList[p].Create(); //生成
        //如果有main
        if (chatList[p].IsEnterClass()){
            isSet[p] = true;
            ChatManager.UnorderedInsertChat(chatList[p],0)
            floor++;
            // console.log("find exe enter")
        }
    }
    // console.log(chatList);

    //根据所属的包上色
    //获取所有包名极其包含的类的chat对象
    let packageList = [];
    let packageContain = [];
    for (let p=0;p<chatList.length;p++){
        if (packageList.length===0){
            packageList.push(chatList[p].GetPackage());
            packageContain[0] = [chatList[p]];
        }
        let inExistence=true;
        for (let n=0;n<packageList.length;n++){
            if (packageList[n]===chatList[p].GetPackage()){
                packageContain[n].push(chatList[p]);
                inExistence = false;
                break;
            }
        }
        if (inExistence){
            packageList.push(chatList[p].GetPackage());
            packageContain[packageList.length-1] = [chatList[p]];
        }
    }
    // console.log(packageList);
    // console.log(packageContain);
    let themeColors = ChatManager.GenerateThemeColor(packageList.length);
    for (let p=0;p<packageContain.length;p++){
        for (let n=0;n<packageContain[p].length;n++){
            packageContain[p][n].ChangeMyBGColor(themeColors[p]);
        }
    }

    //把每个类的关系列出来
    let relationList = new Array(chatList.length);
    for (let p=0;p<chatList.length;p++){
        relationList[p] = [chatList[p].GetExtend(),chatList[p].GetImplements()]
    }
    // console.log(relationList);

    //把没有关系的chat放在第一层
    for (let p=0;p<relationList.length;p++){
        if (relationList[p][0] === null && relationList[p][1] === null){
            //已放置过的不再放置
            if (!isSet[p]){
                //向当前层插入chat
                isSet[p] = true;
                ChatManager.UnorderedInsertChat(chatList[p],floor);
            }
        }
    }

    //对有关系的chat进行放置
    let externalChatList = []; //外部类chat对象列表
    let reInsertList = []; //需要等相关元素放置后重新放置的chat
    for (let p=0;p<relationList.length;p++){
        if (relationList[p][0] !== null || relationList[p][1] !== null){
            if (!isSet[p]){
                //先查看相关元素是否存在于chatList，不存在于chatList的是外部类，应先创建外部类chat.外部类无序放置在最上层
                let relatedChats = [];
                if (relationList[p][0] !== null){
                    let extendExist = false;
                    for (let n=0;n<chatList.length;n++){
                        if (chatList[n].GetClassName() === relationList[p][0]){
                            relatedChats.push(chatList[n]);
                            extendExist = true;
                            break;
                        }
                    }
                    if (!extendExist){
                        let ext = new ExternalClassChat(chatContainer,relationList[p][0]);
                        externalChatList[externalChatList.length] = ext;
                        relatedChats.push(ext);
                        ext.Create();
                        ChatManager.UnorderedInsertChat(ext,0);
                    }
                }

                if (relationList[p][1] !== null){
                    let implementExist = new Array(relationList[p][1].length);
                    for (let n=0;n<relationList[p][1].length;n++){
                        implementExist[n] = false;
                        for (let m=0;m<chatList.length;m++){
                            if (chatList[m].GetClassName() === relationList[p][1][n]){
                                relatedChats.push(chatList[m]);
                                implementExist[n] = true;
                                break;
                            }
                        }
                    }
                    for (let n=0;n<implementExist.length;n++){
                        if (!implementExist[n]){
                            let ext = new ExternalClassChat(chatContainer,relationList[p][1][n]);
                            externalChatList[externalChatList.length] = ext;
                            relatedChats.push(ext);
                            ext.Create();
                            ChatManager.UnorderedInsertChat(ext,0);
                        }
                    }
                }
                //对p号chat进行放置,可能不能一次放置完,需要补放
                // console.log("related chats")
                // console.log(relatedChats);
                if (ChatManager.InsertChat(chatList[p],relatedChats) === true ){
                    isSet[p] = true;
                }else {
                    reInsertList.push([chatList[p],relatedChats]);
                }
            }
        }
    }
    // console.log(externalChatList);
    //补放置
    function reInsert(reInsertL){
        if (reInsertL.length === 0){
            return;
        }
        let redo = [];
        for (let p=0;p<reInsertL.length;p++){
            if (ChatManager.InsertChat(reInsertL[p][0],reInsertL[p][1]) === true){
                for (let n=0;n<chatList.length;n++){
                    if (chatList[n] === reInsertL[p][0]){
                        isSet[n] = true;
                    }
                }
            }else {
                redo.push([reInsertL[p][0],reInsertL[p][1]]);
                reInsert(redo);
            }
        }
    }
    reInsert(reInsertList);

    //连线
    //re bool false表示初绘用ConnectByRelation,true表示重绘用reConnect;
    function doConnect(re){
        let translate=[0,0];
        if (re){
            //获取位移属性值,所有元素的translate是一样的
            // let ts = chatList[0].chatObj.style.transform.replace(/[^0-9\-,]/g,'').split(',');
            // translate = [parseFloat(ts[0]),parseFloat(ts[1])]
            translate = chatList[0].GetTranslate();
            //清空画布
            let w = canvas.width,h=canvas.height;
            canvas.getContext("2d").clearRect(0,0,w,h);
        }

        for (let p=0;p<relationList.length;p++){
            //连继承关系
            if (relationList[p][0] !== null){
                let targetChat;
                for (let n=0;n<chatList.length;n++){
                    if (chatList[n].GetClassName() === relationList[p][0]){
                        targetChat = chatList[n];
                    }
                }
                for (let n=0;n<externalChatList.length;n++){
                    if (externalChatList[n].GetClassName() === relationList[p][0]){
                        targetChat = externalChatList[n];
                    }
                }
                if (!re) chatList[p].ConnectByRelation(targetChat,"继承");
                else chatList[p].ReConnect(targetChat,"继承",translate);
            }
            //连实现关系
            if (relationList[p][1] !== null){
                for (let n=0;n<relationList[p][1].length;n++){
                    let targetChat;
                    for (let m=0;m<chatList.length;m++){
                        if (chatList[m].GetClassName() === relationList[p][1][n]){
                            targetChat = chatList[m];
                        }
                    }
                    for (let m=0;m<externalChatList.length;m++){
                        if (externalChatList[m].GetClassName() === relationList[p][1][n]){
                            targetChat = externalChatList[m];
                        }
                    }
                    if (!re) chatList[p].ConnectByRelation(targetChat,"实现");
                    else chatList[p].ReConnect(targetChat,"实现",translate);
                }
            }
        }

    }
    doConnect(false);

    //阻止浏览器右击事件
    document.oncontextmenu = function (){
        return false;
    }

    //在canvas/chat容器上拖拽平移整个画面
    function OnMouseMove(e){
        let dx = e.movementX;
        let dy = e.movementY;
        //向右1
        if (dx===1&&dy===0){
            //移动chat
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToXPositive();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToXPositive();
            }
            //移动canvas内容
            ctx.translate(5,0);
        }
        //向下1
        if (dx===0&&dy===1){
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToYPositive();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToYPositive();
            }
            ctx.translate(0,5);
        }
        //向左1
        if (dx===-1&&dy===0){
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToXNegative();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToXNegative();
            }
            ctx.translate(-5,0);
        }
        //向上1
        if (dx===0&&dy===-1){
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToYNegative();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToYNegative();
            }
            ctx.translate(0,-5);
        }
        //左上1
        if (dx===-1&&dy===-1){
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToLB();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToLB();
            }
            ctx.translate(-5,-5);
        }
        //右上1
        if (dx===1&&dy===-1){
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToRB();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToRB();
            }
            ctx.translate(5,-5);
        }
        //右下1
        if (dx===1&&dy===1){
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToRF();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToRF();
            }
            ctx.translate(5,5);
        }
        //左下1
        if (dx===-1&&dy===1){
            for (let p=0;p<chatList.length;p++){
                chatList[p].MoveToLF();
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].MoveToLF();
            }
            ctx.translate(-5,5);
        }

    }

    //二号方案
    function OnMouseMove2(e){
        let dx = e.movementX;
        let dy = e.movementY;
        for (let p=0;p<chatList.length;p++){
            chatList[p].Translate(dx,dy);
        }
        for (let p=0;p<externalChatList.length;p++){
            externalChatList[p].Translate(dx,dy);
        }
        doConnect(true);
        // document.getElementById("canvas").getContext("2d").translate(dx,dy);
    }

    chatContainer.onmousedown = function (ev){
        if (ev.button === 0){
            chatContainer.addEventListener("mousemove",OnMouseMove2 );
        }
    }
    chatContainer.onmouseup = function (ev){
        if(ev.button === 0){
            chatContainer.removeEventListener("mousemove", OnMouseMove2);
        }
    }

    //绘制图例
    let chosePack=null;
    function drawLegend(){
        let legend = document.createElement("div");
        legend.className = "legend";
        let head = document.createElement("div");
        head.className = "legend-head";
        head.innerText = "点击导航标签可着重标记对应包内的类的类图，并将视图拉至附近，同一个包中的类图颜色相同"
        legend.appendChild(head);
        let packageNavigators = [];
        for (let p=0;p<packageList.length;p++){
            let navigator = document.createElement("div");
            navigator.className = "navigator";
            navigator.innerText = packageList[p];
            navigator.onclick = function (ev){
                if (this.className.search("navigator-chose")!==-1){
                    this.className = "navigator";
                    //把被关注对象取消状态
                    if (chosePack!=null){
                        let flag;
                        for (let m=0;m<packageList.length;m++){
                            if (packageList[m] === chosePack.innerText)flag=m;
                        }
                        for (let n=0;n<packageContain[flag].length;n++){
                            packageContain[flag][n].NotFocus();
                        }
                    }

                    chosePack = null;
                }else {
                    this.className = "navigator navigator-chose";
                    if (chosePack != null){
                        chosePack.className = "navigator";
                        //把旧的被关注对象取消状态
                        let flag;
                        for (let m=0;m<packageList.length;m++){
                            if (packageList[m] === chosePack.innerText)flag=m;
                        }
                        for (let n=0;n<packageContain[flag].length;n++){
                            packageContain[flag][n].NotFocus();
                        }
                    }
                    chosePack = this;
                    //让包所包含的chat变成“被关注”状态
                    let flag;
                    for (let m=0;m<packageList.length;m++){
                        if (packageList[m] === chosePack.innerText)flag=m;
                    }
                    for (let n=0;n<packageContain[flag].length;n++){
                        packageContain[flag][n].BeFocus();
                    }
                    //把一个相关者移到中间
                    let middle = [(window.innerWidth || document.documentElement.clientWidth)/2,(window.innerHeight || document.documentElement.clientHeight)/2];
                    let target = [packageContain[flag][0].GetPosition()[0]+packageContain[flag][0].GetTranslate()[0],packageContain[flag][0].GetPosition()[1]+packageContain[flag][0].GetTranslate()[1]];
                    let d = {};
                    d.movementX = middle[0]-target[0];
                    d.movementY = middle[1]-target[1];
                    OnMouseMove2(d);
                }
            }
            legend.appendChild(navigator);
            packageNavigators.push(navigator);
        }
        chatContainer.appendChild(legend);
    }
    drawLegend()

    //添加防遮挡观察模式:按ctrl切换
    window.onkeydown = function (ev){
        if (ev.ctrlKey){
            for (let p=0;p<chatList.length;p++){
                chatList[p].AppendCssClass("anti-blocking");
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].AppendCssClass("anti-blocking");
            }
        }
    }
    window.onkeyup = function (ev){
        if (!ev.ctrlKey){
            for (let p=0;p<chatList.length;p++){
                chatList[p].RemoveCssClass("anti-blocking");
            }
            for (let p=0;p<externalChatList.length;p++){
                externalChatList[p].RemoveCssClass("anti-blocking");
            }
        }
    }


}
