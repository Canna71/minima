import Canvas from '../canvas';
import Brush from '../Brush';
import Point from '../Point';
import BaseShape from './BaseShape';
/**
 * Created by Gabriele on 26/08/2015.
 */


class Eraser extends BaseShape {
    private _canvas:Canvas;
    private _pos:Point;
    private _shapes;
    private _erased;

    constructor(brush:Brush, canvas:any){
        super(brush);
        this._canvas = canvas;
    }

    draw(ctx:any){

        this.brush.apply(ctx);
        ctx.beginPath();
        ctx.arc(this._pos.x, this._pos.y, 10, 0, 2 * Math.PI, false);
        ctx.stroke();

    }

    startEdit(options:any){
        this._shapes = this._canvas.shapes.slice();
        this._erased = false;
    }

    hasContent():boolean{
        return this._erased;
    }

    onMouseMove(p:Point){
        this._pos = p;


        for(var i=0;i<this._shapes.length;i++){
            if(this._shapes[i].intersectWithCircle(p,10)){
                this._erased = true;
                this._canvas.removeShape(this._shapes[i]);
                this._canvas.redraw();
            }
        }
    }
}

export default Eraser;