import { StorageService } from '../../services/storage.service';
import { PageComponent } from '../page/page.component';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'm-main',
    template: require('./main.component.html'),
    styles: [require('./main.component.less')]
})
export class MainComponent implements OnInit {

    @ViewChild(PageComponent)
    private page: PageComponent;
    constructor(private storage: StorageService) { }

    ngOnInit() {
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
