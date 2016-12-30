import { StorageService } from '../../services/storage.service';
import { Serialization } from '../../logic/Serialization';
// import { ELEMENT_PROBE_PROVIDERS_PROD_MODE } from '@angular/platform-browser/src/dom/debug/ng_probe';
import { CanvasComponent } from '../canvas/canvas.component';
import { Widget } from '../../model/Widget';
import { WidgetComponent } from './widget.component';
// import HtmlBlock from '../../model/HtmlBlock';
// import HtmlBlock from '../../model/HtmlBlock';

import { WidgetFactory } from '../../model/WidgetFactory';
import { Page } from '../../model/Page';
import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ElementRef,
    HostBinding,
    HostListener,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewContainerRef
} from '@angular/core';

declare var _;

@Component({
    selector: 'm-page',
    template: require('./page.component.html'),
    styles: [require('./page.component.less')],

})
export class PageComponent implements OnInit, AfterViewInit {
    //@ViewChild('container') container: ElementRef;
    // private page: Page;



    //#region "fields"
    title: string = "";
    creationDate: Date;


    private ctrlPressed: boolean;
    private initialized: boolean;
    // history management
    private currentState: number;
    private history = [];
    private skipHistory: boolean;
    //#endregion "Fields"

    @ViewChildren(WidgetComponent)
    private querywidgets: QueryList<WidgetComponent>;

    //private widgets: Widget[] = [];
    private page: Page;

    private get widgets(): Widget[] {
        return this.page.widgets;
    }

    private get shapes() {
        return this.canvas.shapes;
    }

    private _selected: WidgetComponent;
    private _suspendChangeNotifications: boolean;

    //@ViewChild('canvas') 
    // private canvas: CanvasComponent;
    /* private get canvas() : CanvasComponent{
         return this.canvasRef.instance;
     }*/

    @ViewChild(CanvasComponent)
    private canvas: CanvasComponent;

    @HostBinding('class.drawing')
    drawing: boolean = false;

    @HostBinding('style.height.px')
    elHeight: number;



    constructor(private container: ElementRef, private cfr: ComponentFactoryResolver, private viewContainer: ViewContainerRef,
        private storage: StorageService) {
        console.log('Page Built');

    }
    /*
        get created():string {
            // return kendo.toString(this.get('creationDate'),'dd-MM-yyyy hh:mm')
            moment
        }*/



    ngOnInit() {
        this.page = new Page(this.storage, this.title, this.creationDate, [], this.shapes);
        //console.log('page created ', this.page);
        //console.log('container: ',$(this.container.nativeElement))





    }
    ngAfterViewInit() {
        this.reset();

        this.storeHistory();
        this.initialized = true;

        this.onResize();
    }




    onDrawingStart() {
        //TODO: use an event instead?
        this.drawing = true;
    }

    onDrawingEnd(parameter: boolean) {
        //TODO: use an event instead?
        this.drawing = false;
        // this.storeHistory();
        this.onPageChanged();
    }

    onWidgetMoved(widget: WidgetComponent) {
        // console.log("page.onWidgetChanged.");
        this.onPageChanged(false);
    }

    onWidgetChanged(widget: WidgetComponent) {
        // console.log("page.onWidgetChanged.");
        this.onPageChanged(true);
    }

    onWidgetBlur(widget: WidgetComponent) {
        if (widget.isDirty()) {
            //on page changed should also store history
            // this.storeHistory();
            this.onPageChanged();
        }
    }

    onDblClick(e: { x, y }) {
        var w = this.createNewWidget(e);
        this.select(w);
    }

    // @HostListener('window:onpopstate', ['$event.target'])
    onPopState(state) {
        if (state !== null) {
            this.restore(state);
            this.save();
        }
    }

    @HostListener('window:keydown', ['$event'])
    onkeyDown(e) {
        var ctrlPressed: boolean;
        if (e.which === 17) {
            this.ctrlPressed = true;
        }
        //ctrl + z
        if (e.which === 90 && this.ctrlPressed === true) {
            this.undo();
            e.preventDefault(true);
        }
        //ctrl + y
        if (e.which === 89 && this.ctrlPressed === true) {
            this.redo();
            e.preventDefault(true);
        }
    }


    @HostListener('window:onkeyup', ['$event'])
    onKeyUp(e) {
        if (e.which === 17) {
            this.ctrlPressed = false;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(): void {

        //var hh = $('header')[0].offsetHeight;
        var hh = 0;
        var wh = window.innerHeight;
        //container.css('top',hh);
        //this.container.nativeElement.height(wh-hh-4);
        this.elHeight = (wh - hh - 4);
        console.log('hh: %d wh: %d height: %d', hh, wh, wh - hh - 4);
        this.canvas.elHeight = this.elHeight;
        this.canvas.onResize();
        // this.canvas.resizeToParent();
        //this.resizeToParent();

    }

    onWidgetClicked(w: Widget) {
        this.select(w);

    }

    onPageChanged(skipHistory?) {
        console.log('page changed');
        if (!this._suspendChangeNotifications) {
            //minima.save();

            this.save();
            if (!skipHistory) {
                return this.storeHistory();
            }
        }

    }

    undo() {
        if (this.currentState) {
            this.currentState--;
        }
        return this.onPopState(this.history[this.currentState]);
    }

    redo() {
        if (this.currentState < this.history.length - 1) {
            this.currentState++;
            return this.onPopState(this.history[this.currentState]);
        }

    }

    reset() {

        var tmp = this._suspendChangeNotifications;
        this._suspendChangeNotifications = true;
        this.title = "";
        this.creationDate = new Date();
        try {
            if (this.canvas) {
                this.canvas.reset();
            }


            this.select(null);
            this.removeAllWidgets();
        }
        finally {
            this._suspendChangeNotifications = tmp;
        }
        if (this.canvas) {
            this.canvas.redraw();
        }
        this.onResize();
    }

    resetHistory() {
        this.history.length = 0;
        this.currentState = 0;
    }

    storeHistory() {
        // this.currentState++;

        var state = this.getState();
        state = _.cloneDeep(state);
        this.pushState(state);
        console.log('PUSH currentState: %d history.length: %d shapes: %d', this.currentState, this.history.length, this.shapes.length);

    }

    pushState(state) {
        console.log('pushState');
        if (this.currentState) {
            this.history.length = this.currentState + 1;
        }
        this.history.push(state);
        return this.currentState = this.history.length - 1;
    };

    getState() {
        var data: any = {};
        data.title = this.title;
        data.creationDate = this.creationDate;

        this.canvas.save(data);

        this.querywidgets.forEach(
            w => w.updateModel()
        );

        data.widgetsData = this.widgets.map(w => {
            var wdata = {};
            w.save(wdata);
            return wdata;
        });

        return data;
    }

    restore(data) {
        console.log("page.component.restore");
        this.reset();
        this.title = data.title;
        this.creationDate = data.creationDate;
        this.canvas.restore(data);
        /*
        this.widgets = data.widgetsData.map((ws) => {
            var w = new Widget(wd.position);
            w.restore(wd);
            return w;
        });
        */
        
        for (let wd of data.widgetsData) {

            var w = new Widget(wd.position);
            w.restore(wd);

            this.widgets.push(w);
        }
        
    }

    deserialize(str: string) {
        console.log("page.component.deserialize");
        var data = Page.deserialize(str);
        this.restore(data);
        console.log(data);
    }

    //TODO: move to Page
    save() {
        console.log("TODO: minima.save()");
        this.page.shapes = this.shapes;
        this.page.save();
    }

    load(str: string) {
        console.log("page.component.load load from string", str);
        this.resetHistory();
        this.deserialize(str);
        return this.storeHistory();
    }

    select(widget: Widget) {
        this.widgets.forEach(w => {
            if (w === widget) w.selected = true;
            else w.selected = false;
        })

        /*  if (this._selected && (widget !== this._selected)) {
              this._selected.setEditing(false);
              if (this._selected.isEmpty()) {
                  this.removeWidget(this._selected.widget);
              }
          }
          this._selected = widget;
          if (this._selected) {
              this._selected.setEditing(true);
  
          }*/

        /*this.commands.hilite.trigger('change', { field: 'canExecute' });
        this.commands.chklist.trigger('change', { field: 'canExecute' });*/
    }

    public removeAllWidgets() {

        for (var i = 0; i < this.widgets.length; i++) {
            //this.widgets[i].remove();

        }
        this.widgets.length = 0;
        this.onPageChanged();
    }

    public removeWidget(widget: Widget) {
        console.log("TODO: remove a widget");

        //widget.remove();
        //TODO: how to remove a view children?
        this.widgets.splice(this.widgets.indexOf(widget), 1);
        this.onPageChanged();
    }

    private createNewWidget(where) {
        //var block = new HtmlBlock(this._container,this, {position: where});

        //var block = WidgetFactory.createWidget('../../model/HtmlBlock', this.container, this, { position: where });
        //this.dcl.loadIntoLocation(block, this.container, 'child');

        //var blockfact = this.cfr.resolveComponentFactory( WidgetComponent );
        //var comp = this.viewContainer.createComponent(blockfact);

        var widget = new Widget(where);
        this.widgets.push(widget);
        this.select(widget);
        return widget;

        //var block =  blockfact.create(null, null, this.container);
        //this.widgets.push(block.instance);
        /* block.
         block.focus();
         this.widgets.push(block);*/
        //return comp.instance;
    }

}
