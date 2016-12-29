import Brush from '../Brush';
import BaseShape from './BaseShape';
import Point from '../Point';
/**
 * Created by Gabriele on 14/06/2015.
 */
/**
 * Created by gcannata on 13/06/2015.
 */


function distToSegmentSquared(p, v, w) {
    var l2 = v.dist2(w);
    if (l2 == 0) return p.dist2(v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return p.dist2(v);
    if (t > 1) return p.dist2(w);
    return p.dist2(new Point(v.x + t * (w.x - v.x),
        v.y + t * (w.y - v.y)));

}

class LineShape extends BaseShape {

    _from:Point;
    _to:Point;

    constructor(brush:Brush,from:Point=new Point(),to:Point=new Point()){
        super(brush);

        this._from = from;
        this._to = to;
    }

    draw(ctx:any){
        this.brush.apply(ctx);
        ctx.beginPath();

        ctx.moveTo(this._from.x, this._from.y);
        ctx.lineTo(this._to.x, this._to.y);

        ctx.stroke();
    }

    hasContent(){

        return (this._from.x != this._to.x) || (this._from.y != this._to.y);
    }


    startEdit(options:any){

        this._from =  new Point(options.x,options.y);
        this._to = this._from;
    }

    finishEdit(options:any){

    }

    onMouseMove(p:Point){
        if(p)
            this._to = p;
    }

    intersectWithCircle(center:Point, radius:number){
        var d2 = distToSegmentSquared(center,this._from, this._to);
        return (d2<radius*radius);

    }
}

export default LineShape;