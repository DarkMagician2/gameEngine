class GLib {
    static w = window.innerWidth;
    static h = window.innerHeight;
    static gamePause = false;
    static tick = 0;

    static up = window.addEventListener("keyup", function(event) {
        GLib.Key.keyup(event);
    });
    static down = window.addEventListener("keydown", function(event) {
        GLib.Key.keydown(event);
    });

    static Key = {
        pressed: {},
        left: "a",
        up: "w",
        right: "d",
        down: "s",
        isDown: function (key){
            return this.pressed[key];
        },
        keydown: function (event){
            this.pressed[event.key] = true;
        },
        keyup: function (event){
            delete this.pressed[event.key];
        }
    }

    static genRanHex = size => [...Array(size)].map(() => Math.round(Math.random() * 15).toString(16)).join('');

    static async isTouching(element1, element2){
        function touching(x1,y1,w1,h1,x2,y2,w2,h2){
            if(x2>w1+x1||x1>w2+x2||y2>h1+y1||y1>h2+y2){
                return false;
            } else {
                return true;
            }
        }
        return touching(element1.x,element1.y,element1.width,element1.height,element2.x,element2.y,element2.width,element2.height);
    }

    static startGame(func, ...params){
        return setInterval(()=>{
            GLib.w = window.innerWidth;
            GLib.h = window.innerHeight;
            if(!GLib.gamePause){
                GLib.tick++;
                func(params);
            }
        }, 20);
    }

    static endGame(game){
        clearInterval(game);
        return null;
    }

    static pause() {
        GLib.gamePause = !GLib.gamePause;
    }
}

class Entity extends GLib {

    constructor(obj){
        super();
        this.posType = "px";
        this.x = 0;
        this.y =  0;
        this.width = 50;
        this.height = 50;
        this.color = "#000000";
        this.name = "default";
        this.entity = "";

        Object.assign(this,  obj);

        this.entity = document.createElement("div");
        document.body.appendChild(this.entity);

        this.entity.style.position = "absolute";
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
        this.entity.style.width = this.width+this.posType;
        this.entity.style.height = this.height+this.posType;
        this.entity.style.backgroundColor = this.color;
        this.entity.style.userSelect = "none";
        this.entity.innerHTML = this.name;
        
    }

    move(x, y){
        if(this.x+x<=GLib.w-this.width&&this.x+x>=0){
            this.x += x;
        } else if(this.x+x<0){
            this.x = 0;
        } else if(this.x+x>GLib.w-this.width){
            this.x = GLib.w-this.width;
        } else {
            this.x += 0;
        }
        if(this.y+y<=GLib.h-this.height&&this.y+y>=0){
            this.y += y;
        } else if(this.y+y<0){
            this.y = 0;
        } else if(this.y+y>GLib.h-this.height){
            this.y = GLib.h-this.height;
        } else {
            this.y += 0;
        }
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
    }

    moveTo(x, y){
        this.x = (x<=w-this.width&&x>=0) ? x : 0;
        this.y = (y<=h-this.height&&y>=0) ? y : 0;
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
    }

    moveLine(...destination){
        if(destination.length==1||destination.length==3){//target entity, optional(xModifiers, yModifiers)
            let mX = (destination[0].x-this.x)/Math.sqrt((destination[0].x-this.x)*(destination[0].x-this.x)+(destination[0].y-this.y)*(destination[0].y-this.y));
            let mY = (destination[0].y-this.y)/Math.sqrt((destination[0].x-this.x)*(destination[0].x-this.x)+(destination[0].y-this.y)*(destination[0].y-this.y));
            if(destination.length==1){
                this.move(mX, mY);
            } else {
                this.move(mX*destination[1], mY*destination[2]);
            }
        } else if(destination.length==2||destination.length==4){//target x, y, optional(xModifiers, yModifiers)
            let mX = (destination[0]-this.x)/Math.sqrt((destination[0]-this.x)*(destination[0]-this.x)+(destination[1]-this.y)*(destination[1]-this.y));
            let mY = (destination[1]-this.y)/Math.sqrt((destination[0]-this.x)*(destination[0]-this.x)+(destination[1]-this.y)*(destination[1]-this.y));
            if(destination.length==2){
                this.move(mX, mY);
            } else {
                this.move(mX*destination[2], mY*destination[3]);
            }
        }
    }

    moveLineRounded(...destination){
        if(destination.length==1||destination.length==3){//target entity, optional(xModifiers, yModifiers)
            let mX = Math.round((destination[0].x-this.x)/Math.sqrt((destination[0].x-this.x)*(destination[0].x-this.x)+(destination[0].y-this.y)*(destination[0].y-this.y)));
            let mY = Math.round((destination[0].y-this.y)/Math.sqrt((destination[0].x-this.x)*(destination[0].x-this.x)+(destination[0].y-this.y)*(destination[0].y-this.y)));
            if(destination.length==1){
                this.move(mX, mY);
            } else {
                this.move(mX*destination[1], mY*destination[2]);
            }
        } else if(destination.length==2||destination.length==4){//target x, y, optional(xModifiers, yModifiers)
            let mX = Math.round((destination[0]-this.x)/Math.sqrt((destination[0]-this.x)*(destination[0]-this.x)+(destination[1]-this.y)*(destination[1]-this.y)));
            let mY = Math.round((destination[1]-this.y)/Math.sqrt((destination[0]-this.x)*(destination[0]-this.x)+(destination[1]-this.y)*(destination[1]-this.y)));
            if(destination.length==2){
                this.move(mX, mY);
            } else {
                this.move(mX*destination[2], mY*destination[3]);
            }
        }
    }

    delete(delay, property){
        setTimeout(()=>{
            if(property!="all"){
                this.entity.removeAttribute(property);
            } else {
                this.entity.remove();
                delete this;
            }
        },delay);
    }

    async isTouching(element){
        return await GLib.isTouching(this, element);
    }

    async onTouch(element, func, not){
        this.touch = await this.isTouching(element);
        this.oT = setInterval(()=>{
            this.isTouching(element).then((value)=>{
                this.touch = value;
            });
            if(this.oTS==null){
                this.oTS = 0;
            }
            if(this.touch){
                if(this.oTS==0||this.oTS==2){
                    this.oTS = 1;
                    if(func!=null){
                        func();
                    }
                }
            } else {
                if(this.oTS==1){
                    this.oTS = 2;
                    if(not!=null){
                        not();
                    }
                }
            }
            
        });
    }
    async whileTouching(element, func, not){
        this.touch = await this.isTouching(element);
        this.wT = setInterval(()=>{
            this.isTouching(element).then((value)=>{
                this.touch = value;
            });
            if(this.touch){
                if(func!=null){
                    func();
                }
            } else {
                if(not!=null){
                    not();
                }
            }
        });
    }
}

// Example
let index = 0;
const DISPLAY = new Entity({color: "#123456", name: "no"});
const TOUCHING = new Entity({x: 100, y: 100});
DISPLAY.onTouch(TOUCHING, ()=>{
    alert("touch");
});
let gameLoop = GLib.startGame((mult)=>{
    
    if(GLib.Key.isDown(GLib.Key.up)){
        index++;
        DISPLAY.entity.innerHTML = `${index}, ${GLib.w}`;
        DISPLAY.move(0, -6);
    }
    if(GLib.Key.isDown(GLib.Key.down)){
        DISPLAY.move(0, 6);
    }
    if(GLib.Key.isDown(GLib.Key.left)){
        DISPLAY.move(-6, 0);
    }
    if(GLib.Key.isDown(GLib.Key.right)){
        DISPLAY.move(6, 0);
    }

    if(Math.abs(500-DISPLAY.x)<=1&&Math.abs(300-DISPLAY.y)<=1){
        DISPLAY.entity.innerHTML = "done";
        gameLoop = GLib.endGame(gameLoop);
    }
}, 3);
