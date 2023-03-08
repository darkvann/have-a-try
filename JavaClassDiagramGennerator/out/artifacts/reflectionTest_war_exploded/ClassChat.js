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
        cModifier.innerHTML = modifierStr;
        chat.appendChild(cModifier);
        let cName = document.createElement("div");
        cName.className = "className";
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
            cExtends.innerHTML =cExtends.innerHTML + this.unitInfo.extends.split(" ")[1];
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
                    cMethod.innerText = method.modifier + " "+method.returnType+" " +method.MethodName+"（"+method.params+"）";
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
            return this.unitInfo.extends.split(" ")[1];
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

    /*
    *改变位置并修改连线
    */
    ResetPosition(nLeft,nTop){
        //
    }

}