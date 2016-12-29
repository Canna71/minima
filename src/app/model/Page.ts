import { StorageService } from '../services/storage.service';
import { Widget } from './Widget';
import Rect from '../canvas/Rect';
import Point from '../canvas/Point';
import Brush from '../canvas/Brush';
import StrokeShape from '../canvas/shapes/StrokeShape';
import EllipseShape from '../canvas/shapes/EllipseShape';
import LineShape from '../canvas/shapes/LineShape';
import { TriangleShape } from '../canvas/shapes/TriangleShape';
import { BoxShape } from '../canvas/shapes';
import Serialization from '../logic/Serialization';
import BaseShape from '../canvas/shapes/BaseShape';


// var fs = require('fs');

// declare var _;
// declare var minima;
// declare var $:any;

export class Page {



    constructor(private storage: StorageService, public title: string = "", public creationDate: Date = new Date(), private _widgets: Widget[] = [], private _shapes: BaseShape[] = []) {

    }

    get widgets() {
        return this._widgets;
    }

    get shapes():BaseShape[] {
        return this._shapes;
    }

    set shapes(value:BaseShape[]) {
        this._shapes=value;
    }

    serialize(): any {


        var widgetsData = [];
        for (var i = 0; i < this._widgets.length; i++) {
            var data = {};
            this._widgets[i].save(data);
            widgetsData.push(data);
        }

        var str = Serialization.serialize(
            {
                title: this.title,
                creationDate: this.creationDate,
                shapes: this.shapes,
                widgets: widgetsData
            });
        //TODO: transform the array into a map for improved performance
        //var ob = Serialization.deserialize(str,[BoxShape, TriangleShape, LineShape, EllipseShape, StrokeShape, Brush, Point]);

        return str;
    }

    static deserialize(str: string): Page {

        var data = Serialization.deserialize(str, [BoxShape, TriangleShape, LineShape, EllipseShape, StrokeShape, Brush, Point]);

        return new Page(data.title, data.creationDate, data.widgets, data.shapes);
    }

    save() {
        var str = this.serialize();
        this.storage.savePageToPath('/', str)
            .then((data) =>
            { console.log('page saved '); }
            )
            .catch((err) =>
            { throw err }
            );

    }


}

export default Page;