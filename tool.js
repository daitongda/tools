var tools={
    /*
        class的增删改查
    */
    checkClass:function(el,val){
        if(!el.className) return;
        var classArr=el.className.split(' ');
        for(var i=0;i<classArr.length;i++){
            if(classArr[i]==val){
                return true;
            }
        }
        return false;
    },
    addClass:function(el,val){
        var classArr=el.className.split(' ');
        var str='';
        for(var i=0;i<classArr.length;i++){
            if(classArr[i]){
                str+=classArr[i]+' ';
            };
        };
        if(!this.checkClass(el,val)){
            str+=val+' ';
        };
        el.className=str;
    },
    removeClass:function(el,val){
        if(!this.checkClass(el,val)){
            return;
        };
        var classArr=el.className.split(' ');
        var str='';
        for(var i=0;i<classArr.length;i++){
            if(classArr[i]&&classArr[i]!=val){
                str+=classArr[i]+' ';
            };
        };
        el.className=str;
    },
    toggleClass:function(el,val){
        if(this.checkClass(el,val)){
            this.removeClass(el,val);
        }else{
            this.addClass(el,val);
        }
    },
    //封装一个可以拖拽的选框选中
    /*
        init:
            el:元素,
            selInfo:{
                class:想选中的那个的class名称,
                nodeName:他的标签名字。
            },
            type:self||window||noLimit;//拖拽范围在当前传进去的那个el之间，或窗体，或不加以限制
            moveSel:选中时的回调,
            moveNoSel:没选中时的回调
     */
    selectMore:function(init){

        var el=init.el;
        var type=init.type||'noLimit';//设置默认初始拖拽范围  为 无;
        var selectInfo=init.selectInfo;
        var obj;//事件源的那个目标
        var startPoint={
            x:0,
            y:0
        };
        var elPoint={
            x:0,
            y:0
        };
        var selNode=init.selInfo.node||'*';
        selNode=selNode.toUpperCase();
        var selClass=init.selInfo.class||'';
        var selEl;
        var div=document.createElement('div');;//点击下去创建出来的那个选框
        el.addEventListener('mousedown',down);
        function down(ev){
            var ev=ev||event;
            obj=ev.target;
            if(obj==el){
                selEl=el.getElementsByTagName(selNode);
                el.appendChild(div);
                div.style.cssText='z-index:999;opacity:0.6;background-color:#5aaadb;position:absolute;' +
                    'width:0;height:0';
                elPoint.x=el.getBoundingClientRect().left;
                elPoint.y=el.getBoundingClientRect().top;
                startPoint={
                    x:ev.pageX-elPoint.x,
                    y:ev.pageY-elPoint.y
                };
                div.style.left=startPoint.x+'px';
                div.style.top=startPoint.y+'px';
                document.addEventListener('mousemove',move);
                document.addEventListener('mouseup',up);

            };
        };
        function move(ev){
            var ev=ev||event;
            if(obj==el){
                var nowPoint={
                    x:ev.pageX-elPoint.x,
                    y:ev.pageY-elPoint.y
                };
                var dis={
                    x:nowPoint.x-startPoint.x,
                    y:nowPoint.y-startPoint.y
                };
                var divCss={
                    "width":0,
                    "height":0,
                    "left":0,
                    'top':0
                };
                if(dis.x<0){
                    divCss.left=nowPoint.x;
                    divCss.width=Math.abs(dis.x);
                }else{
                    divCss.left=startPoint.x;
                    divCss.width=dis.x;
                }

                if(dis.y<0){
                    divCss.top=nowPoint.y;
                    divCss.height=Math.abs(dis.y);
                }else{
                    divCss.top=startPoint.y;
                    divCss.height=dis.y;
                };
                if(type=='self'){
                    if(divCss.left<0){
                        divCss.left=0;
                        divCss.width=startPoint.x;
                    };
                    if(divCss.top<0){
                        divCss.top=0;
                        divCss.height=startPoint.y;
                    };
                    if((nowPoint.x)>el.offsetWidth){
                        divCss.width=el.offsetWidth;
                    };
                    if((nowPoint.y)>el.offsetHeight){
                        divCss.height=el.offsetHeight;
                    };
                }else if(type=='window'){
                    if(ev.clientX<0){
                        divCss.left=0-el.getBoundingClientRect().left;
                        divCss.width=startPoint.x+el.getBoundingClientRect().left;
                    };
                    if(ev.clientY<0){
                        divCss.top=0-el.getBoundingClientRect().top;
                        divCss.height=startPoint.y+el.getBoundingClientRect().top;
                    };
                    if(ev.clientX>document.documentElement.clientWidth){
                        divCss.width=ev.pageX-startPoint.x;
                    };
                    if(ev.clientY>el.offsetHeight){
                        divCss.height=ev.pageY-startPoint.y;
                    };
                };
                for(var i=0;i<selEl.length;i++){
                    if(tools.checkClass(selEl[i],selClass)&&selEl[i].nodeName==selNode){
                        if(!(divCss.left>(selEl[i].offsetLeft+selEl[i].offsetWidth)||(divCss.left+divCss.width)<selEl[i].offsetLeft||
                            divCss.top>(selEl[i].offsetTop+selEl[i].offsetHeight)||(divCss.top+divCss.height)<selEl[i].offsetTop
                            )){
                            init.moveSel&&init.moveSel.call(selEl[i]);
                        }else{
                            init.moveNoSel&&init.moveNoSel.call(selEl[i]);
                        }
                    };
                };
                for(var s in divCss){
                    div.style[s]=divCss[s]+'px';
                };
                ev.preventDefault();
            };

        };


        function up(ev){
            // console.log(ev.clientX-el.getBoundingClientRect().left,ev.clientY-el.getBoundingClientRect().top)
            document.removeEventListener('mousemove',move);
            document.removeEventListener('mouseup',up);
            el.removeChild(div);
        };
    }
};