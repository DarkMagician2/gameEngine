class GLib {
    static w = window.innerWidth; // width of window
    static h = window.innerHeight; // height of window
    static gamePause = false; // a boolean if the game is paused
    static tick = 0; // a tick counter
    static entities = {};
    static player;

    // keyup and keydown detection
    static up = window.addEventListener("keyup", function(event) { 
        GLib.Key.keyup(event);
    });
    static down = window.addEventListener("keydown", function(event) {
        GLib.Key.keydown(event);
    });

    // keybinds
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
    
    // random color generator
    static genRanHex = (size)=>{
        return [...Array(size)].map(()=>{
            return Math.round(Math.random() * 16).toString(16)
        }).join('')
    }

    // detects if two elements touch
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

    // creates a new game loop
    static startGame(player, func, ...params){
        GLib.player = player;
        return setInterval(()=>{
            GLib.w = window.innerWidth;
            GLib.h = window.innerHeight;
            if(!GLib.gamePause){
                GLib.tick++;
                func(params);
            }
        }, 10);
    }

    // ends a game loop
    static endGame(game){
        clearInterval(game);
        return null;
    }

    // pause/unpause the game
    static pause() {
        GLib.gamePause = !GLib.gamePause;
    }
}

// a subclass of GLib made for creating sprites
class Entity extends GLib {

    // base instructions for when an instance of Entity is created
    constructor(obj){
        super();
        GLib.entities[Object.keys(GLib.entities).length] = this;
        this.pos = Entity.entitiesLength-1;
        this.posType = "px";
        this.x = 0;
        this.y =  0;
        this.width = 50;
        this.height = 50;
        this.color = "#000000";
        this.name = "default";
        this.entity = "";
        this.moveable = false;
        this.nU = false;
        this.nD = false;
        this.nL = false;
        this.nR = false;


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


    static get entitiesLength(){
        return Object.keys(GLib.entities).length;
    }


    get index(){
        for(let i=0;i<Entity.entitiesLength;i++){
            if(GLib.entities[i]==this){
                return i;
            }
        }
    }
    
    // allows movement of an instance
    move(x, y){
        this.nextPos = {};
        this.nextPos = Object.assign({}, this);
        this.nextPos.moveX = (x>0) ? 0 : (x<0) ? 1 : 2; // 0 = right, 1 = left
        this.nextPos.moveY = (y>0) ? 0 : (y<0) ? 1 : 2; // 0 = down, 1 = up
        this.nextPos.x += x;
        // console.log(`${this.nextPos.moveX}, ${this.nextPos.moveY}`);
        if(this.nextPos.moveX==0){
            Object.keys(GLib.entities).forEach((key)=>{
                if(GLib.entities[key]!=this&&GLib.entities[key].moveable){
                    this.isTouching(GLib.entities[key]).then((value)=>{
                        if(value){
                            this.nR = true;
                        } else if(this.nextPos.x+this.width>GLib.w){
                            this.nR = true;
                        } else {
                            this.nR = false;
                        }
                    })
                }
            });
        }
        if(this.nextPos.moveX==1){
            Object.keys(GLib.entities).forEach((key)=>{
                if(GLib.entities[key]!=this&&GLib.entities[key].moveable){
                    this.isTouching(GLib.entities[key]).then((value)=>{
                        if(value){
                            this.nL = true;
                        } else if(this.nextPos.x<0){
                            this.nL = true;
                        } else {
                            this.nL = false;
                        }
                    })
                }
            });
        }
        this.nextPos.x = this.x;
        this.nextPos.y += y;
        if(this.nextPos.moveY==0){
            Object.keys(GLib.entities).forEach((key)=>{
                if(GLib.entities[key]!=this&&GLib.entities[key].moveable){
                    this.isTouching(GLib.entities[key]).then((value)=>{
                        if(value){
                            this.nD = true;
                        } else if(this.nextPos.y+this.height>GLib.h){
                            this.nD = true;
                        } else {
                            this.nD = false;
                        }
                    })
                }
            });
        }
        if(this.nextPos.moveY==1){
            Object.keys(GLib.entities).forEach((key)=>{
                if(GLib.entities[key]!=this&&GLib.entities[key].moveable){
                    this.isTouching(GLib.entities[key]).then((value)=>{
                        if(value){
                            this.nU = true;
                        } else if(this.nextPos.y<0){
                            this.nU = true;
                        } else {
                            this.nU = false;
                        }
                    })
                }
            });
        }
        if(this.x+x<=GLib.w-this.width&&this.x+x>=0){
            this.x += (x<0&&this.nL) ? 0 : (x>0&&this.nR) ? 0 : (x!=0) ? x : 0;
        } else if(this.x+x<0){
            this.x = 0;
        } else if(this.x+x>GLib.w-this.width){
            this.x = GLib.w-this.width;
        }
        if(this.y+y<=GLib.h-this.height&&this.y+y>=0){
            this.y += (y<0&&!this.nU) ? y : (y>0&&!this.nD) ? y : 0;
        } else if(this.y+y<0){
            this.y = 0;
        } else if(this.y+y>GLib.h-this.height){
            this.y = GLib.h-this.height;
        }
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
    }

    // allows movement to a set position
    moveTo(x, y){
        this.x = (x<=GLib.w-this.width&&x>=0) ? x : 0;
        this.y = (y<=GLib.h-this.height&&y>=0) ? y : 0;
        this.entity.style.left = this.x+this.posType;
        this.entity.style.top = this.y+this.posType;
    }

    // allows an instance to move in a smooth line towards another instance or a set position
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

    // allows an instance to move in a less smooth but easier to work with line towards another instance or a set position
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


    

    async makeMoveable(playerSpeed){
        this.moveable = !this.moveable;
        this.m = setInterval(()=>{
            if(GLib.entities[this.index]!=this){
                clearInterval(this.m);
            }
            for(let i in GLib.entities){
                if(GLib.entities[i]!=this&&GLib.entities[i].moveable==true){
                    let nextPos;
                    nextPos = Object.assign({}, GLib.entities[i]);
                    nextPos.y -= playerSpeed;
                    this.isTouching(nextPos).then((value)=>{
                        if(value){
                            this.move(0, -1*playerSpeed);
                        }
                    });
                    if(GLib.Key.isDown(GLib.Key.down)){
                        nextPos = Object.assign({}, GLib.entities[i]);
                        nextPos.y += playerSpeed;
                        this.isTouching(nextPos).then((value)=>{
                            if(value){
                                this.move(0, playerSpeed);
                            }
                        });
                    }
                    if(GLib.Key.isDown(GLib.Key.left)){
                        nextPos = Object.assign({}, GLib.entities[i]);
                        nextPos.x -= playerSpeed;
                        this.isTouching(nextPos).then((value)=>{
                            if(value){
                                this.move(-1*playerSpeed, 0);
                            }
                        });
                    }
                    if(GLib.Key.isDown(GLib.Key.right)){
                        nextPos = Object.assign({}, GLib.entities[i]);
                        nextPos.x += playerSpeed;
                        this.isTouching(nextPos).then((value)=>{
                            if(value){
                                this.move(playerSpeed, 0);
                            }
                        });
                    }
                }
            }
        }, 10);
    }

    // allows the deletion of an instance
    delete(delay, property){
        setTimeout(()=>{
            if(property!="all"){
                this.entity.removeAttribute(property);
            } else {
                this.entity.remove();
                delete GLib.entities[this.index];

                let i = 0;
                for (let key in GLib.entities) {
                    if(key!=i){
                        GLib.entities[i] = GLib.entities[key];
                        delete GLib.entities[key];
                        GLib.entities[i].pos = i;
                    }
                    i++;
                }
            }
        },delay);
    }

    // a function to check if the instance is touching another instance
    async isTouching(element){
        return await GLib.isTouching(this, element);
    }

    // a function which allows some code to be run when an instance touches and/or leaves an instance
    async onTouch(element, func, not){
        this.oTS = 0;
        this.oT = setInterval(()=>{
            if(GLib.entities[element.index]!=element){
                clearInterval(this.oT);
            }
            this.isTouching(element).then((value)=>{
                this.touch = value;
            });
            if(this.touch){
                if(this.oTS==0||this.oTS==2){
                    this.oTS = 1;
                    if(func!=null){
                        func();
                    }
                }
            } else if(this.oTS==1){
                this.oTS = 2;
                if(not!=null){
                    not();
                }
            }
        }, 10);
    }

    // a function which allows some code to be run when an instance is touching and/or not touching an instance
    async whileTouching(element, func, not){
        this.wT = setInterval(()=>{
            console.log(element);
            if(GLib.entities[element.index]!=element){
                clearInterval(this.wT);
            }
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
        }, 10);
    }
}

// Example
let index = 0;
const DISPLAY = new Entity({color: "#123456", name: "no"});
const TOUCHING = new Entity({x: 100, y: 100});
const TEST = new Entity({x: 200, y: 200, width: 500, height: 1000});
TOUCHING.makeMoveable(3);
DISPLAY.makeMoveable(3);
TEST.onTouch(TOUCHING, ()=>{
    DISPLAY.moveTo(0, 0);
    TOUCHING.delete(0, "all");
});
let gameLoop = GLib.startGame(DISPLAY, (mult)=>{
    console.log(DISPLAY.nD, DISPLAY.nL, DISPLAY.nR, DISPLAY.nU);
    DISPLAY.entity.innerHTML = `${DISPLAY.nU}, ${GLib.w}`;
    if(GLib.Key.isDown(GLib.Key.up)){
        index++;
        DISPLAY.move(0, -3);
    }
    if(GLib.Key.isDown(GLib.Key.down)){
        DISPLAY.move(0, 3);
    }
    if(GLib.Key.isDown(GLib.Key.left)){
        DISPLAY.move(-3, 0);
    }
    if(GLib.Key.isDown(GLib.Key.right)){
        DISPLAY.move(3, 0);
    }
    if(index==1000){
        DISPLAY.entity.innerHTML = "done";
        gameLoop = GLib.endGame(gameLoop);
    }
}, 3);
