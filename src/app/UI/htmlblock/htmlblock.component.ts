import { Page } from '../../model/Page';
import { Widget } from '../../model/Widget';
import { IWidgetContent } from '../../model/IWidgetContent';
import { HtmlBlockContent } from '../../model/HtmlBlockContent';
import { Observable, Subscription } from 'rxjs/Rx';
import { WidgetComponent } from '../page/widget.component';
import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, OnInit } from '@angular/core';
/**
 * Created by gcannata on 08/06/2015.
 */

var w = (<any>window);

// import htmlContent from '../UI/HtmlContent';


// import { WidgetComponent } from '../UI/page/WidgetComponent';

var _: any;

export class SelectionWrapper {

    private selection: Selection;
    private container: any;
    private range: Range;
    private fragment: DocumentFragment;
    private clone: Range;
    private collapsed: boolean;
    private editor: ElementRef;


    constructor(container) {
        this.selection = window.getSelection();
        this.container = container;
        if (!(this.selection.rangeCount >= 1)) {
            return;
        }
        this.range = this.selection.getRangeAt(0);
        this.fragment = this.range.cloneContents();
        this.clone = this.range.cloneRange();
        this.collapsed = this.selection.isCollapsed;
    }

    getCommonAncestor(): Node {
        if (!this.range) {
            return null;
        }
        var ancestor = this.range.commonAncestorContainer;
        return ancestor;
    }
}

@Component({
    selector: 'm-htmlblock',
    templateUrl: ('./htmlblock.component.html'),
    styleUrls: [('./htmlblock.component.less')],

})
export class HtmlBlockComponent implements OnDestroy, OnInit, IWidgetContent {



    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ PRIVATE FIELDS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //

    private static currentEditing: any;
    private selection: Range;
    private inputSubcription: Subscription;
    private domSubcription: Subscription;
    private dirty: boolean;
    private hasFocus: boolean;
    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CONSTRUCTOR Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //


    constructor(private el: ElementRef) {

        // super(parent);

        //(<any>window).Mercury.trigger('reinitialize');
    }

    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ INPUTS AND OUTPUTS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //

    @Input()
    public widget: WidgetComponent;

    @Input()
    private htmlBlockContent: HtmlBlockContent;

    @ViewChild('editor')
    private editor: ElementRef;



    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ SELECTION MANAGEMENT Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //



    getSelection(): SelectionWrapper {
        return new SelectionWrapper(this.editor);
    }

    saveSelection() {
        var sel: Selection;
        this.selection = null;
        sel = window.getSelection();
        if (sel.rangeCount > 0) {
            return this.selection = sel.getRangeAt(0);
        }
    };

    restoreSelection() {
        var sel;
        if (!this.selection) {
            return;
        }
        sel = window.getSelection();
        sel.removeAllRanges();
        return sel.addRange(this.selection);
    };



    getCurrentEditing() {
        return HtmlBlockComponent.currentEditing;
    }

    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ INTERNALS METHODS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //



    private execCommand(command, param = null) {
        var e;
        try {
            this.restoreSelection();
            console.log('execCommand: ' + command);
            this.dirty = true;
            if (this.htmlBlockContent) {
                // this.htmlBlockContent.onChange();
            }
            return document.execCommand(command, false, param);
        } catch (_error) {
            e = _error;
        }
        return false;
    };


    private nextNode(node, container) {
        if (node.firstChild) {
            return node.firstChild;
        }
        while (node) {
            if (node === container) {
                return null;
            }
            if (node.nextSibling) {
                return node.nextSibling;
            }
            node = node.parentNode;
        }
        return null;
    };

    private toDataUrl(img) {
        var canvas, ctx, dataURL;
        if (img.complete) {
            if (_.startsWith(img.src, 'file') || _.startsWith(img.src, 'data')) {
                return;
            }
            canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            dataURL = canvas.toDataURL("image/png");

            img.src = dataURL;
            return this;
        } else {
            console.log('onload...');
            return img.onload = this.toDataUrl.bind(this, img);
        }
    };


    private closest(node, selector, context) {
        if (node.nodeType !== 1) {
            node = node.parentElement;
        }
        return node.closest(selector, context)
    }

    private convertImagesToDataUrl(){
        var images = this.editor.nativeElement.querySelectorAll("IMG");
        for (let img of images){
            this.toDataUrl(img);
        }

    }

    public static addToolbar(page) {
        console.log('TODO: add support for toolbar');

    }

    public updateModel(){
        //console.log("HTML Block: update Model");
        this.widget.model.contentData = this.html();
    }

    //
    // â”€â”€â”€ EVENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    //

    // @HostListener('onkeydown', ['$event'])
    onKeyDown(e) {
        var br, cl, newEle, range, sel;
        switch (e.keyCode) {
            case 13:
                sel = this.getSelection();
                //cl = sel.getCommonAncestor().closest('div.minima-chklist', this.editor);
                var ca = sel.getCommonAncestor();
                cl = this.closest(ca, 'div.minima-chklist', this.editor.nativeElement);
                if (cl) {
                    console.log('dentro a un todo');
                    e.preventDefault();
                    range = sel.range;
                    if (cl.innerText.length === 0) {
                        range.selectNode(cl);
                        range.deleteContents();
                        br = document.createElement("div");
                        br.innserHTML = "<br/>"
                        range.insertNode(br);
                        range = document.createRange();
                        range.setStartAfter(br[0]);
                        range.collapse(true);
                    } else {
                        // newEle = $('<div class="minima-chklist"><input type="checkbox" ></div>');
                        newEle = document.createElement("div");
                        newEle.className = "minima-chklist";
                        var input = document.createElement("INPUT");
                        input.setAttribute("type", "checkbox");
                        newEle.appendChild(input);
                        range.setStartAfter(cl);
                        range.deleteContents();
                        range.insertNode(newEle);
                        range = document.createRange();
                        range.setStartAfter(input);
                        range.collapse(true);
                    }
                    sel.selection.removeAllRanges();
                    return sel.selection.addRange(range);
                }
        }

        const inputObservable = Observable.fromEvent(this.editor.nativeElement, "input")
            .debounceTime(200);

        this.inputSubcription = inputObservable.subscribe(e => this.onInput(e));
        const domObservable = Observable.fromEvent(this.editor.nativeElement, "DOMNodeInserted")
            .debounceTime(200);

        this.domSubcription = domObservable.subscribe(e => this.onInput(e));

    }

    @HostListener('blur', ['$event'])
    onBlur(e) {
        //console.log("html blurred");
        this.hasFocus = false;
        this.saveSelection();
        this.updateModel();
        this.widget.onBlur(e);
    }

    @HostListener('focus', ['$event'])
    onFocus(e) {
        this.hasFocus = true;
        this.dirty = false;
    }


    // @HostListener('input', ['$event'])
    onInput(e) {
        
        if(this.hasFocus){
            if( (e.type == "DOMNodeInserted") && (e.newValue == e.prevValue))
                 return;
            this.dirty = true;
            this.updateModel();
            this.convertImagesToDataUrl();
        }
    }



    onSelectAll(): void {
        this.editor.nativeElement.focus();
        this.selectAll();
    }



    onChange(e) {
        //this.page.onBlur(this);
        console.log('TODO: handle htmlblock changed');
        // this.page.onWidgetChanged(this);
    }

    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ LIFECYCLE EVENTS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //

    ngOnDestroy() {
        if(this.inputSubcription)
            this.inputSubcription.unsubscribe();
        if(this.domSubcription)
            this.domSubcription.unsubscribe();
    }

    ngOnInit() {
        if(this.widget.model && this.widget.model.contentData){
            this.editor.nativeElement.innerHTML = this.widget.model.contentData;
        }
        this.editor.nativeElement.focus();
    }

    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ EXTERNAL METHODS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //

    canExecute(command, options) {
        return true;
    }

    getCurrentValue(command, options) {
        switch (command) {
            case 'hilite':
                return "red"
        }
    }

    isEmpty(): boolean {

        var isempty, node, text;
        isempty = true;
        node = this.editor.nativeElement;
        while (node) {
            node = this.nextNode(node, this.editor);
            if (!node) {

            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.nodeName === 'IMG') {
                    isempty = false;
                    break;
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                text = node.nodeValue;
                if (text && text.search(/[^\s]/) !== -1) {
                    isempty = false;
                    break;
                }
            }
        }
        return isempty;
    }

    isDirty() {
        return this.dirty;
    }

    html() {
        return this.editor.nativeElement.innerHTML;
    }

    text() {
        return this.editor.nativeElement.innerText;
    }

    getIndexableContent() {
        return this.text();
    }

    save(data) {
        // super.save(data);
        data.content = this.html();
        data.indexable = this.getIndexableContent();
    }

    restore(data) {

        // super.restore(data);
        this.editor.nativeElement.html(data.content);
        this.dirty = false;
    }

    //
    // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ FORMATTING Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    //

    selectAll() {
        return this.execCommand("selectAll");
    }
    backColor(color) {
        return this.execCommand('backColor', color);
    }

    hiliteColor(color) {
        return this.execCommand('hiliteColor', color);
    }

    foreColor(color) {
        return this.execCommand('foreColor', color);
    }

    fontSize(size) {
        return this.execCommand('fontSize', size);
    }

    fontName(name) {
        return this.execCommand('fontName', name);
    }

    formatBlock(tag) {
        this.execCommand("formatBlock", tag);
    }

    insertList(ordered) {
        return this.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
    }

    indent() {
        return this.execCommand('indent');
    }

    outdent() {
        return this.execCommand('outdent');
    }

    superscript() {
        return this.execCommand('superscript');
    }

    subscript() {
        return this.execCommand('subscript');
    }

    justifyFull() {
        return this.execCommand('justifyFull');
    }
    justifyCenter() {
        return this.execCommand('justifyCenter');
    }
    justifyRight() {
        return this.execCommand('justifyRight');
    }

    strikethrough() {
        return this.execCommand('strikethrough');
    }
    underline() {
        return this.execCommand('underline');
    }
    italic() {
        return this.execCommand('italic');
    }
    bold() {
        return this.execCommand('bold');
    }

    insertChkList() {
        return this.execCommand('insertHTML', '<div class="minima-chklist"><input type="checkbox" ></div>');
    }




}

export default HtmlBlockComponent;


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts


// WEBPACK FOOTER //
// D:/Progetti/MinimaAng/~/angular2-template-loader!D:/Progetti/MinimaAng/src/app/UI/htmlblock/htmlblock.component.ts