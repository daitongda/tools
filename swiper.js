//封装一个滑屏组件
/*
    init:
        el:元素,
        dir:方向,
        start:手指按下的回调,
        move:手指移动的回调,
        end:手指抬起的回调,
        over:在缓冲动画有的前提下,over的回调
*/
function swiper(init){
    var el=init.el;
    //基本上要滚动的元素都为el下的第一个
    var scroll=el.children[0];
    //方向
    var dir=init.dir?init.dir:'y';
    //从方向得到朝哪个方向移动
    var transformDir={
        x:'translateX',
        y:'translateY'
    }
    //第一次和移动的方向的开关
    var isFirst;
    var isMove={};

    //起始点和元素的起始位置
    var startPoint={};
    var startEl={};

    //先设置元素的translate属性为0;
    css(scroll,'translateX',0);
    css(scroll,'translateY',0);
    css(scroll,'translateZ',0);

    //上一次的时间和距离得到速度和差
    var lastTime=0;
    var lastPoint;
    var diffTime=0;
    var diffPoint;

    //最小的滚动的值
    var minTranslate={};
    //拉力系数
    var F=1;

    //添加手指按下侦听事件
    el.addEventListener('touchstart',function(e){
        console.log(1);
        console.log(2)
        //清空上次的运动
        window.cancelAnimationFrame(scroll.timer);

        //获取到第一个按下的手指
        var touch=e.changedTouches[0];



        //按下触发的回调
        init.start&&init.start.call(el,e);
        //起始点和元素的起始位置初始化
        startPoint={
            x:touch.pageX,
            y:touch.pageY
        };
        startEl={
            x:css(scroll,'translateX'),
            y:css(scroll,'translateY')
        };
        //每次按下时第一次开关
        isFirst=false;
        isMove={
            x:false,
            y:false
        };

        //上一次的时间的初始化
        lastPoint={
            x:touch.pageX,
            y:touch.pageY
        };
        lastTime=Date.now();
        diffPoint={
            X:0,
            y:0
        };
        diffTime=0;

        //得到最小的滚动距离
        minTranslate={
            x:el.clientWidth-scroll.offsetWidth,
            y:el.clientHeight-scroll.offsetHeight
        };

    });

    //添加手指移动侦听事件
    el.addEventListener('touchmove',function(e){
        var touch=e.changedTouches[0];

        //现在点的位置
        var nowPoint={
            x:touch.pageX,
            y:touch.pageY
        };
        //获取现在点和起始点的差值
        var dis={
            x:nowPoint.x-startPoint.x,
            y:nowPoint.y-startPoint.y
        };
        //取第一次移动的那个方向
        if(!isFirst){
            if(Math.abs(dis.x)-Math.abs(dis.y)>2){
                isMove.x=true;
                isFirst=true;
            }else if(Math.abs(dis.y)-Math.abs(dis.x)>2){
                isMove.y=true;
                isFirst=true;
            };
        };

        //获取对象应该到哪里
        var target=dis[dir]+startEl[dir];
        if(target>0){
            target=Math.sqrt(30*dis[dir])-20;
        }else if(target<minTranslate[dir]){
            var over=(target-minTranslate[dir]);
            target=Math.sqrt(30*Math.abs(over))-20;
            target=minTranslate[dir]-target;
        }
        isMove[dir]&&css(scroll,transformDir[dir],target);

        ///* 距离差值计算 */
        var nowTime=Date.now();
        diffTime=nowTime-lastTime;
        diffPoint={
            x:nowPoint.x-lastPoint.x,
            y:nowPoint.y-lastPoint.y
        };
    //    对于下一次来说，当前的值就变成了上一次的值
        lastTime=nowTime;
        lastPoint.x=nowPoint.x;
        lastPoint.y=nowPoint.y;

        init.move&&init.move.call(el,e);

    });


    //添加手指抬起的侦听事件
    el.addEventListener('touchend',function(e){
        //距离的时间差值
        var speed=diffPoint[dir]/diffTime;
        speed=speed?speed:0;
        //用户抬起手指前，一直按住不动，那抬起了也不需要移动
        if((Date.now()-lastTime)>100){
            speed=0;
        };
        //缓冲距离(速度越大，缓冲距离越远,所以可以直接把速度放大当做缓冲距离来用)；
        var type='easeOutStrong';
        var target=speed*120;//缓冲距离
        target+=css(scroll,transformDir[dir]);
        if(target>0){
            target=0;
            type='backOut';
        }else if(target<minTranslate[dir]){
            target=minTranslate[dir];
            type='backOut';
        };
        //用目标点-当前值  求出差值，然后给个时间值
        var time=parseInt(Math.abs(target-css(scroll,transformDir[dir]))*.1);
        var target=dir=='x'?{'translateX':target}:{'translateY':target};
        console.log(el,scroll)
        mTween({
            el:scroll,
            target:target,
            time:time,
            type:type,
            callIn:function(){
                init.move&&init.move.call(el,e);
            },
            callBack: function(){
                init.over&&init.over.call(el);
            }
        });
        init.end&&init.end.call(el,e);
    });
};

/*
	在 swiper的基础上加封滚动条
	init: {
		el: 滑屏的元素,
		dir: 方向 "x"|"y",
		start: fn 开始时的回调
		move: 移动中的回调
		end: 抬起之后的回调
		over: 缓冲结束的回调
	}
*/
function swiperBar(init){
    var dir = init.dir?init.dir:"y";
    var el = init.el;
    var scroll = el.children[0];
    var bar = document.createElement("div");
    var scale = 1;
    var startPoint = 0;
    var transformDir = {
        x: "translateX",
        y: "translateY"
    };
    bar.className = "bar";
    bar.style.cssText = "position:absolute;background:rgba(0,0,0,0.5);border-radius:3px;opacity:0;transition: .3s opacity;";
    if(dir == "x"){
        bar.style.left = 0;
        bar.style.bottom = 0;
        bar.style.height = "6px";
    } else {
        bar.style.right = 0;
        bar.style.top = 0;
        bar.style.width = "6px";
    }
    getScale();
    css(bar,transformDir[dir],0);
    el.appendChild(bar);
    swiper({
        el: el,
        dir: dir,
        start: function(){
            startPoint = css(scroll,transformDir[dir]);
            getScale();
            init.start&&init.start.call(el);
        },
        move: function(){
            var nowPoint = css(scroll,transformDir[dir]);
            if(Math.abs(nowPoint - startPoint) > 2){
                bar.style.opacity = 1;
            }
            var dis = -css(scroll,transformDir[dir]);
            css(bar,transformDir[dir],dis*scale);
            init.move&&init.move.call(el);
        },
        end: function(){
            init.end&&init.end.call(el);
        },
        over: function(){
            bar.style.opacity = 0;
            init.over&&init.over.call(el);
        }
    });
    function getScale(){
        if(dir == "x"){
            scale = el.clientWidth/scroll.offsetWidth;
            bar.style.width = el.clientWidth * scale + "px";
        } else {
            scale = el.clientHeight/scroll.offsetHeight;
            bar.style.height = el.clientHeight * scale + "px";
        };
    };
};

function tap(el,fn){
    var lastPoint={};
    el.addEventListener('touchstart',function(e){
        var touch=e.changedTouches[0];
        lastPoint={
            x:touch.pageX,
            y:touch.pageY
        };
    });
    el.addEventListener('touchend',function(e){
        var touch=e.changedTouches[0];
        if(Math.abs(touch.pageX-lastPoint.x)<5&&Math.abs(touch.pageY-lastPoint.y)<5){
            fn&&fn.call(el,e);
        };
    });
};





