import Brush from '../Brush';
import Point from '../Point';
import BaseShape from './BaseShape';
/**
 * Created by gcannata on 13/06/2015.
 */


class EllipseShape extends BaseShape {

    _center:Point;
    _a:number;
    _b:number;
    _rot:number;
    private __pivot:Point;

    constructor(brush:Brush, center:Point=null,a:number=0,b:number=0, rot:number=0){
        super(brush);

            this._center = center;
            this._a = a;
            this._b = b;
            this._rot = rot;

    }

    draw(ctx:any){
        this.brush.apply(ctx);
        ctx.beginPath();
        ctx.ellipse(this._center.x,this._center.y,this._a, this._b,this._rot,0,2*Math.PI,false);
        ctx.stroke();
        ctx.closePath();
        if(this.brush.FillStyle){
            ctx.fill();
        }
    }
    hasContent():boolean{
        return <boolean><any>(this._center && this._a && this._b);
    }

    regularize(){
        var degrot = this._rot*180/Math.PI;
        degrot = Math.round(degrot/15)*15;
        this._rot = degrot*Math.PI/180;
        //var d = (rrot-rot)*Math.PI/180;
    }

    startEdit(options:any){
        this.__pivot = new Point(options.x,options.y);
        this._center = this.__pivot.clone();
    }

    finishEdit(options:any){

    }

    onMouseMove(p:Point){
        this._a = (p.x-this.__pivot.x)*0.5;
        this._center.x = this.__pivot.x+this._a;
        if(p.x>this.__pivot.x){
            //this._rect.right = p.x;
            //this._a = (p.x-this.__pivot.x)*0.5;

        } else {
            //this._rect.right = this._rect.left;

            this._a = -this._a;
        }

        this._b = (p.y-this.__pivot.y)*0.5;
        this._center.y = this.__pivot.y+this._b;
        if(p.y>this.__pivot.y){
            //this._rect.bottom = p.y;

        } else {
            //this._rect.bottom = this._rect.top;

            this._b = -this._b;
        }

        //this._a = this._rect.width/2;
        //this._b = this._rect.height/2;
    }

    intersectWithCircle(center:Point, radius:number){

        var cosa=Math.cos(this._rot);
        var sina=Math.sin(this._rot);
        var aa=this._a*this._a;
        var bb=this._b*this._b;

        var a =Math.pow(cosa*(center.x-this._center.x)+sina*(center.y-this._center.y),2);
        var b =Math.pow(sina*(center.x-this._center.x)-cosa*(center.y-this._center.y),2);

        var ellipse=(a/aa)+(b/bb);

        return ellipse <= 1;
    }

}

export default EllipseShape;