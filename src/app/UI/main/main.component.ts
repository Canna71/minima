import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'm-main',
  template: require('./main.component.html'),
  styles: [require('./main.component.less')]
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
