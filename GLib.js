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
        if(this.x+x<=w-this.width&&this.x+x>=0){
            this.x += x;
        } else if(this.x+x<0){
            this.x = 0;
        } else if(this.x+x>w-this.width){
            this.x = w-this.width;
        } else {
            this.x += 0;
        }
        if(this.y+y<=h-this.height&&this.y+y>=0){
            this.y += y;
        } else if(this.y+y<0){
            this.y = 0;
        } else if(this.y+y>h-this.height){
            this.y = h-this.height;
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
            this.move(((destination.length==1) ? mX : mX*destination[1]), ((destination.length==1) ? mY : mY*destination[2]));
        } else if(destination.length==2||destination.length==4){//target x, y, optional(xModifiers, yModifiers)
            let mX = (destination[0]-this.x)/Math.sqrt((destination[0]-this.x)*(destination[0]-this.x)+(destination[1]-this.y)*(destination[1]-this.y));
            let mY = (destination[1]-this.y)/Math.sqrt((destination[0]-this.x)*(destination[0]-this.x)+(destination[1]-this.y)*(destination[1]-this.y));
            this.move(((destination.length==1) ? mX : mX*destination[2]), ((destination.length==1) ? mY : mY*destination[3]));
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
}

// Example
let index = 0;
const DISPLAY = new Entity({color: "#123456", name: "no"});
let gameLoop = GLib.startGame(()=>{
    if(GLib.Key.isDown(GLib.Key.up)){
        index++;
        DISPLAY.entity.innerHTML = `${index}, ${GLib.w}`;
    }

    if(index==10){
        DISPLAY.entity.innerHTML = "done";
        gameLoop = GLib.endGame(gameLoop);
    }
});
