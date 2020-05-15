class dataset{
    constructor(x,y,parent,scalex,scaley){
        if(scalex === undefined && scaley === undefined) scalex = scaley = 1;

        this.x = x*scalex; //x coordinate
        this.y = y*scaley; //y coordinate
        this.color = []; //this object color
        this.fillcolor = [];
        this.distpar = 0; //this object's distance to parent
        this.parent = parent; //this object's parent
    }

    //sets color
    setcolor(color,incolor){
        for(let i = 0; i < color.length; i++) this.color[i] = color[i];
        if(incolor === undefined) incolor = [255, 255, 255];
        else if(incolor !== typeof "") for(let i = 0; i < incolor.length; i++) this.fillcolor[i] = incolor[i];
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

            stroke(this.fillcolor[0],this.fillcolor[1],this.fillcolor[2]);
            strokeWeight(6);
            point(this.x, this.y);
        }
    }
}