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
                this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+chat.GetSize()[1];
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
                this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+chat.GetSize()[1];
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
            let relatedXTotal;
            for (let p=0;p<relatedChats.length;p++){
                relatedXTotal = relatedChats[p].GetPosition()[0];
            }
            let relatedX = relatedXTotal/relatedChats.length;
            chat.SetPosition(relatedX,this.floorHeight[targetFloor]+this.marginOfEachFloor);
            this.inserted[targetFloor] = [chat];
            if (this.floorHeight[targetFloor+1] === undefined){
                this.floorHeight[targetFloor+1] = this.floorHeight[targetFloor]+chat.GetSize()[1];
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
            //如果只有一个无效区间则在距默认点最近处放置，有多个区间需要算出他们之间的区间即有效区间，再进行判断
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

}