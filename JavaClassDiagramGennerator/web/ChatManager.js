/*
 *用于管理chat的位置调整的工具类
 */
class ChatManager{
    //二维数组，每个元素为一层的所有chat组成的数组
    static inserted = [];
    static marginOfEachFloor = 300; //两层的默认间隔
    static marginOfEachChat = 200; //相邻chat的默认间隔
    static minMargin = 120;
    static beginX = (window.innerWidth || document.documentElement.clientWidth)/2; //起始添加位置X坐标
    static floorHeight = [20]; //记录每层前一层最低处所在的高度

    static packageColor = [[195, 112, 14]]
    /*
    *向目标层无序插入chat
    * 参数  chat ClassChat对象 或 ExternalClassChat对象
    *      targetFloor  目标层int
    *
    * 若当前层没有chat，直接在中间放置；若有chat,找到左右边界，往偏离中心X坐标更近的一边放置
    */
    static UnorderedInsertChat(chat,targetFloor){
        if (this.inserted[targetFloor] === undefined || this.inserted[targetFloor] === null){
            chat.SetPosition(this.beginX-chat.GetSize()[0]/2,targetFloor===0?this.floorHeight[0]:(this.floorHeight[targetFloor]+this.marginOfEachFloor));
            this.inserted[targetFloor] = [chat];
            if (this.floorHeight[targetFloor+1] === undefined){
                this.floorHeight[targetFloor+1] =targetFloor===0?this.floorHeight[0]+chat.GetSize()[1]:this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
            }
        }else {
            let leftEdge=this.beginX,rightEdge=this.beginX;
            for (let p=0;p<this.inserted[targetFloor].length;p++){
                let position = this.inserted[targetFloor][p].GetPosition();
                let size = this.inserted[targetFloor][p].GetSize();
                if (position[0] < leftEdge) leftEdge = position[0];
                if (position[0]+size[0] > rightEdge) rightEdge = position[0]+size[0];
            }
            if (Math.abs(leftEdge-this.beginX) <= Math.abs(rightEdge-this.beginX)){
                chat.SetPosition(leftEdge-this.marginOfEachChat-chat.GetSize()[0],targetFloor===0?this.floorHeight[0]:(this.floorHeight[targetFloor]+this.marginOfEachFloor));
                this.inserted[targetFloor].push(chat);
            }else {
                chat.SetPosition(rightEdge+this.marginOfEachChat,targetFloor===0?this.floorHeight[0]:(this.floorHeight[targetFloor]+this.marginOfEachFloor));
                this.inserted[targetFloor].push(chat);
            }
            if (this.floorHeight[targetFloor+1] < this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                this.floorHeight[targetFloor+1] = targetFloor===0?this.floorHeight[0]+chat.GetSize()[1]:this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
            }
        }
    }

    /*
     *向目标层插入chat，遵循与上一层的继承、实现关系排序
     * 参数  chat: ClassChat对象 或 ExternalClassChat对象
     *      targetFloor:  int目标层
     *      relatedChats: ClassChat[] 或 ExternalClassChat[] 相关chat
     *
     * 执行判断：先查找相关chat是否已放置，若有未放置的，则返回 false （放置成功返回true）
     * 准备：计算目标层，目标层为相关chat所属最大层数的下一层
     * 放置：若当前层没有chat，查看相关元素位置，在其x坐标均值处放置；若有chat，先获取已有chat之间的每段间隔大小，以其相关元素x坐标均值为中心，查找可放置位置（左右最少留50px空白即 range > size()[0]+100），在最近可放置处放置，没有可防止间隔则在最左、最右（更近者）放置
     */
    static InsertChat(chat,relatedChats){
        //检查相关chat是否都已放置
        let relatedChatsExist = new Array(relatedChats.length);
        cycle:for (let p=0;p<relatedChats.length;p++){
            relatedChatsExist[p] = false;
            for (let n=0;n<this.inserted.length;n++){
                for (let  m=0;m<this.inserted[n].length;m++){
                    if (relatedChats[p] === this.inserted[n][m]){
                        relatedChatsExist[p] = true;
                        continue cycle;
                    }
                }
            }
        }
        for (let p=0;p<relatedChatsExist.length;p++){
            if (!relatedChatsExist[p]){
                //有一个未放置都不能继续
                return false;
            }
        }

        //计算所加入的层
        let targetFloor=1;
        for (let p=0;p<relatedChats.length;p++){
            for (let n=0;n<this.inserted.length;n++){ //n是层数
                for (let m=0;m<this.inserted[n].length;m++){
                    if (this.inserted[n][m]===relatedChats[p]){ //找到相关chat
                        if (targetFloor <= n)targetFloor = n+1; //把targetFloor设为最低层(数值最大)
                    }
                }
            }
        }
        // console.log(chat.GetClassName(),targetFloor);

        //放置chat
        //当前层为空层
        if (this.inserted[targetFloor] === null || this.inserted[targetFloor] === undefined){
            let relatedXTotal=0;
            for (let p=0;p<relatedChats.length;p++){
                relatedXTotal = relatedXTotal + relatedChats[p].GetPosition()[0]+relatedChats[p].GetSize()[0]/2;
            }
            let relatedX = relatedXTotal/relatedChats.length;
            chat.SetPosition(relatedX-chat.GetSize()[0]/2,this.floorHeight[targetFloor]+this.marginOfEachFloor);
            this.inserted[targetFloor] = [chat];
            if (this.floorHeight[targetFloor+1] === undefined){
                this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
            }
            return true;
        }else {
            //当前层有chat
            let relatedXTotal;
            for (let p=0;p<relatedChats.length;p++){
                relatedXTotal = relatedChats[p].GetPosition()[0];
            }
            let relatedX = relatedXTotal/relatedChats.length;
            //已占用区间
            let unusableInterval = [];
            for (let p=0;p<this.inserted[targetFloor].length;p++){
                unusableInterval.push([this.inserted[targetFloor][p].GetPosition()[0],this.inserted[targetFloor][p].GetPosition()[0]+this.inserted[targetFloor][p].GetSize()[0]]);
            }
            //如果只有一个已占用区间则在距默认点最近处放置，有多个区间需要算出他们之间的区间即有效区间，再进行判断
            if (unusableInterval.length === 1){
                //在区间右侧可直接放置
                if (relatedX > unusableInterval[0][1]){
                    chat.SetPosition(relatedX,this.floorHeight[targetFloor]+this.marginOfEachFloor);
                    this.inserted[targetFloor].push(chat);
                    if (this.floorHeight[targetFloor+1] < this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                        this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                    }
                    return true;
                }else if (relatedX+chat.GetSize()[0] < unusableInterval[0][0]){
                    //在区间左侧且当前位置可直接放置
                    chat.SetPosition(relatedX,this.floorHeight[targetFloor]+this.marginOfEachFloor);
                    this.inserted[targetFloor].push(chat);
                    if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                        this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                    }
                    return true;
                }else {
                    //在左侧但不能直接放置，按最小间隔minMargin放置
                    let setX = unusableInterval[0][0] - this.minMargin - chat.GetSize()[0];
                    chat.SetPosition(setX,this.floorHeight[targetFloor]+this.marginOfEachFloor)
                    this.inserted[targetFloor].push(chat);
                    if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                        this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                    }
                    return true;
                }
            }else {
                //有多个无效区间
                //调整unusableInterval 的顺序，使之从小到大排列
                for (let p=1;p<unusableInterval.length;p++){
                    for (let n=0;n<unusableInterval.length-p;n++){
                        if (unusableInterval[n][0]>unusableInterval[n+1][0]){
                            let flag = unusableInterval[n];
                            unusableInterval[n] = unusableInterval[n+1];
                            unusableInterval[n+1] = flag;
                        }
                    }
                }

                //除了两侧以外的有效区间
                let usableInterval = [];
                let leftEdge = unusableInterval[0][0] //无效区间左边界
                let rightEdge = unusableInterval[unusableInterval.length-1][1]; //无效区间右边界
                //默认点位就在右侧
                if (relatedX > rightEdge){
                    chat.SetPosition(relatedX,this.floorHeight[targetFloor]+this.marginOfEachFloor);
                    this.inserted[targetFloor].push(chat);
                    if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                        this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                    }
                    return true;
                }else if (relatedX + chat.GetSize()[0] < leftEdge){
                    //默认位置就在左侧且放得下
                    chat.SetPosition(relatedX,this.floorHeight[targetFloor]+this.marginOfEachFloor);
                    this.inserted[targetFloor].push(chat);
                    if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                        this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                    }
                    return true;
                }

                for (let p=0;p<unusableInterval.length-1;p++){
                    usableInterval.push([unusableInterval[p][1],unusableInterval[p+1][0]]);
                }
                //可以插入的有效区间
                let insertableInterval = [];
                for (let p=0;p<usableInterval.length;p++){
                    if (usableInterval[p][1]-usableInterval[p][0] > (chat.GetSize()[0]+this.minMargin*2) ){
                        insertableInterval.push(usableInterval[p]);
                    }
                }
                let dl = Math.abs(relatedX - (leftEdge-this.minMargin-chat.GetSize()[0])); //默认放置点与左侧最近放置位置的距离
                let dr = Math.abs(relatedX - (rightEdge+this.minMargin));//默认放置点与右侧最近放置位置的距离
                let dInsertableInterval = [] //默认放置点与可插入区间的中点的距离
                //没有可插入有效区间，直接找左右侧更近侧放置
                if (insertableInterval.length === 0){
                    if (dl <= dr){
                        chat.SetPosition(leftEdge-this.minMargin-chat.GetSize()[0],this.floorHeight[targetFloor]+this.marginOfEachFloor);
                        this.inserted[targetFloor].push(chat);
                        if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                            this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                        }
                        return true;
                    }else {
                        chat.SetPosition(rightEdge+this.minMargin,this.floorHeight[targetFloor]+this.marginOfEachFloor);
                        this.inserted[targetFloor].push(chat);
                        if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                            this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                        }
                        return true;
                    }
                }else {
                    //有可插入的有效区间，找与默认放置点最近的放置
                    //计算可插入有效区间中点与默认放置点的距离
                    for (let p=0;p<insertableInterval.length;p++){
                        dInsertableInterval.push(Math.abs((insertableInterval[p][1]+insertableInterval[p][0])/2)-relatedX);
                    }
                    let insertP = 0;
                    let minD = Math.min(dr,dl); //最小距离初始值为左右侧放置点较小者距离
                    for (let p=0;p<dInsertableInterval.length;p++){
                        if (dInsertableInterval[p] < minD){
                            minD = dInsertableInterval[p];
                            insertP = p;
                        }
                    }
                    //最终最小值还是左右侧之一
                    if (minD === dr || minD === dl){
                        if (minD === dr){
                            chat.SetPosition(leftEdge-this.minMargin-chat.GetSize()[0],this.floorHeight[targetFloor]+this.marginOfEachFloor);
                            this.inserted[targetFloor].push(chat);
                            if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                                this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                            }
                            return true;
                        }else {
                            chat.SetPosition(rightEdge+this.minMargin,this.floorHeight[targetFloor]+this.marginOfEachFloor);
                            this.inserted[targetFloor].push(chat);
                            if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                                this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                            }
                            return true;
                        }
                    }else {
                        //最终最小值是可插入有效区间中的一个
                        let X = (insertableInterval[insertP][1]+insertableInterval[insertP][0])/2;
                        chat.SetPosition(X-chat.GetSize()[0]/2,this.floorHeight[targetFloor]+this.marginOfEachFloor);
                        this.inserted[targetFloor].push(chat);
                        if (this.floorHeight[targetFloor+1]<this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1]){
                            this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+this.marginOfEachFloor+chat.GetSize()[1];
                        }
                        return true;
                    }
                }
            }

        }

    }

    /*
     *在特定颜色区间内生成随机颜色，颜色不重复
     * 参数 num: int 生成的颜色数量，最小为1,小于1视为1，为1时返回默认颜色;已有对应数量的颜色直接返回
     */
    static GenerateThemeColor(num){
        let blueRInterval = [54,181],blueGInterval = [109,226],blueBInterval = [143,255];
        let yellowRInterval = [143,219],yellowGInterval = [90,172],yellowBInterval = [16,105];
        let differenceB = Math.sqrt(Math.pow(blueRInterval[1]-blueRInterval[0],2)+Math.pow(blueGInterval[1]-blueGInterval[0],2)+Math.pow(blueBInterval[1]-blueBInterval[0],2));
        let differenceY = Math.sqrt(Math.pow(yellowRInterval[1]-yellowRInterval[0],2)+Math.pow(yellowGInterval[1]-yellowGInterval[0],2)+Math.pow(yellowBInterval[1]-yellowBInterval[0],2));

        if (num<=this.packageColor.length){
            if (num<=1) return this.packageColor[0];
            return this.packageColor.slice(0,num-1);
        }else {
            let p=0;
            while (this.packageColor.length<num){
                let R = Math.floor(Math.random()*256);
                let G = Math.floor(Math.random()*256);
                let B = Math.floor(Math.random()*256);
                let dbl = Math.sqrt(Math.pow(Math.abs(R-blueRInterval[0]),2)+Math.pow(Math.abs(G-blueGInterval[0]),2)+Math.pow(Math.abs(B-blueBInterval[0]),2));
                let dbr = Math.sqrt(Math.pow(Math.abs(R-blueRInterval[1]),2)+Math.pow(Math.abs(G-blueGInterval[1]),2)+Math.pow(Math.abs(B-blueBInterval[1]),2));
                let dyl = Math.sqrt(Math.pow(Math.abs(R-yellowRInterval[0]),2)+Math.pow(Math.abs(G-yellowGInterval[0]),2)+Math.pow(Math.abs(B-yellowBInterval[0]),2));
                let dyr = Math.sqrt(Math.pow(Math.abs(R-yellowRInterval[1]),2)+Math.pow(Math.abs(G-yellowGInterval[1]),2)+Math.pow(Math.abs(B-yellowBInterval[1]),2));

                if ((dbl<=differenceB*0.7 && dbr<=differenceB*0.5) || (dyl<=differenceY*0.4 && dyr<=differenceY*0.8) ){
                    //判断与已有颜色的相似度，相似度不能太高以使颜色易区分
                    let isRelatedToOthers = false;
                    for (let n=0;n<this.packageColor.length;n++){
                        let d = Math.sqrt(Math.pow(Math.abs(R-this.packageColor[n][0]),2)+Math.pow(Math.abs(G-this.packageColor[n][1]),2)+Math.pow(Math.abs(B-this.packageColor[n][2]),2));
                        if (p<=50){
                            if (d<=20){
                                isRelatedToOthers = false;
                                break;
                            }
                        }else {
                            //实在是找不到时,不重复即可
                            if (d===0){
                                isRelatedToOthers = false;
                                break;
                            }
                        }

                    }
                    if (!isRelatedToOthers){
                        this.packageColor.push([R,G,B]);
                        p=0;
                    }else {
                        p++;
                    }
                }
            }
            return this.packageColor;
        }
    }

}