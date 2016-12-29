/**
 * Created by gcannata on 08/06/2015.
 */
export default class Point {
    x:number;
    y:number;

    constructor(x:number=0, y:number=0){
        this.x = x;
        this.y = y;
    }

    normalize(){
        var len = this.length;
        this.x /= len;
        this.y /= len;
    }

    diff(p:Point){
        return new Point(this.x-p.x, this.y-p.y);
    }

    add(p:Point){

            this.x += p.x;
            this.y += p.y;

    }

    sub(p:Point){

        this.x -= p.x;
        this.y -= p.y;

    }

    median(p:Point){
        return new Point((this.x+p.x)/2, (this.y+p.y)/2);
    }

    dist(p:Point){
        var x = this.x-p.x;
        var y = this.y-p.y;
        return Math.sqrt(x*x+y*y);
    }

    dist2(p:Point){
        var x = this.x-p.x;
        var y = this.y-p.y;
        return (x*x+y*y);
    }

    dot(p:Point){
        return this.x*p.x+this.y*p.y;
    }

    clone(){
        return new Point(this.x, this.y);
    }


    orthogonal(){
        return new Point(this.y, -this.x);
    }

    negate(){
        this.x = -this.x;
        this.y = -this.y;
    }

    rotate(pivot:Point, angle:number){
        this.x = pivot.x + (this.x-pivot.x)*Math.cos(angle) - (this.y-pivot.y)*Math.sin(angle);

        this.y = pivot.y + (this.x-pivot.x)*Math.sin(angle) + (this.y-pivot.y)*Math.cos(angle);
    }

    scale(len:number){
        this.x *= len;
        this.y *= len;
    }


    get length(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public static IntersectLines(start0, dir0, start1, dir1)
    {
        var dd = dir0.x*dir1.y-dir0.y*dir1.x;
        // dd=0 => lines are parallel. we don't care as our lines are never parallel.
        var dx = start1.x-start0.x;
        var dy = start1.y-start0.y;
        var t = (dx*dir1.y-dy*dir1.x)/dd;
        return new Point(start0.x+t*dir0.x, start0.y+t*dir0.y);
    }
}

