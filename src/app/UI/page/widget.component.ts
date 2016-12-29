import { Subscription } from 'rxjs/Rx';
import { IWidgetContent } from '../../model/IWidgetContent';
import { HtmlBlockComponent } from '../htmlblock/htmlblock.component';
import { DragHandleDirective } from '../directives/draggable.directive';
import { Widget } from '../../model/Widget';
import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
/**
 * Created by gcannata on 08/06/2015.
 */
import { PageComponent } from './page.component';


// import Page from '../../model/Page';

// var Events = (<any>window).require('events');
//(<any>window).require('./scripts/Model/resizable');
declare var _;
//declare var $;
@Component({
    selector: 'm-widget',
    templateUrl: './widget.component.html',
    styleUrls: ['./widget.component.less']
})
export class WidgetComponent implements OnChanges, AfterViewInit, OnInit, OnDestroy {



    @Input() model: Widget;

    @HostBinding('style.left.px')
    private _x: number = 0;
    @HostBinding('style.top.px')
    private _y: number = 0;

    @HostBinding('style.width.px')
    private _width: number = 200;
    // @HostBinding('style.height.px')
    private _height: number = 100;

    private _subs1: Subscription;

    @Input()
    protected page: PageComponent;

    private comp: ComponentRef<any>;

    private content: IWidgetContent;

    public _module: string;

    @Output()
    clickWidget = new EventEmitter<Widget>();

    @ViewChild('handle')
    private handle: any;
    @ViewChild('area', { read: ViewContainerRef })
    private area: ViewContainerRef;
    @HostBinding('class.selected')
    private selected: boolean;
    @HostBinding('class.disabled')
    private disabled: boolean;
    @HostBinding('class.minima-widget')
    private widgetclass: boolean = true;


    constructor(private _container: ElementRef, private cfr: ComponentFactoryResolver, private viewContainer: ViewContainerRef/*, page: PageComponent *//*, @Optional() options: any */) {
        //this._container = container;
        // this.page = page;
        var options;
        if (options) {
            if (options.position) {
                this._x = options.position.x;
                this._y = options.position.y;
            }
        }


        /*        this._widget.on('click',this.onClick.bind(this));
                this._widget.on('mousedown',this.onMouseDown.bind(this));
                this._widget.on('touchstart',this.onTouchStart.bind(this));
                this._widget.resize(_.debounce(this.onResize.bind(this),200));
                this._widget.resizable(this._container);*/
        //this.setPosition();
        //this.widget.addClass('minima-widget');

        //TODO: add draggable
        /*
         this.widget.draggable({
             handle: '.minima-widget-handle'        ,
             drag: _.debounce(this.onDrag.bind(this),200)
         });
         */


    }


    /*
        create(parent,options:any){
            return $('<div />');
        }
        */

    //
    // ─── I SUPPOSE  WIDGET DOESNT CHANGE ────────────────────────────────────────────
    //

    ngAfterViewInit() {

    }

    ngOnChanges() {


    }

    ngOnInit() {
        //console.log(this.model);
        if (this.model) {
            this._x = this.model.position.x;
            this._y = this.model.position.y;
            if(this.model.position.width) {
                this._width = this.model.position.width;
            }
            var blockfact = this.cfr.resolveComponentFactory(HtmlBlockComponent);
            //var comp = this.viewContainer.createComponent(blockfact);
            this.comp = this.area.createComponent(blockfact);
            this.content = this.comp.instance;  
            this.content.widget = this;
            this.selected = this.model.selected
            this._subs1 = this.model.changed.subscribe(()=>this.onModelChanged());
        }
    }

    ngOnDestroy(){
        if(this.comp){
            this.comp.destroy();
        }

        if(this._subs1){
            this._subs1.unsubscribe();
        }
    }

    focus(): void {
        //this._widget.focus.apply(this._widget, arguments);
        this._container.nativeElement.focus();
    }

    onSelectAll(): void {

    }

    setEditing(selected) {
        this.selected = selected;
    }

    enablePointerEvents(enabled) {

        this.disabled = !enabled;
    }

    init(container): void {



    }

    setPosition(pos: { x: number, y: number }) {
        //this.widget.css({left: this._x, top: this._y, width: this._width});
        this._x = pos.x;
        this._y = pos.y;
    }

    onFocus(e) {

    }

    onModelChanged(){
        console.log("onModelChanged");
        this.selected = this.model.selected;
        this.model.contentData = this.model.contentData;
        
    }

    @HostListener('blur',["$event"])
    onBlur(e) {
        this.page.onWidgetBlur(this);
        
       
    }

    @HostListener('click',["$event"])
    onClick(e) {
        console.log("Widget clicked");
        this.clickWidget.emit(this.model);
    }

    onDrag(e) {
        this.updatePosition();
        this.page.onWidgetMoved(this);
    }

    onDragEnd(e){
        this.updatePosition();
        this.page.onWidgetMoved(this);
    }

    @HostListener('resize')
    onResize(e) {
        this.updatePosition();
        
        this.page.onWidgetChanged(this);
    }

    onChanged(e) {

    }

    onMouseDown(e) {
        this.page.select(this.model);
    }

    onTouchStart(e) {
        this.page.select(this.model);
    }

    public isEmpty() {
        if(this.content)
            return this.content.isEmpty();
        else return true;
    }

    public isDirty() {
        if(this.content)
            return  this.content.isDirty();
        else return false;
    }

    public remove() {
        //TODO: remove widget
        console.log("TODO");
        // this._widget.remove();
    }


    get container(): any {
        return this._container;
    }

    public execCommand(command, options) {

    }

    public canExecute(command, options?) {
        return true;
    }

    public getCurrentValue(command, options) {

    }



    public getIndexableContent() {
        return '';
    }
    //Updated: we update the model, than save the model
/*
    public save(data) {
        //TODO: intercept move
        console.log("WidgetComponent save");
        this.updatePosition();
        data.position = { x: this._x, y: this._y, width: this._width, height: this._height };
        data.module = this._module;
    }
*/
    private updatePosition() {
        // console.log("TODO: update position");
        /* this._x = parseInt(this.widget.css('left'));
         this._y = parseInt(this.widget.css('top'));
         this._width = this.widget.width();
         this._height = this.widget.height();*/
          this.updateModel();
    }

    public updateModel() {;
        var rect = this.container.nativeElement.getBoundingClientRect();
        this.model.position = { x: rect.left, y: rect.top, width: rect.width, height: rect.height};
        this.model.module = this._module;
        this.content.updateModel();
    }

    public restore(data) {

        this._x = data.position.x;
        this._y = data.position.y;
        this._width = data.position.width;
        this._height = data.position.height;
        if(this.content){
            this.content.restore(data.contentData);
        }
        // this.setPosition({});



        //this.setPosition();
    }
}
export default WidgetComponent;


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/page/widget.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/page/widget.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/page/widget.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/page/widget.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/page/widget.component.ts