import {
    AfterViewInit,
    ContentChild,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer,
    ViewChild
} from '@angular/core';



@Directive({
    selector: '[m-draghandle]',
    host: {
        '(dragstart)': 'onDragStart($event)',
        '(dragend)': 'onDragEnd($event)',
        '(drag)': 'onDrag($event)'
    }
})
export class DragHandleDirective implements OnInit, OnDestroy {

    private dx: number;
    private dy: number;

    @Output() move: EventEmitter<{ x, y }> = new EventEmitter<{ x, y }>();
    @Output() dragEnd: EventEmitter<any> = new EventEmitter();

    @Input() draggable: ElementRef;

    constructor(private el: ElementRef, private renderer: Renderer) {
        console.log("DragHandle built")
    }

    onDragStart(event: MouseEvent) {
        this.dx = event.x - this.draggable.nativeElement.offsetLeft;
        this.dy = event.y - this.draggable.nativeElement.offsetTop;
    }
    onDrag(event: MouseEvent) {
        this.doTranslation(event.x, event.y);
    }
    onDragEnd(event: MouseEvent) {
        this.dx = 0;
        this.dy = 0;
        this.dragEnd.emit();
    }

    doTranslation(x: number, y: number) {
        if (!x || !y) return;

        this.renderer.setElementStyle(this.draggable.nativeElement, 'top', (y - this.dy) + 'px');
        this.renderer.setElementStyle(this.draggable.nativeElement, 'left', (x - this.dx) + 'px');
        this.move.emit({y: (y - this.dy), x:(x - this.dx)});
    }

    ngOnInit() {
        this.renderer.setElementAttribute(this.el.nativeElement, 'draggable', 'true')
    }

    public ngOnDestroy(): void {
        this.renderer.setElementAttribute(this.el.nativeElement, 'draggable', 'false');
    }

}

@Directive({
    selector: '[m-draggable]',

})
export class DraggableDirective implements OnInit, AfterViewInit {

    @ContentChild(DragHandleDirective) dragHandle;
    @ViewChild(DragHandleDirective) dragHandle2;
    constructor(public el: ElementRef, private renderer: Renderer) {
        console.log("draggable built")
    }
    ngOnInit() {
        
    }

    ngAfterViewInit(){
        console.log("ngAfterViewInit ",this.dragHandle, this.dragHandle2);
        if(this.dragHandle) this.dragHandle.draggable = this;
    }

    public translate(x: number, y: number) {

    }


}