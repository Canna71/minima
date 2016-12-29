import { Observable, Subscription } from 'rxjs/Rx';
import { HtmlBlockContent } from '../../model/HtmlBlockContent';
import { selector } from 'rxjs/operator/multicast';
import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';



@Directive({
    selector: "m-htmleditor"
})
export class HtmlEditorDirective  {

    @Input() htmlContent: HtmlBlockContent;

   

    constructor(private el: ElementRef) {
        // this.target = target;
        // this.model = model;
    }

   

   

   


}