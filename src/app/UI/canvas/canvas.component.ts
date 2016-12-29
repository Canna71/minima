import Serialization from '../../logic/Serialization';
import ShapeRecognizer from '../../canvas/ShapeRecognizer';
import Eraser from '../../canvas/shapes/Eraser';
import { TriangleShape } from '../../canvas/shapes/TriangleShape';
import LineShape from '../../canvas/shapes/LineShape';
import EllipseShape from '../../canvas/shapes/EllipseShape';
import { BoxShape } from '../../canvas/shapes';
import StrokeShape from '../../canvas/shapes/StrokeShape';
import BaseShape from '../../canvas/shapes/BaseShape';
import Brush from '../../canvas/Brush';
import Point from '../../canvas/Point';
import { PageComponent } from '../page/page.component';
import {
    AfterViewInit,
    Component,
    ElementRef,
    forwardRef,
    HostBinding,
    HostListener,
    Inject,
    OnInit,
    ViewChild
} from '@angular/core';

export enum DrawMode {
    stroke,
    box,
    ellipse,
    line,
    triangle,
    recognize,
    eraser
}

@Component({
    selector: 'm-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.less']
})
export class CanvasComponent implements OnInit, AfterViewInit {

    //private container: any;
    @ViewChild('canvas') _canvas: ElementRef;
    @ViewChild('tmpcanvas') _tmpCanvas: ElementRef;

    private _shapes: Array<BaseShape> = [];

    private _mouseStart: Point = null;
    private _currentBrush: Brush = new Brush();
    private _mouse = { x: 0, y: 0 };
    public drawmode: DrawMode = DrawMode.recognize;
    private _shape: BaseShape = undefined;
    private _ctx: CanvasRenderingContext2D = null;
    private _tmp_ctx: CanvasRenderingContext2D = null;
    private static DRAW_THRESHOLD = 9;
    private _isDrawing: boolean;
    private _pmouse = new Point();
    @HostListener('window:resize', ['$event.target'])
    onResize() {
        this.resizeToParent();
    }

    //@HostBinding('style.width.px')
    elWidth: number;
    // @HostBinding('style.height.px')
    elHeight: number;

    constructor(private container: ElementRef,@Inject(forwardRef(() => PageComponent)) private page: PageComponent) {
        console.log(this.page);

    }

    ngOnInit() {
        //this.container = $(this.page.container.nativeElement)[0];
    }

    ngAfterViewInit() {

        // this.resizeToParent();
    }
    //http://stackoverflow.com/questions/39084250/how-to-get-width-of-dom-element-in-angular2
    @HostListener('window:resize', ['$event'])
    resizeToParent() {
       
        var width = this.container.nativeElement.scrollWidth || this.container.nativeElement.clientWidth;
        // var height = this.container.nativeElement.scrollHeight || this.container.nativeElement.clientHeight;
       var height = this.elHeight;
        //TODO: we should resize according to content
        //we need bounding boxes

        if (true || this._canvas.nativeElement.width < width) {
            this._canvas.nativeElement.width = (width);
            this.elWidth = width;
            this._tmpCanvas.nativeElement.width = width;
        }
        if (true || this._canvas.nativeElement.height < height) {
            this._canvas.nativeElement.height = (height);
            this._tmpCanvas.nativeElement.height = height;
            //this.elHeight = height;
        }


        this.redraw();
    }

    public get shapes() {
        return this._shapes;
    }
    redraw() {
        this._ctx = this._canvas.nativeElement.getContext('2d');
        this._tmp_ctx = this._tmpCanvas.nativeElement.getContext('2d');
        this._ctx.clearRect(0, 0, this._canvas.nativeElement.width, this._canvas.nativeElement.height);


        for (var i = 0; i < this.shapes.length; i++) {
            this.shapes[i].draw(this._ctx);
            //this.drawStroke(this._strokes[i]);
        }

    }

    reset(){
        this._shapes = [];
        this.redraw();
    }

    @HostListener('touchstart', ['$event'])
    onTouchStart(e) {

        var touch = e.touches[0];

        //this._mouse.x = touch.pageX - this.widget[0].offsetLeft;
        //this._mouse.y = touch.pageY - this.widget[0].offsetTop;
        var offset = this.getOffset(this._tmpCanvas.nativeElement);
        this._mouse.x = touch.pageX - offset.left;
        this._mouse.y = touch.pageY - offset.top;
        //this._ctx.beginPath();
        //this._ctx.moveTo(this._mouse.x, this._mouse.y);
        //this._isDrawing = true;
        //this._shape=new StrokeShape(this._currentBrush,[{x:this._mouse.x, y:this._mouse.y}]);
        if (e.touches.length == 1) {
            e.preventDefault(true);
        }

        this.onMouseDown(e);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(e) {
        //just left click
        if (e.button > 0) return;
        //this._ctx.beginPath();
        //this._ctx.moveTo(this._mouse.x, this._mouse.y);
        if (e.target !== this._tmpCanvas.nativeElement) return;

        this._mouseStart = new Point(this._mouse.x, this._mouse.y);
        //this._isDrawing = true;


        this.page.select(null);
        //TODO: the shape depends on the canvas settings
        switch (this.drawmode) {
            case DrawMode.stroke:
                this._shape = new StrokeShape(this._currentBrush, []);
                break;
            case DrawMode.box:
                this._shape = new BoxShape(this._currentBrush);
                break;
            case DrawMode.ellipse:
                this._shape = new EllipseShape(this._currentBrush);
                break;
            case DrawMode.line:
                this._shape = new LineShape(this._currentBrush);
                break;
            case DrawMode.triangle:
                this._shape = new TriangleShape(this._currentBrush);
                break;
            case DrawMode.recognize:
                this._shape = new StrokeShape(this._currentBrush, []);
                break;
            case DrawMode.eraser:
                this._shape = new Eraser(this._currentBrush, this);
                break;


            default:
                this._shape = new StrokeShape(this._currentBrush, []);
                break;
        }

        this._shape.startEdit({ x: this._mouse.x, y: this._mouse.y });
    }
    @HostListener('touchmove', ['$event'])
    @HostListener('mousemove', ['$event'])
    onMouseMove(e) {

        if (e.type === 'touchmove') {
            e = e.touches[0];
        }

        //var box = this._tmpCanvas.nativeElement.getBoundingClientRect();
        //was offset().top
        //console.log(box);
        var offset = this.getOffset(this._tmpCanvas.nativeElement);
        this._mouse.x = (e.pageX - offset.left);
        this._mouse.y = (e.pageY - offset.top);

        //calculate distance from start
        if (this._mouseStart) {

            var dist = (this._mouse.x - this._mouseStart.x) * (this._mouse.x - this._mouseStart.x)
                + (this._mouse.y - this._mouseStart.y) * (this._mouse.y - this._mouseStart.y);

            if (dist > CanvasComponent.DRAW_THRESHOLD) {
                this._isDrawing = true;
                this.page.onDrawingStart();
            }
        }


        /*
        if(e.target === this._tmpCanvas[0]){
            this._mouse.x = e.offsetX;
            this._mouse.y = e.offsetY;
        }
        else{
            console.log("x %d+%d=%d",e.offsetX,e.target.offsetLeft,e.offsetX+e.target.offsetLeft);
            console.log("y %d+%d=%d",e.offsetY,e.target.offsetTop,e.offsetY+e.target.offsetTop);
            this._mouse.x = e.offsetX+e.target.offsetLeft;
            this._mouse.y = e.offsetY+e.target.offsetTop;
        }
        */
        //console.log(e);
        if (this._isDrawing) {

                //var sqdist = (this._mouse.x-this._pmouse.x)*(this._mouse.x-this._pmouse.x)+(this._mouse.y-this._pmouse.y)*(this._mouse.y-this._pmouse.y);
                /*if(sqdist>10)*/{ //smoothing factor
                this._pmouse.x = this._mouse.x;
                this._pmouse.y = this._mouse.y;
                //this._shape.push({x:this._mouse.x, y:this._mouse.y});
                this._shape.onMouseMove(new Point(this._mouse.x, this._mouse.y));

                //this._tmp_ctx = this._tmpCanvas[0].getContext('2d');
                this._tmp_ctx.clearRect(0, 0, this._tmpCanvas.nativeElement.width, this._tmpCanvas.nativeElement.height);
                //this.drawStroke(this._shape, 0, this._tmp_ctx);
                this._shape.draw(this._tmp_ctx);

            }


        }

    }

    @HostListener('mouseup', ['$event'])
    @HostListener('touchend', ['$event'])
    @HostListener('mouseleave', ['$event'])
    onMouseUp(e) {
        this._mouseStart = null;
        if (this._isDrawing) {
            this._isDrawing = false;

            //console.log('not painitng');
            //TODO: should we support dots?
            if (this._shape.hasContent()) {
                /*
                if(this._recognizing==="box"){
                    var rect = ShapeRecognizer.recognizeBox(this._shape.stroke);
                    this._shapes.push(new BoxShape(this._currentBrush,rect));
                } else if(this._recognizing==="ellipse"){
                    var rect = ShapeRecognizer.recognizeEllipse(this._shape.stroke);
                    this._shapes.push(new EllipseShape(this._currentBrush,rect));
                }
                else if (this._recognizing==='triangle'){
                    var stroke = ShapeRecognizer.recognizeTriangle(this._shape.stroke);
                    this._shapes.push(new TriangleShape(this._currentBrush, stroke));
                } else {
                    this._shapes.push(this._shape);
                    //this._ctx.drawImage(this._tmpCanvas[0], 0, 0);
                }
                */
                this._shape.finishEdit();
                if (this.drawmode === DrawMode.recognize) {
                    this._shape = ShapeRecognizer.recognizeStroke((<StrokeShape>this._shape).stroke, this._ctx) || this._shape;
                    this._shape._brush = this._currentBrush;
                }
                if (this.drawmode !== DrawMode.eraser) {
                    this.addShape(this._shape);
                }
                this.page.onDrawingEnd(true);
                this._shape = null;
            }
            else {
                this.page.onDrawingEnd(false);
            }
            // Clearing tmp canvas
            this._tmp_ctx.clearRect(0, 0, this._tmpCanvas.nativeElement.width, this._tmpCanvas.nativeElement.height);
            this.redraw();
            //ShapeRecognizer.recognizeStroke(this._strokes[this._strokes.length-1], this._ctx);
        }
    }
    @HostListener('doubletap', ['$event'])
    @HostListener('dblclick', ['$event'])
    dblClick(e): void {
        //console.log('dblclick');
        this._mouseStart = null;
        var target = e.target;
        //if (target.data('viewmodel') === this)
        {

            var x = e.offsetX;
            var y = e.offsetY;
            this.page.onDblClick({ x: x, y: y });

        }
    }

    removeShape(shape) {
        var i = this.shapes.indexOf(shape);
        if (i >= 0) {
            this.shapes.splice(i, 1);
        }
    }
/*
    serialize(): any {
        var str = Serialization.serialize(this.shapes);
        return JSON.parse(str);
    }
*/

    save(data){
        data.shapes = this.shapes;
    }

    restore(data){
        //var shapes = Serialization.deserialize(str, [BoxShape, TriangleShape, LineShape, EllipseShape, StrokeShape, Brush, Point]);
        
        this._shapes = data.shapes;
        this.redraw();
    }

    deserialize(data): void {
        var str = JSON.stringify(data);
        var shapes = Serialization.deserialize(str, [BoxShape, TriangleShape, LineShape, EllipseShape, StrokeShape, Brush, Point]);
        this._shapes = shapes;
        return shapes;
    }

    addShape(shape: BaseShape) {
        this.shapes.push(shape);
    }

    getOffset(elem: any) {
        var box = elem.getBoundingClientRect();
        var doc = elem.ownerDocument,
            docElem = doc.documentElement;
        var body = doc.body,
            win = doc.nodeType === 9 && doc.defaultView;
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };

        // return { top: top, left: left };
    }
}
