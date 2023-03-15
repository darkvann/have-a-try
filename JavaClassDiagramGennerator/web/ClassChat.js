//生成类标签函数
class ClassChat{
    WIDTH = "auto";
    HEIGHT = "auto";
    BG_COLOR = "rgb(119 135 209)";
    BORDER_RADIUS = "5px";
    POSITION = "absolute";
    LEFT = "100px";
    TOP = "200px";
    Z = "11";
    moveSpeed = 5;
    translatedDistanceX = 0;
    translatedDistanceY = 0;
    constrIsFocus = false;
    methodIsFocus = false;
    constructor(container,unitInfo) {
        this.unitInfo = unitInfo;
        this.container = container;
        //后端传递的信息中数组用[L在类型前表示（如[Ljava.lang.String;），需要转化一下
        for (let n = 0;n<this.unitInfo.methods.length;n++){
            for (let m=0;m<this.unitInfo.methods[n].params.length;m++){
                if (this.unitInfo.methods[n].params[m].substring(0,2)==="[L"){
                    this.unitInfo.methods[n].params[m] = this.unitInfo.methods[n].params[m].substring(2,this.unitInfo.methods[n].params[m].length-1)+"[]";
                }
            }
        }
    }

    //创建HTML元素
    Create(){
        //设置默认样式
        let chat = document.createElement("div");
        chat.id = this.unitInfo.className.substring(this.unitInfo.className.lastIndexOf(".")+1);
        chat.style.width = this.WIDTH;
        chat.style.height = this.HEIGHT;
        chat.style.backgroundColor = this.BG_COLOR;
        chat.style.borderRadius = this.BORDER_RADIUS;
        chat.style.position = this.POSITION;
        chat.style.left = this.LEFT;
        chat.style.top = this.TOP;
        chat.setAttribute("class","classChat");
        //双击显示详细的类代码块
        let that = this;
        chat.ondblclick = function (){
            if (document.title === "首页"){
                alert("当前方式不支持查看全部代码");
                return ;
            }
            if (that.unitInfo.methods.length>0){
                if (that.unitInfo.methods[0].methodBody === undefined)
                    alert("当前方式不支持查看全部代码");
            }
            if (that.unitInfo.constructors.length>0){
                if (that.unitInfo.constructors[0].body === undefined)
                    alert("当前方式不支持查看全部代码");
            }
            //
            if(document.getElementById("detailedClassDiagram")){
                let detailedClassChat = document.getElementById("detailedClassDiagram")
                if (detailedClassChat.className.search("hidden")!==-1){
                    detailedClassChat.className = detailedClassChat.className.split(" hidden").join("")+" visible";
                }
                //替换原内容

            }else {
                let detailedClassChat = document.createElement("div");
                detailedClassChat.id = "detailedClassDiagram";
                detailedClassChat.className = "detailedClassDiagram";
                detailedClassChat.onmouseenter = function (){
                    let body = document.getElementsByTagName("body")[0];
                    body.className = "disable-scrollbar";
                }
                detailedClassChat.onmouseleave = function (){
                    let body = document.getElementsByTagName("body")[0];
                    body.className = "";
                }
                //头
                let head = document.createElement("div");
                head.id = "detailedClassDiagramHead";
                let title = document.createElement("div");
                title.id = "detailedClassDiagramTitle";
                title.innerText = that.unitInfo.className;
                head.appendChild(title);
                let hideBtn = document.createElement("div");
                hideBtn.className = "hideBtn";
                hideBtn.innerText = "x";
                hideBtn.onclick = function (){
                    detailedClassChat.className = detailedClassChat.className.split(" visible").join("") +" hidden";
                }
                head.appendChild(hideBtn);
                detailedClassChat.appendChild(head);
                //变量
                let codeLineIndex = 0;
                if (that.unitInfo.field!=={}){
                    let vInfo = that.unitInfo.field.variables;
                    let variables = document.createElement("div");
                    variables.id = "variables";
                    for (let p=0;p<vInfo.length;p++){
                        codeLineIndex++;
                        let oneLine =vInfo[p];
                        let codeLine = document.createElement("div");
                        let index = document.createElement("div");
                        index.className = "codeLineIndex";
                        index.innerText = codeLineIndex+"";
                        codeLine.appendChild(index);
                        let codeText = document.createElement("div");
                        codeText.className = "codeLineText";
                        codeText.innerText = oneLine;
                        codeLine.appendChild(codeText);
                        codeLine.className = "codeLine";
                        variables.appendChild(codeLine);
                    }
                    detailedClassChat.appendChild(variables);
                }
                //构造方法
                let constrLabel = document.createElement("div");
                constrLabel.className = "labelBar";
                constrLabel.innerText = "构造函数("+that.unitInfo.constructors.length+")";
                detailedClassChat.appendChild(constrLabel);
                let constrs = document.createElement("div");
                constrs.id = "constrs";
                constrs.className = "unfold"
                if (that.unitInfo.constructors.length>0){
                    let cInfo = that.unitInfo.constructors;
                    for (let p=0;p<cInfo.length;p++){
                        codeLineIndex++;
                        //方法头
                        let mh = document.createElement("div");
                        mh.className = "codeLine";
                        let mi = document.createElement("div");
                        mi.className = "codeLineIndex";
                        mi.innerText = codeLineIndex+"";
                        mh.appendChild(mi);
                        let mt = document.createElement("div");
                        mt.className = "codeLineText keyLine";
                        mt.innerText = cInfo[p].constrDeclaration;
                        mh.appendChild(mt);
                        constrs.appendChild(mh);
                        //方法体
                        let ls = cInfo[p].body.split("\r\n");
                        ls.forEach(l=>{
                            codeLineIndex++;
                            let codeLine = document.createElement("div");
                            let index = document.createElement("div");
                            index.className = "codeLineIndex";
                            index.innerText = codeLineIndex+"";
                            codeLine.appendChild(index);
                            let codeText = document.createElement("div");
                            codeText.className = "codeLineText";
                            codeText.innerText = l;
                            codeLine.appendChild(codeText);
                            codeLine.className = "codeLine";
                            constrs.appendChild(codeLine);
                        })
                    }
                }
                let foldBarOfConstr = document.createElement("div");
                foldBarOfConstr.className = "labelBar";
                foldBarOfConstr.innerText = "收起";
                // foldBarOfConstr.style.borderTop = "solid #666666 1px";
                foldBarOfConstr.style.marginBottom = "10px";
                foldBarOfConstr.onclick = function (){
                    if (constrs.className === "fold"){
                        constrs.className = "unfold";
                        this.innerText = "收起";
                    }else {
                        constrs.className = "fold";
                        this.innerText = "展开";
                    }
                }
                detailedClassChat.appendChild(constrs);
                detailedClassChat.appendChild(foldBarOfConstr);

                //一般的方法
                let methodLabel = document.createElement("div");
                methodLabel.className = "labelBar";
                methodLabel.innerText = "函数("+that.unitInfo.methods.length+")";
                detailedClassChat.appendChild(methodLabel);
                let methods = document.createElement("div");
                methods.id = "methods";
                methods.className = "unfold";
                if (that.unitInfo.methods.length>0){
                    let mInfo = that.unitInfo.methods;
                    for (let p=0;p<mInfo.length;p++){
                        codeLineIndex++;
                        //方法头
                        let mh = document.createElement("div");
                        mh.className = "codeLine";
                        let mi = document.createElement("div");
                        mi.className = "codeLineIndex";
                        mi.innerText = codeLineIndex+"";
                        mh.appendChild(mi);
                        let mt = document.createElement("div");
                        mt.className = "codeLineText keyLine";
                        mt.innerText = mInfo[p].declaration;
                        mh.appendChild(mt);
                        methods.appendChild(mh);
                        //方法体
                        let ls = mInfo[p].methodBody.split("\r\n");
                        ls.forEach(l=>{
                            codeLineIndex++;
                            let codeLine = document.createElement("div");
                            let index = document.createElement("div");
                            index.className = "codeLineIndex";
                            index.innerText = codeLineIndex+"";
                            codeLine.appendChild(index);
                            let codeText = document.createElement("div");
                            codeText.className = "codeLineText";
                            codeText.innerText = l;
                            codeLine.appendChild(codeText);
                            codeLine.className = "codeLine";
                            methods.appendChild(codeLine);
                        })
                    }
                }
                let foldBarOfMethod = document.createElement("div");
                foldBarOfMethod.className = "labelBar";
                foldBarOfMethod.innerText = "收起";
                // foldBarOfMethod.style.borderTop = "solid #666666 1px";
                foldBarOfMethod.style.marginBottom = "10px";
                foldBarOfMethod.onclick = function (){
                    if (methods.className === "fold"){
                        methods.className = "unfold";
                        this.innerText = "收起";
                    }else {
                        methods.className = "fold";
                        this.innerText = "展开";
                    }
                }
                detailedClassChat.appendChild(methods);
                detailedClassChat.appendChild(foldBarOfMethod);

                //内部类
                let innerClassLabel = document.createElement("div");
                innerClassLabel.className = "labelBar";
                innerClassLabel.innerText = "内部类("+that.unitInfo.innerClasses.length+")";
                detailedClassChat.appendChild(innerClassLabel);
                let innerClasses = document.createElement("div");
                innerClasses.id = "innerClasses";
                innerClasses.className = "unfold";
                if (that.unitInfo.innerClasses.length>0){
                    let inInfo = that.unitInfo.innerClasses;
                    for (let p=0;p<inInfo.length;p++){
                        //类头
                        codeLineIndex++;
                        let h ="";
                        if (inInfo[p].modifier.length>0){
                            inInfo[p].modifier.forEach(m=>{
                                h = h+"class "+m;
                            })
                        }
                        h = h + inInfo[p].name;
                        let mh = document.createElement("div");
                        mh.className = "codeLine";
                        let mi = document.createElement("div");
                        mi.className = "codeLineIndex";
                        mi.innerText = codeLineIndex+"";
                        mh.appendChild(mi);
                        let mt = document.createElement("div");
                        mt.className = "codeLineText keyLine";
                        mt.innerText = h;
                        mh.appendChild(mt);
                        innerClasses.appendChild(mh);
                        //方法体
                        let ls = inInfo[p].body.split("\r\n");
                        ls.forEach(l=>{
                            codeLineIndex++;
                            let codeLine = document.createElement("div");
                            let index = document.createElement("div");
                            index.className = "codeLineIndex";
                            index.innerText = codeLineIndex+"";
                            codeLine.appendChild(index);
                            let codeText = document.createElement("div");
                            codeText.className = "codeLineText";
                            codeText.innerText = l;
                            codeLine.appendChild(codeText);
                            codeLine.className = "codeLine";
                            innerClasses.appendChild(codeLine);
                        })
                    }
                }
                detailedClassChat.appendChild(innerClasses);
                let foldBarOfInnerClass = document.createElement("div");
                foldBarOfInnerClass.className = "labelBar";
                foldBarOfInnerClass.innerText = "收起";
                foldBarOfInnerClass.style.marginBottom = "10px";
                foldBarOfInnerClass.onclick = function (){
                    if (innerClasses.className === "fold"){
                        innerClasses.className = "unfold";
                        this.innerText = "收起";
                    }else {
                        innerClasses.className = "fold";
                        this.innerText = "展开";
                    }
                }
                detailedClassChat.appendChild(foldBarOfInnerClass);

                that.container.appendChild(detailedClassChat);
            }

        }
        //添加显式子元素
        let cModifier = document.createElement("div");
        cModifier.className = "classModifier";
        let modifierStr = this.unitInfo.modifiers;
        this.unitInfo.methods.forEach(methodInfo=>{
            if (methodInfo.MethodName === "main"){
                modifierStr = modifierStr + " exeEnter(main)"
                cModifier.className = "classModifier-main";
            }
        })
        if (this.unitInfo.className.split("$").length>1){
            modifierStr = modifierStr+" innerClass";
            cModifier.className = "classModifier-inner";
        }
        cModifier.innerHTML = modifierStr;
        chat.appendChild(cModifier);
        let cName = document.createElement("div");
        cName.className = "className";
        if (this.unitInfo.package)
            cName.innerHTML = this.unitInfo.package+"."+this.unitInfo.className;
        else
            cName.innerHTML = this.unitInfo.className;
        chat.appendChild(cName);
        if (this.unitInfo.extends !== undefined && this.unitInfo.extends !=="" && this.unitInfo.extends.substring(this.unitInfo.extends.lastIndexOf(".")+1)!=="Object"){
            let cExtends = document.createElement("div");
            cExtends.className = "classExtends";
            let m = document.createElement("div");
            m.style.color = "chartreuse";
            m.style.marginRight = "5px";
            m.innerHTML = "extends ";
            cExtends.appendChild(m);
            if (this.unitInfo.extends.search("class ")!==-1)
            cExtends.innerHTML =cExtends.innerHTML + this.unitInfo.extends.split(" ")[1];
            else cExtends.innerHTML = cExtends.innerHTML + this.unitInfo.extends;
            chat.appendChild(cExtends);
        }
        if (this.unitInfo.interface.length!=0){
            let cInterface = document.createElement("div");
            cInterface.className="classInterface";
            let m = document.createElement("div");
            m.style.color = "chartreuse";
            m.style.marginRight = "5px";
            m.innerHTML = "implements";
            cInterface.appendChild(m);
            this.unitInfo.interface.forEach(e =>{
                let n = document.createElement("div");
                n.style.textIndent = "4em";
                n.innerHTML = e;
                cInterface.appendChild(n);
            })
            chat.appendChild(cInterface);
        }
        //添加隐式子元素
        let cMethods = document.createElement("div");
        cMethods.className = "classMethods";
            if (this.unitInfo.constructors.length!==0){
                //包装构造函数的容器
                let constructorContainer = document.createElement("div");
                constructorContainer.className = "methodBean";
                constructorContainer.innerHTML = "构造器 >";
                let that = this;
                constructorContainer.onclick = function (e) {
                    Array.from(constructorContainer.children).forEach(child => {
                        if (child.className.search("hidden")!==-1){
                            that.constrIsFocus = true;
                            child.className = child.className.split("hidden").join("")+"visible";
                        }else {
                            that.constrIsFocus = false;
                            child.className = child.className.split("visible").join("")+"hidden";
                        }
                    })
                    if (chat.className.search("top")===-1)
                    chat.className = chat.className + " top";
                    else if (!that.methodIsFocus) chat.className = chat.className.split("top").join('');
                }
                this.unitInfo.constructors.forEach(constr=>{
                    let cConstructor = document.createElement("div");
                    cConstructor.className = "classConstructor hidden";
                    cConstructor.innerText = constr.constrModifier +" "+constr.constrName.substring(constr.constrName.lastIndexOf(".")+1)+"（"+constr.constrParams+"）";
                    constructorContainer.appendChild(cConstructor);
                })
                cMethods.appendChild(constructorContainer);
            }

            //包装方法的容器
            if (this.unitInfo.methods.length!==0){
                let methodContainer = document.createElement("div");
                methodContainer.className = "methodBean";
                methodContainer.innerHTML = "方法(函数) >";
                let that = this;
                methodContainer.onclick = function (e){
                    Array.from(methodContainer.children).forEach(child => {
                        if (child.className.search("hidden")!==-1){
                            that.methodIsFocus = true;
                            child.className = child.className.split("hidden").join("")+"visible";
                        }else {
                            that.methodIsFocus = false;
                            child.className = child.className.split("visible").join("")+"hidden";
                        }
                    })
                    if (chat.className.search("top")===-1)
                        chat.className = chat.className + " top";
                    else if (!that.constrIsFocus) chat.className = chat.className.split("top").join('');
                }
                this.unitInfo.methods.forEach(method=>{
                    let cMethod = document.createElement("div");
                    cMethod.className = "classMethod hidden";
                    if (method.declaration === null || method.declaration === undefined)
                    cMethod.innerText = method.modifier + " "+method.returnType+" " +method.MethodName+"（"+method.params+"）";
                    else {
                        cMethod.innerText = method.declaration;
                    }
                    methodContainer.appendChild(cMethod);
                })
                cMethods.appendChild(methodContainer);
            }
        chat.appendChild(cMethods);

        this.container.appendChild(chat);
        this.chatObj = chat;
        this.computedPosition = this.GetComputedPosition();
        return chat;
    }

    //为对象对应元素添加css类,添加在最后
    AppendCssClass(cName){
        if (this.chatObj.className.search(cName) === -1){
            this.chatObj.className = this.chatObj.className +" " +cName;
        }
    }

    //移除css类
    RemoveCssClass(cName){
        this.chatObj.className = this.chatObj.className.split(cName).join('');
    }

    //获取类名
    GetClassName(){
        return this.unitInfo.className;
    }

    //获取包名
    GetPackage(){
        if (this.unitInfo.package!==undefined && this.unitInfo.package!==null && this.unitInfo.package!=="")
        return this.unitInfo.package;
        else {
            return this.unitInfo.className.slice(0,this.unitInfo.className.lastIndexOf("."));
        }
    }

    //判断类是否包含main入口
    IsEnterClass(){
        for (let p=0;p<this.unitInfo.methods.length;p++){
            if(this.unitInfo.methods[p].MethodName === "main"){
                return true;
            }
        }
        return false;
    }

    //获取继承关系 返回值:String 类名 / null
    GetExtend(){
        if (this.unitInfo.extends !== "" && this.unitInfo.extends !== "class java.lang.Object"){
            if (this.unitInfo.extends.search("class ")!==-1) return this.unitInfo.extends.split(" ")[1];
            else return this.unitInfo.extends;
        }
        return null;
    }

    //获取实现关系 返回值：String[] 类名 / null
    GetImplements(){
        if (this.unitInfo.interface.length!==0){
            return this.unitInfo.interface;
        }
        return null;
    }

    //改变chat的背景颜色
    ChangeMyBGColor(color){
        this.chatObj.style.backgroundColor = "RGB("+color[0]+","+ color[1]+","+color[2]+")";
    }

    //获取位置 返回值为float[]二元数组
    GetPosition(){
        // return [parseFloat(window.getComputedStyle(this.chatObj).left.split("px").join()) ,parseFloat(window.getComputedStyle(this.chatObj).top.split("px").join()) ];
        return this.computedPosition;
    }

    //获取真实位置 返回值为float[]二元数组
    GetComputedPosition(){
        return [parseFloat(window.getComputedStyle(this.chatObj).left.split("px").join()) ,parseFloat(window.getComputedStyle(this.chatObj).top.split("px").join()) ];
    }

    //获取真实大小 返回值为float[]二元数组
    GetSize(){
        return [parseFloat(window.getComputedStyle(this.chatObj).width.split("px").join()) ,parseFloat(window.getComputedStyle(this.chatObj).height.split("px").join()) ];
    }

    /*
     *与另一个有关系的chat连接
     * otherChat: ClassChat 对象
     * relation: String 关系名（继承、实现）
     * canvas: HTMLObj 使用的画布
     */
    ConnectByRelation(otherChat,relation){
        let myPosition = this.GetPosition();
        let mySize = this.GetSize();
        let targetPosition = otherChat.GetPosition();
        let targetSize = otherChat.GetSize();

        let myConnectPoint,targetConnectPoint;
        if (myPosition[1]<targetPosition[1]){
            myConnectPoint = [myPosition[0]+mySize[0]/2,myPosition[1]+mySize[1]];
            targetConnectPoint = [targetPosition[0]+targetSize[0]/2,targetPosition[1]];
        }else {
            targetConnectPoint = [targetPosition[0]+targetSize[0]/2,targetPosition[1]+targetSize[1]];
            myConnectPoint = [myPosition[0]+mySize[0]/2,myPosition[1]];
        }
        let context = document.getElementById("canvas").getContext("2d");
        context.beginPath();
        context.moveTo(myConnectPoint[0],myConnectPoint[1]);
        context.lineTo(targetConnectPoint[0],targetConnectPoint[1]);
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = "#444444"
        context.stroke();
        let lineMiddlePoint = [(myConnectPoint[0]+targetConnectPoint[0])/2,(myConnectPoint[1]+targetConnectPoint[1])/2];
        context.fillStyle = "#444444"
        context.fillText(relation,lineMiddlePoint[0],lineMiddlePoint[1]);
    }

    //当画面整体移动后重绘canvas元素
    ReConnect(targetChat,relation,translate){
        let canvas = document.getElementById("canvas");
        let context = canvas.getContext("2d");

        //重绘
        let myPosition = this.GetPosition();
        let mySize = this.GetSize();
        let targetPosition = targetChat.GetPosition();
        let targetSize = targetChat.GetSize();

        //连接点需要加偏移量
        let myConnectPoint,targetConnectPoint;
        if (myPosition[1]<targetPosition[1]){
            myConnectPoint = [myPosition[0]+mySize[0]/2+translate[0],myPosition[1]+mySize[1]+translate[1]];
            targetConnectPoint = [targetPosition[0]+targetSize[0]/2+translate[0],targetPosition[1]+translate[1]];
        }else {
            targetConnectPoint = [targetPosition[0]+targetSize[0]/2+translate[0],targetPosition[1]+targetSize[1]+translate[1]];
            myConnectPoint = [myPosition[0]+mySize[0]/2+translate[0],myPosition[1]+translate[1]];
        }
        context.beginPath();
        context.moveTo(myConnectPoint[0],myConnectPoint[1]);
        context.lineTo(targetConnectPoint[0],targetConnectPoint[1]);
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = "#444444"
        context.stroke();
        let lineMiddlePoint = [(myConnectPoint[0]+targetConnectPoint[0])/2,(myConnectPoint[1]+targetConnectPoint[1])/2];
        context.fillStyle = "#444444"
        context.fillText(relation,lineMiddlePoint[0],lineMiddlePoint[1]);
    }

    /*
     *设置位置 返回值为修改后的真实位置
     *nLeft: String "**px"
     *nRight: String "**px"
     */
    SetPosition(nLeft,nTop){
        this.chatObj.style.left = nLeft;
        this.chatObj.style.top = nTop;
        this.computedPosition = [nLeft,nTop];
    }

    //让chat变成被关注状态
    BeFocus(){
        this.chatObj.className = this.chatObj.className + " beFocus";
    }

    //清除被关注状态
    NotFocus(){
        this.chatObj.className = this.chatObj.className.split("beFocus").join("");
    }

    //向Y轴正方向移动 moveSpeed px
    MoveToYPositive(){
        let p = this.GetPosition();
        this.SetPosition(p[0],p[1]+this.moveSpeed);
    }

    //向Y轴负方向移动 moveSpeed px
    MoveToYNegative(){
        let p = this.GetPosition();
        this.SetPosition(p[0],p[1]-this.moveSpeed);
    }

    //向X轴正方向移动 moveSpeed px
    MoveToXPositive(){
        let p = this.GetPosition();
        this.SetPosition(p[0]+this.moveSpeed,p[1]);
    }

    //向X轴负方向移动 moveSpeed px
    MoveToXNegative(){
        let p = this.GetPosition();
        this.SetPosition(p[0]-this.moveSpeed,p[1]);
    }

    //向X轴负方向和Y轴负方向移动 moveSpeed px
    MoveToLB(){
        let p = this.GetPosition();
        this.SetPosition(p[0]-this.moveSpeed,p[1]-this.moveSpeed);
    }

    //向X轴正方向和Y轴负方向移动 moveSpeed px
    MoveToRB(){
        let p = this.GetPosition();
        this.SetPosition(p[0]+this.moveSpeed,p[1]-this.moveSpeed);
    }

    //向X轴正方向和Y轴正方向移动 moveSpeed px
    MoveToRF(){
        let p = this.GetPosition();
        this.SetPosition(p[0]+this.moveSpeed,p[1]+this.moveSpeed);
    }

    //向X轴负方向和Y轴正方向移动 moveSpeed px
    MoveToLF(){
        let p = this.GetPosition();
        this.SetPosition(p[0]-this.moveSpeed,p[1]+this.moveSpeed);
    }

    //移动的其它实现方式
    Translate(dx,dy){
        this.translatedDistanceX = this.translatedDistanceX+dx;
        this.translatedDistanceY = this.translatedDistanceY+dy;
        this.chatObj.style.transform = 'translate('+ this.translatedDistanceX + "px," + this.translatedDistanceY +'px)';
    }

    //获取偏移量
    GetTranslate(){
        return [this.translatedDistanceX,this.translatedDistanceY];
    }
    /*
    *改变位置并修改连线
    */
    ResetPosition(nLeft,nTop){
        //
    }

}