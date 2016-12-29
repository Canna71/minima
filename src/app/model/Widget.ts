import { Subject } from 'rxjs/Rx';
import { EventEmitter, Output } from '@angular/core';
//Model class for widget

declare var _:any;

export class Widget {
    private _position: any;
    module: any;
    private _selected: boolean;
    private _contentData: any;

    get selected(): boolean {
        return this._selected;
    }

    set selected(val: boolean) {
        if (val !== this._selected) {
            this._selected = val;
            this.changed.next();
        }
    }

    get position():any {
        return this._position;
    }

    set position(value:any) {
        if(!_.isEqual(value, this._position)){
            this._position = value;
            this.changed.next();
        }
    }


    changed = new Subject();

    public get contentData(): any {
        return this._contentData;
    };

    public set contentData(value: any) {
        if (value !== this._contentData) {
            this._contentData = value;
            this.changed.next();
        }

    };

    constructor(where) {
        this.position = where;
    }

    save(data: any) {
        data.position = this.position;
        data.module = this.module;
        data.contentData = this.contentData;
    }

    restore(data) {
        this.position = data.position;
        this.module = data.module;
        this.contentData = data.contentData;
    }
}