//用于创建临时示意类chat，表示与类库中类和接口的继承、实现关系，由于类文件不在文件包中无法获得详细信息
class ExternalClassChat{
    moveSpeed = 5;
    translatedDistanceX = 0;
    translatedDistanceY = 0;

    constructor(container,className) {
        this.container = container;
        this.className = className;
    }

    Create(){
        let chat = document.createElement("div");
        chat.style.width = "auto";
        chat.style.height = "auto";
        chat.style.position = "absolute";
        chat.style.zIndex = "11";
        chat.style.borderRadius = "3px";
        chat.style.backgroundColor = "#fafafa";
        chat.className = "classChat"
        chat.innerText = "外部类" + this.className;
        this.container.appendChild(chat);
        this.chatObj = chat;
        this.computedPosition = this.GetComputedPosition()
        return chat;
    }

    GetClassName(){
        return this.className;
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

    SetPosition(nLeft,nTop){
        this.chatObj.style.left = nLeft;
        this.chatObj.style.top = nTop;
        this.computedPosition = [nLeft,nTop];
    }

    //获取真实位置 返回值为float[]二元数组
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
}