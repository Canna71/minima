import { Component, OnInit } from '@angular/core';

// spell checking stuff
// var electron_spellchecker = (<any>window).require('electron-spellchecker');
// var { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } = electron_spellchecker;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {



  ngOnInit(): void {
    // this.initSpellChecker();
  }

  // initSpellChecker() {
  //   (<any>window).spellCheckHandler = new SpellCheckHandler();
  //   (<any>window).spellCheckHandler.attachToInput();

  //   // Start off as US English, America #1 (lol)
  //   (<any>window).spellCheckHandler.switchLanguage('en-US');

  //   let contextMenuBuilder = new ContextMenuBuilder((<any>window).spellCheckHandler);
  //   let contextMenuListener = new ContextMenuListener((info) => {
  //     contextMenuBuilder.showPopupMenu(info);
  //   });
  // }
}
