/**
 * Created by Chaiyunfeng on 2017/7/20.
 */
function Drop(dropDiv, contentDiv) {
    this.dropArea = dropDiv;    //下拉时创建的div
    this.content = contentDiv;  //容器div，展示数据
    this.start = 0;     //触摸起始Y坐标
    this.end = 0;       //触摸结束Y坐标
    this.curser = 0;    //数据库游标，默认每组请求10个数据
    this.deltaY = 0;    //Y坐标变化值，对应不同的div高度
    this.status = 'closed'; //当前刷新状态
}
Drop.prototype = {
    //将头部div变为刷新状态对应的样式
    refreshState : function (div) {
        div.style.transition = '.4s';
        div.style.height = '100px';
        div.innerHTML = '刷新中...';
    },
    //展示数据，接收数据和展示数据的容器为参数
    showData : function (data, content) {
        var p = document.createDocumentFragment();
        try{
            data = JSON.parse(data); //data在这里是数组
        } catch(e) {
            console.log(e);
        }
        if (typeof data === 'object'){
            for(var i in data){
                var div = document.createElement('div');
                div.className = 'data';
                if (data.hasOwnProperty(i)){
                    div.innerHTML = data[i];
                }
                p.appendChild(div);
            }
            content.innerHTML = '';
            content.appendChild(p);
        }else {
            content.innerHTML = data;
        }
        this.dropArea.style.transition = '.2s';
        this.dropArea.style.height = '0';
        this.status = 'closed';
    },
    //ajax向服务器数据库请求数据
    requestData : function (url) {
        var that = this;
        url = url + '?curser=' + this.curser;
        var request = new XMLHttpRequest();
        request.open('get', url);
        request.onreadystatechange = function () {
            if(request.readyState === 4 && request.status === 200){
                console.log(request.responseText);
                that.showData(request.responseText, that.content);
                that.curser += 10;
            }
        };
        request.send(null);
    },
    //惰性监听事件，节省空间
    getTouch : function (event) {
        //如果当前焦点不再页面顶部，直接返回函数
        if(document.body.scrollTop > 0){
            return;
        }
        switch (event.type){
            case 'touchstart':
                this.dropArea.style.transition = '0';
                if (this.status === 'closed'){
                    this.dropArea.style.opacity = '0';
                }
                this.start = event.touches[0].clientY;
                break;
            case 'touchmove':
                this.end = event.touches[0].clientY;
                this.deltaY = Math.round(this.end - this.start);
                if (this.status === 'closed'){
                    if(this.deltaY > 0){
                        event.preventDefault();
                        if (this.deltaY*0.4 < 200){
                            this.dropArea.innerHTML = '下滑刷新';
                        }else {
                            this.dropArea.innerHTML = '释放刷新';
                        }
                        this.dropArea.style.display = 'block';
                        this.dropArea.style.height = this.deltaY*0.4 + 'px';
                        this.dropArea.style.opacity = this.deltaY/400;
                    }
                }else if (this.status === 'refreshing'){
                    if(this.deltaY > 0){
                        event.preventDefault();
                    }
                    this.dropArea.style.height = (100 + this.deltaY*0.4) + 'px';
                }
                break;
            case 'touchend':
                if (this.status === 'closed'){
                    if (this.deltaY*0.4 > 200){
                        this.refreshState(this.dropArea);
                        this.status = 'refreshing';
                        this.requestData('sentData.php');
                    }else {
                        this.dropArea.style.transition = '.2s';
                        this.dropArea.style.height = '0';
                    }
                }else if (this.status === 'refreshing'){
                    this.refreshState(this.dropArea);
                }
                break;
        }
    },
    //初始化
    init : function () {
        document.addEventListener('touchstart', this.getTouch.bind(this), false);
        document.addEventListener('touchmove', this.getTouch.bind(this), false);
        document.addEventListener('touchend', this.getTouch.bind(this), false);
        this.requestData('sentData.php');
    }
};

//创建对象，测试
window.onload = function () {
    var drop = new Drop(document.getElementById('1'), document.getElementById('2'));
    drop.init();
};
setTimeout()
