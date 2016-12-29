import PageInfo from '../logic/PageInfo';
import { Injectable } from '@angular/core';
//import * as fs from 'fs';
//import * as path from 'path';
var electron = (<any>window).require('electron')
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require("fs"));
var path = (<any>window).require('path');
//import * as fs from 'fs';

@Injectable()
export class StorageService {
    // private  DATA_FOLDER: string;
    private PAGE_FILE_NAME = "data.json";
    private MAX_SUBPAGES = 10000;

    constructor() {
        console.log("Storage Service built ", __dirname);


    }

    private get datafolder() {
        return electron.remote.app.getAppPath() + "\\files\\";
    }

    public getPageByPath(pagepath: string, outputstats?) {
        //var parts = path.split('/');
        var fullPath = this.getPageFullPath(pagepath);
        return fs.statAsync(fullPath)
            .then(function (stats) {
                if (outputstats) {
                    Object.assign(outputstats, stats);
                }
                return fs.readFileAsync(fullPath);
            });
    }

    public savePageToPath(pagepath: string, data: string) {
        //var parts = path.split('/');
        var basePath = path.join(this.datafolder, pagepath);
        var fullPath = path.join(basePath, this.PAGE_FILE_NAME);

        var promise = new Promise((resolve, reject) => {

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

    public  getNewSubPagePath(parent:string):string {
        var i = 0;
        do
        {
            var newPath = path.join(this.datafolder,parent,i.toString());
            if(!fs.existsSync(newPath)){

                return path.relative(this.datafolder, newPath);
            }
            i++;

        }while(i<this.MAX_SUBPAGES)
        throw Error('Maximum number of subpages reached: '+parent)
    }

    public  getSubPages(parent:string) {


        var basePath = this.getPageBasePath(parent);
        var subPages = [];

        return new Promise(function (resolve, reject) {
            fs.readdir(basePath, function (err, files) {
                if (err) {
                    reject(err);
                }
                else {

                    var promises = [];
                    for (var i = 0; i < files.length; i++) {
                        //filter directories
                        var fpath = path.join(basePath, files[i]);
                        var stat = fs.statSync(fpath);
                        if (stat.isDirectory()) {
                            var relative = path.relative(this.datafolder, fpath);
                            promises.push(this.getPageInfo(relative));
                        }
                    }

                    resolve(Promise.all(promises));
                }


            });
        });


    }
    

    private getPageInfo(page:string){
        console.log(page);
        var promise = new Promise(function(resolve, reject){
            var stats:any = {};
            return this.getPageByPath(page, stats)

                .then(function(data){
                    try{
                        var p = JSON.parse(data);

                        var pageinfo = new PageInfo(page, p.title, stats.birthtime, stats.mtime);
                        resolve(pageinfo);
                    }
                    catch(ex){
                        reject(ex);
                    }
                })

        });

        return promise;

    }

    getPageFullPath(pagepath: string = '/') {
        var fullPath = path.join(this.datafolder, pagepath, this.PAGE_FILE_NAME);
        return fullPath;
    }

    private getPageBasePath(pagepath: string) {
        pagepath = pagepath || '/';
        var basePath = path.join(this.datafolder, pagepath);
        return basePath;
    }
}
