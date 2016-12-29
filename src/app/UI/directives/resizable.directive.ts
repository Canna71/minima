import { Directive, ElementRef, EventEmitter, HostBinding, HostListener, Output, Renderer } from '@angular/core';

@Directive({
    selector: '[m-resizable]'
})
export class ResizableDirective {

    private originalW: number;
    private originalH: number;
    private originalX: number;
    private originalY: number;

    private static MARGIN: number = 5;

    @HostBinding('style.cursor')
    private cursor: string;

    @HostBinding("class.resizing")
    private isResizing: boolean;

    @HostBinding("style.width.px")
    private width: number;

    @Output() resize: EventEmitter<any> = new EventEmitter();

    constructor(private el: ElementRef, private renderer:Renderer) {

    }

    @HostListener("document:mousemove", ["$event"])
    onMouseMove(e) {
        var box = this.el.nativeElement.getBoundingClientRect();

        if ((e.offsetX > box.width - ResizableDirective.MARGIN) || this.isResizing) {
            this.cursor = 'ew-resize';

        } else {
            this.cursor = 'initial';
        }

        if (this.isResizing) {
            var newW = this.originalW + e.clientX - this.originalX;
            // this.width = newW;
             this.renderer.setElementStyle(this.el.nativeElement, 'width', newW + 'px');
            this.resize.emit({width: newW});
        }
    }

    

    @HostListener("mousedown", ["$event"])
    onMouseDown(e) {
        var box = this.el.nativeElement.getBoundingClientRect();
        if (e.offsetX > box.width - ResizableDirective.MARGIN) {
            //resizing = true;
            this.originalW = this.el.nativeElement.clientWidth;
            this.originalX = e.clientX;
            this.isResizing = true;
        }
    }

    @HostListener("document:mouseup", ["$event"])
    onMouseUp(e) {
        this.isResizing = false;
        
    }

}
