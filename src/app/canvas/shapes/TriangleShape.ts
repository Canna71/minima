import Brush from '../Brush';
import Point from '../Point';
import Stroke from '../PointsList';
import BaseShape from './BaseShape';
/**
 * Created by gcannata on 12/06/2015.
 */



function ptInTriangle(p, p0, p1, p2) {
    var A = 1/2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    var sign = A < 0 ? -1 : 1;
    var s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    var t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

    return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}

export class TriangleShape extends BaseShape {

    _stroke:Stroke;
    __tmpStroke:Stroke;
    __pivot:Point;
    __b:Point;
    __n:number;
    constructor(brush:Brush, stroke:Stroke=null){
        super(brush);
        this._stroke = stroke;
    }

    get stroke(){
        return this._stroke;
    }

    get length(){
        return this._stroke.length;
    }

    push(p:Point){
        this._stroke.push(p);
    }

    draw(ctx:any){
        if(this.brush)     this.brush.apply(ctx);
        var start = 0;
        var stroke = this.stroke;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for(var i=1;i<stroke.length;i++){

            ctx.lineTo(stroke[i].x, stroke[i].y);

        }
        ctx.lineTo(stroke[0].x, stroke[0].y);
        ctx.stroke();
        ctx.closePath();
        if(this.brush.FillStyle){
            ctx.fill();
        }
    }

    hasContent(){

        return <boolean><any>(this._stroke && this._stroke.length);
    }

    regularize(){
        //find similar edges
        var loop = true;
        while(loop){
            loop=false;
            for(var i=0;i<3;i++){
                var edge1 = this._stroke[(i+1)%3].diff(this._stroke[i]);
                var edge2 = this._stroke[(i+2)%3].diff(this._stroke[i]);
                var l1 = edge1.length;
                var l2 = edge2.length;
                var diff = Math.abs(l1-l2)/(l1+l2);
                if(diff < 0.01 && diff > 0.0001){
                    var l = (l1+l2)/2;
                    var d1 = edge1.clone();
                    d1.normalize();
                    d1.scale(l-l1);
                    this._stroke[(i+1)%3].add(d1);
                    var d2 = edge2.clone();
                    d2.normalize();
                    d2.scale(l-l2);
                    this._stroke[(i+2)%3].add(d2);
                    loop=true;
                }
            }
        }

        this.regularize2();
    }

    regularize2(){
        var loop:boolean=true;
        while(loop){
            loop = false;
            for(var i=0;i<3;i++){
                var edge = this._stroke[(i+1)%3].diff(this._stroke[i]);
                var dir = edge.clone();
                dir.normalize();
                var rot =  Math.acos( dir.dot(new Point(1,0)))*180/Math.PI;
                if(dir.y<0) rot=-rot;
                var rrot = Math.round(rot/15)*15;
                var d = (rrot-rot)*Math.PI/180;

                if(Math.abs(d)>0.01){

                    var center = this._stroke[(i+1)%3].median(this._stroke[i]);
                    var start = this._stroke[(i+2)%3];
                    var dir1 = this._stroke[i].diff(start);
                    var dir2 = this._stroke[(i+1)%3].diff(start);
                    dir.rotate(new Point(0,0),d);

                    this._stroke[i] = Point.IntersectLines(start,dir1,center,dir);
                    this._stroke[(i+1)%3] = Point.IntersectLines(start,dir2,center,dir);
                    loop = true;
                }

            }

        }

    }


    startEdit(options:any){
        this.__n=0;
        this._stroke =  [new Point(options.x,options.y)];
        this.__tmpStroke = [new Point(options.x,options.y)];
        this.__pivot = this._stroke[0];
    }

    finishEdit(options:any){
        this._stroke.push(this._stroke[this._stroke.length-1]);
    }

    onMouseMove(p:Point){

        var a = BaseShape.calculateSqDist(this.__pivot,this.__tmpStroke[this.__tmpStroke.length-1]);
        var n = BaseShape.calculateSqDist(this.__pivot,p);
        if(this._stroke.length===2 && n<a){
            //We have a new point
            this.__n++;
        } else {
            //update b point
            this.__b = p;
        }
        this._stroke[this.__n+1]=p;
        this.__tmpStroke.push(p);
    }

    intersectWithCircle(center:Point, radius:number){

        return ptInTriangle(center, this.stroke[0],this.stroke[1],this.stroke[2]);
    }

}

export default TriangleShape;