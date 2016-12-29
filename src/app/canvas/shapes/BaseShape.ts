/**
 * Created by gcannata on 12/06/2015.
 */

import Brush from '../Brush';
import Point from '../Point';
import Rect from '../Rect';

export default class BaseShape {

    _brush:Brush;

    constructor(brush:Brush){
        //canvas?
        this._brush = brush;
    }

    draw(ctx:any){

    }

    startEdit(options:any){

    }

    onMouseMove(p:Point){

    }

    finishEdit(options:any=undefined){

    }

    hasContent():boolean{
        return false;
    }

    getBoundingBox():Rect{
        return new Rect(0,0,0,0);
    }

    regularize(){

    }

    intersectWithCircle(center:Point, radius:number){
        return false;
    }

    get brush(){
        return this._brush;
    }


    static calculateAngle(a:Point, b:Point){
        var x = b.x-a.x;
        var y = b.y-a.y;
        var r = y/x;
        return r;
    }

    static calculateSqDist(a:Point, b:Point){
        var x = b.x-a.x;
        var y = b.y-a.y;
        var r = x*x+y*y;
        return r;
    }
}
