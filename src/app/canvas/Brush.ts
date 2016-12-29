/**
 * Created by gcannata on 12/06/2015.
 */
export default class Brush { 

    constructor(lineWidth:number=3, strokeStyle="black", fillStyle="rgba(200,200,200,0.4)") {
        this.LineWidth=lineWidth;
        this.StrokeStyle=strokeStyle;
        this.FillStyle = fillStyle;
    }

    LineWidth: Number;
    StrokeStyle: any;
    FillStyle: any;

    apply(ctx:any){
        ctx.lineWidth = this.LineWidth;
        ctx.strokeStyle = this.StrokeStyle;
        ctx.fillStyle = this.FillStyle;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
    }
}

