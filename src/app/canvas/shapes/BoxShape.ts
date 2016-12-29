import Point from '../Point';
/**
 * Created by gcannata on 13/06/2015.
 */
import BaseShape from './BaseShape';
import Stroke from '../PointsList';

import Brush from '../Brush';


export class BoxShape extends BaseShape {

    _stroke:Stroke;
    __pivot:Point;
    constructor(brush:Brush, stroke:Stroke=null){
        super(brush);

        this._stroke = stroke;
    }

    draw(ctx:any){
        if(this._stroke && this._stroke.length>0){
            this.brush.apply(ctx);
            ctx.beginPath();
            //ctx.rect(this._rect.left,this._rect.top,this._rect.width,this._rect.height);
            ctx.moveTo(this._stroke[0].x,this._stroke[0].y);
            ctx.lineTo(this._stroke[1].x, this._stroke[1].y);
            ctx.lineTo(this._stroke[2].x, this._stroke[2].y);
            ctx.lineTo(this._stroke[3].x, this._stroke[3].y);
            ctx.lineTo(this._stroke[0].x, this._stroke[0].y);
            ctx.stroke();
            if(this.brush.FillStyle){
                ctx.fill();
            }
        }

    }

    regularize(){
        //align edges to multiple of 15 degrees
        var dir = this._stroke[1].diff(this._stroke[0]);
        dir.normalize();
        var rot = Math.acos( dir.dot(new Point(0,-1)))*180/Math.PI;
        var rrot = Math.round(rot/15)*15;
        var d = (rrot-rot)*Math.PI/180;
        var center = this._stroke[2].median(this._stroke[0]);
        for(var i =0;i<4;i++){
            this._stroke[i].rotate(center,d);
        }

        //if edges are similar length, consider it a square
        var va = this._stroke[1].diff(this._stroke[0]);
        var a = va.length;
        var vb = this._stroke[3].diff(this._stroke[0]);
        var b = vb.length;
        var diff = Math.abs(a-b)/(a+b);
        if(diff<0.15){
            var size = (a+b)/2;
            var dir_a = va.clone()
                dir_a.normalize()
                dir_a.scale((a-size)/2);
            var dir_b = vb.clone()
                dir_b.normalize()
                dir_b.scale((b-size)/2);

            this._stroke[0].add(dir_a);
            this._stroke[0].add(dir_b);
            this._stroke[1].sub(dir_a);
            this._stroke[1].add(dir_b);
            this._stroke[2].sub(dir_a);
            this._stroke[2].sub(dir_b);
            this._stroke[3].add(dir_a);
            this._stroke[3].sub(dir_b);
        }


    }

    hasContent(): boolean {

        return <boolean><any>(this._stroke && this._stroke.length===4);
    }


    startEdit(options:any){
        this.__pivot = new Point(options.x,options.y);
        this._stroke = [this.__pivot.clone(), this.__pivot.clone(), this.__pivot.clone(), this.__pivot.clone()];
    }

    finishEdit(options:any){

    }

    onMouseMove(p:Point){
        if(p.x>this.__pivot.x){
            //this._rect.right = p.x;
            this._stroke[2].x = p.x;
            this._stroke[3].x = p.x;
        } else {
            //this._rect.right = this._rect.left;
            //this._rect.left = p.x;
            this._stroke[0].x = p.x;
            this._stroke[1].x = p.x;       }

        if(p.y>this.__pivot.y){
            //this._rect.bottom = p.y;

            this._stroke[1].y = p.y;
            this._stroke[2].y = p.y;
        } else {
            //this._rect.bottom = this._rect.top;
            //this._rect.top = p.y;
            this._stroke[0].y = p.y;
            this._stroke[3].y = p.y;
        }
    }

    intersectWithCircle(center:Point, radius:number){
        var a = this._stroke[0];
        var ab = this._stroke[1].diff(a);
        var ad = this._stroke[3].diff(a);

        var ac = center.diff(a);
        //we project center on ab
        var cab = ac.dot(ab);
        var cad = ac.dot(ad);
        return (0 < cab && cab < ab.dot(ab)) &&
            (0 < cad && cad < ad.dot(ad));
    }
}

export default BoxShape;