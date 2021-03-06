import { Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { PageComponent } from '../page/page.component';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

// spell checking stuff
var electron_spellchecker = (<any>window).require('electron-spellchecker');
var { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } = electron_spellchecker;

@Component({
    selector: 'm-main',
    template: require('./main.component.html'),
    styles: [require('./main.component.less')]
})
export class MainComponent implements OnInit, OnDestroy {

    private path: string;
    private sub: Subscription;

    @ViewChild(PageComponent)
    private page: PageComponent;
    constructor(private storage: StorageService, private router: Router, private route: ActivatedRoute) {

    }


    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.path = params['path'];
            console.log('Now we should load ', this.path);
            this.load(this.path);
        });
        this.initSpellChecker();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    initSpellChecker() {
        (<any>window).spellCheckHandler = new SpellCheckHandler();
        (<any>window).spellCheckHandler.attachToInput();

        // Start off as US English, America #1 (lol)
        (<any>window).spellCheckHandler.switchLanguage('en-US');

        let contextMenuBuilder = new ContextMenuBuilder((<any>window).spellCheckHandler);
        let contextMenuListener = new ContextMenuListener((info) => {
            contextMenuBuilder.showPopupMenu(info);
        });
    }


    load(path: string) {
        //see app2.coffee
        var stats = {};
        this.storage.getPageByPath("/", stats)
            .then((str) => {
                this.page.load(str);
                return;
            })
            .catch((err) => {
                console.log(err);
                if (err.errno == -4058) //FILE NOT FOUND
                    this.page.load("{}");

                return true;
            });

    }
}
