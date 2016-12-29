import { TriangleShape } from './shapes/TriangleShape';
import EllipseShape from './shapes/EllipseShape';
import Rect from './Rect';
import { BoxShape } from './shapes';
import Point from './Point';
import Brush from './Brush';
import LineShape from './shapes/LineShape';
import Stroke from './PointsList';
/**
 * Created by gcannata on 08/06/2015.
 */


class ShapeRecognizer {
    //thinness, triratio, rectratio, achtrre, atrre
    static table = [
    ['circle',{a:1.2,b:12.6,c:0.3},undefined,undefined,undefined,undefined],
    ['ellipse',undefined,undefined,{a:0.7,b:0.81,c:0.02},{a:1.3,b:1.75,c:0.05},undefined],
    ['line',{a:1,b:190,c:80},undefined,undefined,undefined,undefined],
    ['rectangle',{a:0.5,b:18,c:4},{a:1,b:0.51,c:0.2},{a:1.5,b:0.98,c:0.05},undefined,undefined],
    ['triangle',undefined,{a:1,b:0.92,c:0.02},undefined,undefined,undefined]
    ];

    public static recognizeStroke(stroke:Stroke, ctx:any) : any{



        //try with the circle
        //var area = this.calcPolyArea(stroke);
        //test
        //var bbox = this.recognizeBox(stroke);
        //var ell = this.recognizeEllipse(stroke);

        (<any>window).dbgctx = ctx;

        var perimeter = this.calcStrokeLength(stroke);

        var error = perimeter*0.01;
        var closingError = perimeter*0.03;
        var closed = false;
        if(this.dist(stroke[0],stroke[stroke.length-1])<closingError){
            var median = stroke[0].median(stroke[stroke.length-1]); //this.medianPoint(stroke[0],stroke[stroke.length-1]);
            stroke[0] = median;
            stroke[stroke.length-1]=median;
            var closed = true;
        }
        var ss = this.simplifyStroke(stroke,error);



        var simpleStroke = [];
        for(var u=0;u<ss.length;u++){
            var nsp= stroke[ss[u]];
            ctx.fillRect(nsp.x-2,nsp.y-2,5,5);
            simpleStroke.push(nsp);
        }
        if(simpleStroke.length===2){
            console.log('Line Recognized');
            return new LineShape(new Brush(),simpleStroke[0],simpleStroke[1]);
        }

        //stroke.splice(0,stroke.length);
        //stroke.push.apply(stroke,simpleStroke);


        var hull = this.convexHull(closed?simpleStroke.slice(1):simpleStroke);



        /*
        var dir = this.calcDirection(stroke,3);
        var curvature = this.calcCurvature(stroke,dir,3);

        var data1 = $.map(dir,function(c,i){
            //to avoid jquery flattening
            return [[i,c]];
        });

        var data2 = $.map(curvature,function(c,i){
            //to avoid jquery flattening
            return [[i,c]];
        });
        $.plot('#plot',[data1, data2]);
        */
        var rect = this.smallerEnclosingRect(hull);

         //new PolyLineShape(new Brush(2,'blue'),rect,true).draw(ctx);


        var triangle = this.largestEnclosedTriangle(hull);
        //new TriangleShape(new Brush(2,'green'),triangle).draw(ctx);

        var pch = this.calcStrokeLength(hull);
        var ach = this.calcPolyArea(hull);
        var thinness = pch*pch/ach;

        var atr = this.calcPolyArea(triangle);
        var triratio = atr/ach;

        var pre = this.calcStrokeLength(rect);
        var rectratio = pch/pre;

        var are = this.calcPolyArea(rect);
        var achtrre = ach*ach/(atr*are);
        var atrre = atr/are;

        console.log('Thinness ratio: %f Triratio: %f RectRatio: %f achtrre: %f atrre: %f',
                thinness, triratio, rectratio, achtrre, atrre);
        var shape;

        //General empirical rules
        if(thinness<13.3){
            shape = 'circle';
            prob = 1.0;
        } else if (thinness > 180){
            shape = 'line';
            prob = 1.0;
        }
        else {
            var probs = [];
            var inputs = [null,thinness,triratio, rectratio,achtrre,atrre];
            for(var e=0;e<this.table.length;e++){
                var prob = 0;
                var r = 0;
                var row = this.table[e];
                for(var k=1;k<row.length;k++){

                    var par:any = row[k];
                    if(par){
                        prob +=this.gaussProb(par.a,par.b,par.c,inputs[k]);
                        r++;
                    }

                }
                prob/=r;
                probs.push(prob);
            }
            var i = probs.indexOf(Math.max.apply(Math, probs));
            prob = probs[i];
            shape = this.table[i][0];
        }


        console.log(probs);
        console.log('Shape: %s probability: %f',shape,prob);

        if(prob>0.8){
            switch(shape){
                case 'rectangle':
                    return this.recognizeBox(stroke,simpleStroke,hull,rect,triangle);
                case 'ellipse':
                    return this.recognizeEllipse(stroke, simpleStroke,hull,rect,triangle);
                case 'circle':
                    return this.recognizeCircle(stroke,simpleStroke,hull,rect,triangle);
                case 'triangle':
                    return this.recognizeTriangle(stroke,simpleStroke,hull,rect,triangle);
                case 'line':
                    return this.recognizeLine(stroke,simpleStroke,hull,rect,triangle);
            }
        }else{
            return null;
        }
    }


    public static gaussProb(a,b,c,x){
        return a*Math.exp(-(x-b)*(x-b)/(2*c));
    }

    public static convexHull(stroke:Stroke) {
        var ordered = stroke.slice(0).sort(function (p1, p2) {
            return p1.x - p2.x;
        });

        var lupper = [ordered[0], ordered[1]];

        for (var i = 2; i < ordered.length; i++) {
            lupper.push(ordered[i]);

            while (lupper.length > 2) {
                var l = lupper.length;
                if (this.isLeft(lupper[l - 3], lupper[l - 2], lupper[l - 1])) {
                    lupper.splice(l - 2, 1);
                } else {
                    break;
                }
            }


        }

        var llower = [ordered[ordered.length - 1], ordered[ordered.length - 2]];
        for (i = stroke.length - 3; i >= 0; i--) {
            llower.push(ordered[i]);
            while (llower.length > 2) {
                var l = llower.length;
                if (this.isLeft(llower[l - 3], llower[l - 2], llower[l - 1])) {
                    llower.splice(l - 2, 1);
                } else {
                    break;
                }
            }
        }


        llower.pop();
        llower.shift();

        return lupper.concat(llower);
    }

    private static isRight(a:Point, b:Point, c:Point){
        return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x))<0;
    }

    private static isLeft(a:Point, b:Point, c:Point){
        return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x))>0;
    }

    public static largestEnclosedTriangle(stroke:Stroke){
        var p = stroke;
        var len = p.length;
        if(len<3){
            return [p[0],p[len-1],p[len-1]];
        }
        var a=0;
        var b=1;
        var c=2;



        var A=p[a],B=p[b],C=p[c];


        var loop=true;
        do{
            while(true){
                while(this.calcPolyArea([p[a],p[b],p[(c+1)%len]]) >= this.calcPolyArea([p[a],p[b],p[c]])){
                    c = (c+1)%len;
                }
                if(this.calcPolyArea([p[a],p[(b+1)%len],p[c]])>=this.calcPolyArea([p[a],p[b],p[c]])){
                    b = (b+1)%len;
                } else {
                    break;
                }

            }
            if(this.calcPolyArea([p[a],p[b],p[c]]) > this.calcPolyArea([A,B,C])){
                A=p[a];
                B=p[b];
                C=p[c];
            }
            a=(a+1)%len;
            b = (a===b)?(b+1)%len:b;
            c = (b===c)?(c+1)%len:c;
        }while(a!=0);

        return [A,B,C];
    }

    public static smallerEnclosingRect(stroke:Stroke){
        var outmost = [];
        var bbox = this.calcBoundingBox(stroke,outmost);
        //new BoxShape(new Brush('red'),bbox).draw((<any>window).dbgctx);

        var minpivot = -1;

        var bestBox;

        var leftDir = new Point(0.0, 1);
        var rightDir = new Point(0, -1);
        var topDir = new Point(-1, 0);
        var bottomDir = new Point(1, 0);



        var rot = 0.0;
        var minarea = Number.MAX_VALUE;
        while(rot < Math.PI*0.5){
            var minangle = Number.MAX_VALUE;
            //calculate angles
            for(var i=0;i<4;i++){
                var p1 = stroke[outmost[i]];
                var next = (outmost[i]+1)%stroke.length;
                var p2 = new Point(stroke[next].x, stroke[next].y);
                var dir = p2.diff(p1);
                dir.normalize();
                var a;
                switch (i){
                    case 0:
                        a = Math.acos(leftDir.dot(dir));
                        break;
                    case 1:
                        a = Math.acos(topDir.dot(dir));
                        break;
                    case 2:
                        a = Math.acos(rightDir.dot(dir));
                        break;
                    case 3:
                        a = Math.acos(bottomDir.dot(dir));
                        break;
                }

                var ad = a*180/Math.PI;
                //console.log('outmost: %d a: %d',i,ad);
                if(a<minangle) {
                    minangle = a;
                    minpivot = i;
                }
            }

            rot+=minangle;
            var pivotpoint = stroke[outmost[minpivot]];
            var nextpivot = stroke[(outmost[minpivot]+1)%stroke.length];
            nextpivot = new Point(nextpivot.x, nextpivot.y);
            if(minpivot===0){
                leftDir = nextpivot.diff(pivotpoint);
                leftDir.normalize();
                rightDir = leftDir.clone();
                rightDir.negate();
                topDir = rightDir.orthogonal();
                bottomDir = topDir.clone();
                bottomDir.negate();
                outmost[0] = (outmost[0]+1)%stroke.length;
            }
            //topmost
            if(minpivot===1){
                topDir = nextpivot.diff(pivotpoint);
                topDir.normalize();
                bottomDir = topDir.clone();
                bottomDir.negate();
                leftDir = topDir.orthogonal();
                rightDir = leftDir.clone();
                rightDir.negate();
                outmost[1] = (outmost[1]+1)%stroke.length;
            }
            //rightmost
            if(minpivot===2){
                rightDir = nextpivot.diff(pivotpoint);
                rightDir.normalize();
                leftDir = rightDir.clone();
                leftDir.negate();
                topDir = rightDir.orthogonal();
                bottomDir = topDir.clone();
                bottomDir.negate();
                outmost[2] = (outmost[2]+1)%stroke.length;
            }
            //bottommost
            if(minpivot===3){
                bottomDir = nextpivot.diff(pivotpoint);
                bottomDir.normalize();
                topDir = bottomDir.clone();
                topDir.negate();
                leftDir = topDir.orthogonal();
                rightDir = leftDir.clone();
                rightDir.negate();
                outmost[3] = (outmost[3]+1)%stroke.length;
            }

            //update rect
            var upperLeft = this.IntersectLines(stroke[outmost[0]],leftDir,stroke[outmost[1]],topDir);
            var upperRight = this.IntersectLines(stroke[outmost[2]],rightDir,stroke[outmost[1]],topDir);
            var bottomLeft = this.IntersectLines(stroke[outmost[3]],bottomDir,stroke[outmost[0]],leftDir);
            var bottomRight = this.IntersectLines(stroke[outmost[3]],bottomDir,stroke[outmost[2]],rightDir);
            var base = upperLeft.dist(upperRight);
            var height = upperLeft.dist(bottomLeft);
            var area = base*height;
            if(area<minarea){
                minarea = area;
                bestBox = [upperLeft, bottomLeft, bottomRight, upperRight];
            }

            //new PolyLineShape(new Brush(2,'gray'),[upperLeft, bottomLeft, bottomRight, upperRight],true).draw((<any>window).dbgctx);
        }
        //new PolyLineShape(new Brush(2,'red'),bestBox,true).draw((<any>window).dbgctx);
        return bestBox;
    }

    private static IntersectLines(start0, dir0, start1, dir1)
    {
        var dd = dir0.x*dir1.y-dir0.y*dir1.x;
        // dd=0 => lines are parallel. we don't care as our lines are never parallel.
        var dx = start1.x-start0.x;
        var dy = start1.y-start0.y;
        var t = (dx*dir1.y-dy*dir1.x)/dd;
        return new Point(start0.x+t*dir0.x, start0.y+t*dir0.y);
    }

    public static simplifyStroke(stroke:Stroke,error:number=5, from:number=0,to:number=stroke.length-1 ):number[]{

        if(from===to-1){
            return [from,to];
        }
        var maxdist=0;
        var pn=-1;
        var p1 = stroke[from];
        var p2 = stroke[to];
        //cfr https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_two_points
        var dy = (p2.y-p1.y);
        var dx = (p2.x-p1.x);
        var mix = (p2.x*p1.y)-(p2.y*p1.x);

        var den = Math.sqrt(dy*dy+dx*dx);

        for(var i = from+1; i< to; i++){
            var p = stroke[i];
            var d;
            if(den>0){
                d = Math.abs(dy*p.x-dx*p.y+mix)/den;
            }else{
                d = this.dist(p1,p);
            }

            if(d>maxdist){
                maxdist = d;
                pn = i;
            }
        }

        if(maxdist<error){
            //we discard all points between start and end
            return [from, to];
        } else {
            //we include pn in the output
            var h1 = this.simplifyStroke(stroke,error,from,pn);
            var h2 = this.simplifyStroke(stroke,error,pn,to);
            h2.shift();
            return h1.concat(h2);
        }
    }



    public static recognizeBox(stroke, simplestroke, hull, rect, triangle) {
        //var lr = new Point(0,0);
        //var ul = new Point(Number.MAX_VALUE,Number.MAX_VALUE);
        var box = new BoxShape(null,rect);

        box.regularize();
        return box;
        /*
        ctx.beginPath();
        ctx.rect(rect.left,rect.top,rect.width,rect.height);

        ctx.lineWidth = 5;
        ctx.strokeStyle = '#330000';
        ctx.stroke();
        */
        //Calculate inner rect
/*

        var perc = 0.85;
        var irect = new Rect(rect.top*perc+rect.bottom*(1.0-perc),
                        rect.right*perc+rect.left*(1.0-perc),
                        rect.bottom*perc+rect.top*(1.0-perc),
                        rect.left*perc+rect.right*(1.0-perc));

        ctx.rect(irect.left, irect.top, irect.width, irect.height);
        ctx.stroke();
        ctx.closePath();
*/

        /*
        if(!this.intersectBox(stroke, irect)){
            console.log('Probably a Rectangle!')
        } else {
        }

        var rectarea = rect.area;
        var areacoeff = (rectarea - area) / area;



        console.log('Area Poly: %f Area Rect: %f delta: %f', area, rectarea, areacoeff);
        */
        
        //return rect;
    }

    public static calcBoundingBox(stroke,outerpoints=null) {
        var rect = new Rect(Number.MAX_VALUE, 0, 0, Number.MAX_VALUE);
        var leftmost,rightmost, topmost, bottommost;
        for (var i = 0; i < stroke.length; i++) {
            var p = stroke[i];
            if (rect.right < p.x) {
                rect.right = p.x;
                rightmost=i;
            }
            if (rect.bottom < p.y) {
                rect.bottom = p.y;
                bottommost=i;
            }
            if (rect.left > p.x) {
                rect.left = p.x;
                leftmost=i;
            }
            if (rect.top > p.y) {
                rect.top = p.y;
                topmost=i;
            }
        }
        if(outerpoints){
            outerpoints.push(leftmost);
            outerpoints.push(topmost);
            outerpoints.push(rightmost);
            outerpoints.push(bottommost);
        }
        return rect;
    }

    public static recognizeCircle(stroke:Stroke, simpleStroke,hull,rect,triangle){
        var ellipse = this.recognizeEllipse(stroke,simpleStroke,hull,rect,triangle);
        var r = (ellipse._a+ellipse._b)/2;
        ellipse._a = r;
        ellipse._b = r;
        ellipse._rot = 0;

        return ellipse;
    }

    public static recognizeEllipse(stroke:Stroke, simpleStroke,hull,rect,triangle) {
        (<any>window).dbgctx.fillRect(rect[0].x-2,rect[0].y-2,5,5);
        var center = rect[0].median(rect[2]);
        var a = (rect[0].diff(rect[3])).length/2;
        var b = (rect[0].diff(rect[1])).length/2;
        var dir = rect[1].diff(rect[0]);
        dir.normalize();
        var rot = Math.acos( dir.dot(new Point(0,-1)))/*180/Math.PI*/;
        var topleft = new Point(center.x-a,center.y-b);
        topleft = rect[0];
        var ellipse = new EllipseShape(undefined,center,a,b,rot);
        ellipse.regularize();
        return ellipse;


    }

    public static recognizeTriangle(stroke:Stroke, simpleStroke,hull,rect,triangle){
        var triangleShape = new TriangleShape(undefined,triangle.map(function(p){return new Point(p.x,p.y)}));
        triangleShape.regularize();
        return triangleShape;

    }

    public static recognizeLine(stroke:Stroke, simpleStroke,hull,rect,triangle){
        return new LineShape(undefined,rect[0],rect[2]);

    }

    private static sqdist(p1:Point, p2:Point){
        var sqx = (p2.x - p1.x);
        var sqy = (p2.y - p1.y);
        return sqx*sqx+sqy*sqy;
    }

    private static  dist(p1:Point, p2:Point){
            var sqx = (p2.x - p1.x);
            var sqy = (p2.y - p1.y);
            return Math.sqrt(sqx*sqx+sqy*sqy);
        }

    private static medianPoint(p1:Point, p2:Point){
        var x = (p2.x + p1.x)/2;
        var y = (p2.y + p1.y)/2;
        return {x:x,y:y};
    }
    static calcPolyArea(stroke:Stroke):number{
        var area = 0;         // Accumulates area in the loop
        var j = stroke.length-1;  // The last vertex is the 'previous' one to the first

        for (var i=0; i<stroke.length; i++)
        {
            if(!stroke[j] || !stroke[i]){
                debugger;
            }
            area = area +  (stroke[j].x+stroke[i].x) * (stroke[j].y-stroke[i].y);
            j = i;  //j is previous vertex to i
        }
        return area>0? area/2 : (-area)/2;
    }

    static calcStrokeLength(stroke:Stroke, start:number=0, end:number=stroke.length-1):number{
        var per = 0;
        var j = end;  // The last vertex is the 'previous' one to the first
        if(start<0){
            debugger;
        }
        for (var i=start; i<=end; i++)
        {

            var d = Math.sqrt((stroke[j].x-stroke[i].x)*(stroke[j].x-stroke[i].x)+(stroke[j].y-stroke[i].y)*(stroke[j].y-stroke[i].y));
            per+=d;
            j=i;
        }
        return per;
    }


    ///cfr:http://faculty.cse.tamu.edu/hammond/courses/SR/papers/Yu/Yu2003Domain.pdf


    static calcDirection(stroke:Stroke, k:number=2):number[]{
        var i;
        var d: number[]=[];
        for(i=k;i<stroke.length-1-k;i++){
            var p1 = stroke[i-k];
            var p2 = stroke[i+1+k];
            var dir = Math.abs(Math.atan((p2.y-p1.y)/(p2.x-p1.x)));
            d.push(dir);
        }
        return d;
    }

    static calcCurvature(stroke:Stroke,directions:number[], k:number=2){
        var n:number;
        var c: number[]=[];
        for(n=k;n<stroke.length-k;n++){
            var curv:number = 0;
            var i;
            for(i=n-k;i<n+k;i++){
                var diff = directions[i+1]-directions[i];
                diff = this.normalizeAngle(diff);
                curv+=diff;
            }
            var d = this.calcStrokeLength(stroke,n-k,n+k);
            c.push(curv/d);
        }
        return c;
    }

    static normalizeAngle(angle) {
        angle = angle % (2 * Math.PI);
        angle = angle >= 0 ? angle : angle + 2*Math.PI;
        angle = angle > Math.PI? angle-2*Math.PI:angle;
        return angle;
    }

    static intersectBox(stroke:Stroke, rect:Rect):boolean{

        for (var i = 0; i < stroke.length; i++) {
            var p = stroke[i];
            if(p.x<rect.left || p.x > rect.right || p.y < rect.top || p.y > rect.bottom){
                //this point is outside

            } else {
                //this point is inside
                return true;
            }
        }
        return false;
    }

}

export default ShapeRecognizer;