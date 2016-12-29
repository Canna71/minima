import { Injectable } from '@angular/core';
//import * as fs from 'fs';
import * as path from 'path';
var electron = (<any>window).require('electron')
var fs = (<any>window).require('fs');

@Injectable()
export class StorageService {
    // private  DATA_FOLDER: string;
    private  PAGE_FILE_NAME = "data.json";
    private  MAX_SUBPAGES = 10000;

    constructor() {
        console.log("Storage Service built ", __dirname);
        

    }

    private get datafolder(){
        return electron.remote.app.getAppPath() + "\\files\\";
    }

    public savePageToPath(pagepath: string, data: string) {
        //var parts = path.split('/');
        var basePath = path.join(this.datafolder, pagepath);
        var fullPath = path.join(basePath, this.PAGE_FILE_NAME);

        var promise = new Promise( (resolve, reject) => {

            if (!fs.existsSync(basePath)) {
                fs.mkdirSync(basePath);

            }

            fs.writeFile(fullPath, data, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            })

        });

        return promise;
    }


    getPageFullPath(pagepath: string = '/') {
        var fullPath = path.join(this.datafolder, pagepath, this.PAGE_FILE_NAME);
        return fullPath;
    }
}
