import Serialization from '../logic/Serialization';
import ShapeRecognizer from './ShapeRecognizer';
import Eraser from './shapes/Eraser';
import { TriangleShape } from './shapes/TriangleShape';
import LineShape from './shapes/LineShape';
import EllipseShape from './shapes/EllipseShape';
import { BoxShape } from './shapes';
import StrokeShape from './shapes/StrokeShape';
import Brush from './Brush';
import BaseShape from './shapes/BaseShape';
import Point from './Point';
/**
 * Created by Gabriele on 07/06/2015.
 */

//import $ = require('canvas');
//var $ = require('libs/jquery.js');
//import HtmlBlock = require('HtmlBlock');

declare var $:any;

console.log('Loading canvas.js...');


    class Canvas  {
        private _ctx:any;
        private _tmpCanvas: any;
        private _tmp_ctx: any;
        private _pmouse = new Point();
        private _mouse = {x: 0, y: 0};

        private _mouseStart:Point = null;
        private _isDrawing:boolean;
        private _shape:BaseShape = undefined;
        private static DRAW_THRESHOLD = 9;

        //private _shapes:Array<BaseShape> = [];

        private _currentBrush:Brush = new Brush();

        //TODO: improve the binding with toolbar

        //TODO: use Observable #minima2
        //private _vm=kendo.observable({drawmode: 'stroke'});

        private _container;
        private _page;
        private _canvas;


        constructor(container,page) {
            this._container = container;
            this._page = page;
            //(<any>window).canvas = this;
            this._canvas= this.create();
            this._canvas.data('viewmodel', this);
            this._container.append(this._canvas);
            var self = this;


            container.dblclick(this.dblClick.bind(this));



            this._tmpCanvas = $('<canvas />', { class: 'minima-tmpcanvas'});
            this.resizeToParent();
            this._tmp_ctx = this._tmpCanvas[0].getContext('2d');
            this._tmpCanvas.id = 'tmp_canvas';
            this._container.append(this._tmpCanvas);
            this._tmpCanvas.data('viewmodel', this);
            //$(container).resize(this.resizeToParent.bind(this));



            /* Mouse Capturing Work */
            this._container.on('mousemove touchmove',this.onMouseMove.bind(this));

            this._container.on('mousedown',this.onMouseDown.bind(this));
            this._container.on('mouseup touchend mouseleave',this.onMouseUp.bind(this));
            this._container.on('touchstart',this.onTouchStart.bind(this));

            //HACK
            /*
            (<any>window).theApp.eventEmitter.on('hilite', function (param) {
                console.log(param);
                $('.block').data('htmleditor').hiliteColor(param);
            });
            */
            this._isDrawing = false;
        }

        get viewModel(): any {
            // return this._vm;
            return undefined;
        }

        get container(): any {
            return this._container;
        }

        public get shapes(){
            return this._page.shapes;
        }

        public get isDrawing(){
            return this._isDrawing;
        }

        create() {

            //var parent_style = window.getComputedStyle(container[0]);
            //var width = parseInt(parent_style.getPropertyValue('width'));
            //var height = parseInt(parent_style.getPropertyValue('height'));
            return $('<canvas />', { class: 'minima-canvas'});
        }

        resizeToParent(){


            var width = this.container[0].scrollWidth || this.container[0].clientWidth;
            var height = this.container[0].scrollHeight || this.container[0].clientHeight;

            //console.log('resize clientWidth:%d offsetWidth:%d scrollWidth:%d',this.container[0].clientWidth,this.container[0].offsetWidth, this.container[0].scrollWidth);
            //console.log('resize clientHeight:%d offsetHeight:%d scrollHeight:%d',this.container[0].clientHeight,this.container[0].offsetHeight, this.container[0].scrollHeight);

            
            //console.log('resize w:%d h:%d',width,height);

            //TODO: we should resize according to content
            //we need bounding boxes
            if(true||this._canvas[0].width<width){
                this._canvas[0].width=(width);
                this._tmpCanvas[0].width =width;
            }
            if(true||this._canvas[0].height<height){
                this._canvas[0].height=(height);
               this._tmpCanvas[0].height = height;
            }


            this.redraw();
        }

        redraw(){
            this._ctx = this._canvas[0].getContext('2d');
            this._tmp_ctx = this._tmpCanvas[0].getContext('2d');
            this._ctx.clearRect(0, 0, this._canvas[0].width, this._canvas[0].height);


            for(var i = 0;i< this.shapes.length;i++){
                this.shapes[i].draw(this._ctx);
                //this.drawStroke(this._strokes[i]);
            }


        }

        init() {



        }


        onTouchStart(e){

            var touch = e.originalEvent.touches[0];

            //this._mouse.x = touch.pageX - this.widget[0].offsetLeft;
            //this._mouse.y = touch.pageY - this.widget[0].offsetTop;

            this._mouse.x = touch.pageX - this._tmpCanvas.offset().left;
            this._mouse.y = touch.pageY - this._tmpCanvas.offset().top;
            //this._ctx.beginPath();
            //this._ctx.moveTo(this._mouse.x, this._mouse.y);
            //this._isDrawing = true;
            //this._shape=new StrokeShape(this._currentBrush,[{x:this._mouse.x, y:this._mouse.y}]);
            if(e.originalEvent.touches.length == 1){
                e.preventDefault(true);
            }

            this.onMouseDown(e);
        }
        onMouseDown(e){
            //just left click
            if(e.button>0) return;
            //this._ctx.beginPath();
            //this._ctx.moveTo(this._mouse.x, this._mouse.y);
            if(e.target !== this._tmpCanvas[0]) return;

            this._mouseStart = new Point(this._mouse.x,this._mouse.y);
            //this._isDrawing = true;


            this._page.select(null);
            //TODO: the shape depends on the canvas settings
            switch(this.viewModel.get('drawmode')){
                case "stroke":
                    this._shape=new StrokeShape(this._currentBrush,[]);
                    break;
                case "box":
                    this._shape = new BoxShape(this._currentBrush);
                    break;
                case "ellipse":
                    this._shape = new EllipseShape(this._currentBrush);
                    break;
                case "line":
                    this._shape = new LineShape(this._currentBrush);
                    break;
                case "triangle":
                    this._shape = new TriangleShape(this._currentBrush);
                    break;
                case "recognize":
                    this._shape=new StrokeShape(this._currentBrush,[]);
                    break;
                case "eraser":
                    this._shape=new Eraser(this._currentBrush,this);
                    break;


                default:
                    this._shape=new StrokeShape(this._currentBrush,[]);
                    break;
            }

            this._shape.startEdit({x:this._mouse.x,y:this._mouse.y});

        }



        onMouseMove(e){

            if(e.type === 'touchmove'){
                e = e.originalEvent.touches[0];
            }

            this._mouse.x = (e.pageX - this._tmpCanvas.offset().left);
            this._mouse.y = (e.pageY - this._tmpCanvas.offset().top);

            //calculate distance from start
            if(this._mouseStart){
                var dist = (this._mouse.x-this._mouseStart.x)*(this._mouse.x-this._mouseStart.x)
                        +(this._mouse.y-this._mouseStart.y)*(this._mouse.y-this._mouseStart.y);
                if(dist > Canvas.DRAW_THRESHOLD){
                    this._isDrawing = true;
                    this._page.onDrawingStart();
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
            if(this._isDrawing){

                //var sqdist = (this._mouse.x-this._pmouse.x)*(this._mouse.x-this._pmouse.x)+(this._mouse.y-this._pmouse.y)*(this._mouse.y-this._pmouse.y);
                /*if(sqdist>10)*/{ //smoothing factor
                    this._pmouse.x = this._mouse.x;
                    this._pmouse.y = this._mouse.y;
                    //this._shape.push({x:this._mouse.x, y:this._mouse.y});
                    this._shape.onMouseMove(new Point(this._mouse.x, this._mouse.y));

                    //this._tmp_ctx = this._tmpCanvas[0].getContext('2d');
                    this._tmp_ctx.clearRect(0, 0, this._tmpCanvas[0].width, this._tmpCanvas[0].height);
                    //this.drawStroke(this._shape, 0, this._tmp_ctx);
                    this._shape.draw(this._tmp_ctx);

                }


            }

        }

        onMouseUp(e){
            this._mouseStart = null;
            if(this._isDrawing){
                this._isDrawing = false;

                //console.log('not painitng');
                //TODO: should we support dots?
                if(this._shape.hasContent()){
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
                    if(this.viewModel.get('drawmode')==='recognize'){
                        this._shape = ShapeRecognizer.recognizeStroke((<StrokeShape>this._shape).stroke,this._ctx) || this._shape;
                        this._shape._brush = this._currentBrush;
                    }
                    if(this.viewModel.get('drawmode')!=='eraser') {
                        this._page.addShape(this._shape);
                    }
                    this._page.onDrawingEnd(true);
                    this._shape = null;
                }
                else{
                    this._page.onDrawingEnd(false);
                }
                // Clearing tmp canvas
                this._tmp_ctx.clearRect(0, 0, this._tmpCanvas[0].width, this._tmpCanvas[0].height);
                this.redraw();
                //ShapeRecognizer.recognizeStroke(this._strokes[this._strokes.length-1], this._ctx);
            }


        }
        dblClick(e):void {
            //console.log('dblclick');
            this._mouseStart = null;
            var target = $(e.target);
            if (target.data('viewmodel') === this) {

                var x = e.offsetX;
                var y = e.offsetY;
                this._page.onDblClick({x:x, y:y});

            }
        }

        removeShape(shape){
            var i = this.shapes.indexOf(shape);
            if(i>=0){
                this.shapes.splice(i,1);
            }
        }

        serialize(shapes):any {
            var str = Serialization.serialize(shapes);
            return JSON.parse(str);
        }

        deserialize(data):void{
            var str = JSON.stringify(data);
            return Serialization.deserialize(str,[BoxShape, TriangleShape, LineShape, EllipseShape, StrokeShape, Brush, Point]);
        }

    }

export default Canvas;


