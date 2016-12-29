import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './UI/main/main.component';
import { PageComponent } from './UI/page/page.component';
import { CanvasComponent } from './UI/canvas/canvas.component';
import { WidgetComponent } from './UI/page/widget.component';
import { HtmlBlockComponent } from './UI/htmlblock/htmlblock.component';
import { DraggableDirective, DragHandleDirective } from './UI/directives/draggable.directive';
import { ResizableDirective } from './UI/directives/resizable.directive';
import { StorageService } from './services/storage.service';


@NgModule({
  imports: [
    HttpModule,
    AppRoutingModule,
    BrowserModule
  ],
  declarations: [ AppComponent, MainComponent, MainComponent, PageComponent,  
  CanvasComponent, WidgetComponent, DraggableDirective, DragHandleDirective, ResizableDirective, HtmlBlockComponent ],
  entryComponents: [HtmlBlockComponent],
  providers: [StorageService],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
