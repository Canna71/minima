// import { Widget } from './Widget';
import { WidgetComponent } from '../UI/page/widget.component';
export interface IWidgetContent {
    widget: WidgetComponent

    updateModel();
    restore(data:any);
    isDirty():boolean;
    isEmpty():boolean;
}