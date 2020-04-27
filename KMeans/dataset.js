class dataset{
    constructor(x,y,parent){
        this.x = x; //x coordinate
        this.y = y; //y coordinate
        this.color = []; //this object color
        this.distpar = 0; //this object's distance to parent
        this.parent = parent; //this object's parent
    }

    //sets color
    setcolor(color){
        for(let i = 0; i < color.length; i++){
            this.color[i] = color[i];
        }
    }

    //sets new coordinate
    chcoo(x,y){
        this.x = x;
        this.y = y;
    }

    //draws new coordinate to screen
    update(type){
        if(type==="cluster"){
            stroke(255);
            strokeWeight(20);
            point(this.x, this.y);

            stroke(this.color[0], this.color[1], this.color[2]);
            strokeWeight(14);
            point(this.x, this.y);
        } else if(type==="data"){
            stroke(this.color[0], this.color[1], this.color[2]);
            strokeWeight(14);
            point(this.x, this.y);

            stroke(255);
            strokeWeight(4);
            point(this.x, this.y);
        }
    }
}