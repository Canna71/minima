import { WidgetComponent } from '../UI/page/widget.component';
import { Widget } from './Widget';
// import { WidgetComponent } from '../UI/page/WidgetComponent';
import HtmlBlock from '../UI/htmlblock/htmlblock.component';
import { PageComponent } from '../UI/page/page.component';
/**
 * Created by gcannata on 13/08/2015.
 */

// import Page from './Page';

export class WidgetFactory {

    public static createComponent(module:string, container:any, widget:WidgetComponent, options?:any):any{
        //var W = ((<any>window).require(module));
        //var W = require(module);
        //TODO: make dynamic someway
        // var W = HtmlBlock;
        // var ob = <WidgetComponent>new W(container,page, options);
        // ob._module = module;
        return null;
    }

    public static restoreWidget(data:any, container:any, widget:WidgetComponent, options?:any){
        var module = data.module;
        var comp = WidgetFactory.createComponent(module,container,widget);
        comp.restore(data);
        return widget;
    }

}

export default WidgetFactory;