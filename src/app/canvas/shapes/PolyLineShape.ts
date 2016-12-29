import Brush from '../Brush';
import Point from '../Point';
import Stroke from '../PointsList';
import BaseShape from './BaseShape';
/**
 * Created by gcannata on 12/06/2015.
 */

class PolyLineShape extends BaseShape {

    _stroke:Stroke;
    __tmpStroke:Stroke;
    __pivot:Point;
    __b:Point;
    _n:number;
    private _closed:boolean;
    constructor(brush:Brush, stroke:Stroke=null, closed:boolean=false){
        super(brush);
        this._stroke = stroke;
        this._closed = closed;
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
        this.brush.apply(ctx);
        var start = 0;
        var stroke = this.stroke;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for(var i=1;i<stroke.length;i++){

            ctx.lineTo(stroke[i].x, stroke[i].y);

        }
        if(this._closed) ctx.lineTo(stroke[0].x, stroke[0].y);
        ctx.stroke();
        ctx.closePath();
    }

    hasContent(){

        return <boolean><any>(this._stroke && this._stroke.length);
    }


    startEdit(options:any){
        this._n=0;
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
            this._n++;
        } else {
            //update b point
            this.__b = p;
        }
        this._stroke[this._n+1]=p;
        this.__tmpStroke.push(p);
    }

}

export default PolyLineShape;