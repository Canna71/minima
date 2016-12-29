import ShapeRecognizer from '../ShapeRecognizer';
import Point from '../Point';
import Brush from '../Brush';
import Rect from '../Rect';
import Stroke from '../PointsList';
import BaseShape from './BaseShape';
/**
 * Created by gcannata on 12/06/2015.
 */



class StrokeShape extends BaseShape {

    _stroke:Stroke;
    __drawing:boolean = false;
    __smoothing:number = 1.2;
    __previousSmooth:number[] = null;
    __bbox:Rect;

    constructor(brush:Brush, stroke:Stroke=[]){
        super(brush);
        this._stroke = stroke;
    }

    get stroke(){
        return this._stroke;
    }

    get length(){
        return this._stroke.length;
    }

    hasContent(){
        return this._stroke.length>1;
    }
    push(p:Point){
        this._stroke.push(p);
    }

    startEdit(options:any){
        this._stroke = [new Point(options.x,options.y)];
        this.__drawing = true;
        this.__bbox = undefined;
    }

    finishEdit(options:any){
        this.__drawing = false;
        var stroke = this._stroke;
        this._stroke = ShapeRecognizer.simplifyStroke(this._stroke, this.__smoothing).map(function(i){
            return stroke[i];
        });

        this.__bbox = ShapeRecognizer.calcBoundingBox(this._stroke);
    }

    onMouseMove(p:Point){
        this._stroke.push(p);
    }

    draw(ctx:any){
        this.brush.apply(ctx);
        var start = 0;
        var stroke =  this._stroke;
        var maxPrevious = this.__previousSmooth?this.__previousSmooth[this.__previousSmooth.length-1]:-1;
        var self = this;
        if(this.__drawing && stroke.length > 10){
            var smooth = ShapeRecognizer.simplifyStroke(this._stroke, this.__smoothing);

            stroke = smooth.map(function(i){

                return stroke[i];
            });
            self.__previousSmooth = smooth;
        }
        ctx.beginPath();
        ctx.moveTo(stroke[start].x, stroke[start].y);
        if (stroke.length > start+2) {


            var i;

            for ( i = start+1; i < stroke.length-2;++i) {
                var p = stroke[i];
                var p2 = stroke[i+1];
                var ix = (p.x*0.5+p2.x*0.5);
                var iy = (p.y*0.5+p2.y*0.5);


                ctx.quadraticCurveTo(p.x,p.y,ix,iy);
                //this._ctx.lineTo(stroke[i].x,stroke[i].y);

            }
            //console.log("i=%d length=%d",i,stroke.length);
            if(i+1<stroke.length){
                ctx.quadraticCurveTo(
                    stroke[i].x,
                    stroke[i].y,
                    stroke[i + 1].x,
                    stroke[i + 1].y
                );
            }




        }
        else if (stroke.length === 2){
            ctx.lineTo(stroke[1].x,stroke[1].y);
        }
        if(stroke.length===1 && start===0){
            ctx.fillRect(stroke[start].x, stroke[start].y,1,1);
        }
        ctx.stroke();
        ctx.closePath();
    }

    intersectWithCircle(center:Point, radius:number){
        for(var i=0;i<this._stroke.length;i++){
            if(center.dist(this._stroke[i])<radius){
                return true;
            }
        }
        return false;
    }

    getBoundingBox():Rect{
        return this.__bbox;
    }

}

export default StrokeShape;