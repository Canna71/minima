/**
 * Created by gcannata on 14/08/2015.
 */

var w = (<any>window);
var fs = w.require('fs');
var path = w.require('path');
var Promise = w.require('bluebird');
Promise.promisifyAll(fs);
import PageInfo from './PageInfo';

class Storage {
    public static DATA_FOLDER:string;
    private static PAGE_FILE_NAME="data.json";
    private static MAX_SUBPAGES= 10000;

    public static getPageByPath(pagepath:string, outputstats?){
        //var parts = path.split('/');
        var fullPath = Storage.getPageFullPath(pagepath);
        return fs.statAsync(fullPath)
        .then(function(stats){
            $.extend(outputstats,stats);
            return fs.readFileAsync(fullPath);
        });
    }

    public static savePageToPath(pagepath:string, data:string){
        //var parts = path.split('/');
        var basePath = path.join(Storage.DATA_FOLDER,pagepath);
        var fullPath = path.join(basePath,Storage.PAGE_FILE_NAME);

        var promise = new Promise(function(resolve,reject) {

            if(!fs.existsSync(basePath)){
                fs.mkdirSync(basePath);

            }

            fs.writeFile(fullPath,data, function (err, res) {
                if (err ) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            })

        });

        return promise;
    }

    public static getNewSubPagePath(parent:string):string {
        var i = 0;
        do
        {
            var newPath = path.join(Storage.DATA_FOLDER,parent,i.toString());
            if(!fs.existsSync(newPath)){

                return path.relative(Storage.DATA_FOLDER, newPath);
            }
            i++;

        }while(i<Storage.MAX_SUBPAGES)
        throw Error('Maximum number of subpages reached: '+parent)
    }

    /*
    public static getSubPages(parent:string){

        var basePath = Storage.getPageBasePath(parent);
        var subPages = [];
        fs.readdir(basePath, function(err,files){
            console.log(files);
            var p = Promise.resolve([]);
            for(var i=0;i<files.length;i++){
                //filter directories
                (function(i){
                    var fpath = path.join(basePath,files[i]);
                    var stat = fs.statSync(fpath);
                    if (stat.isDirectory()){
                        var relative = path.relative(Storage.DATA_FOLDER,fpath);
                        p = p.then(function(aggr){return Storage.getPageInfo(relative).then(
                            function(pi){
                                aggr.push(pi);
                                return aggr;
                            }
                        )});
                    }

                })(i);
            }

     p.then(function(aggr){
     console.log(aggr);
            })

        });
    }
     */

    public static getSubPages(parent:string) {


        var basePath = Storage.getPageBasePath(parent);
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
                            var relative = path.relative(Storage.DATA_FOLDER, fpath);
                            promises.push(Storage.getPageInfo(relative));
                        }
                    }

                    resolve(Promise.all(promises));
                }


            });
        });


    }

    private static getPageInfo(page:string){
        console.log(page);
        var promise = new Promise(function(resolve, reject){
            var stats:any = {};
            return Storage.getPageByPath(page, stats)

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

    private static getPageFullPath(pagepath:string){
        var fullPath = path.join(Storage.DATA_FOLDER,pagepath,Storage.PAGE_FILE_NAME);
        return fullPath;
    }

    private static getPageBasePath(pagepath:string){
        pagepath = pagepath || '/';
        var basePath = path.join(Storage.DATA_FOLDER,pagepath);
        return basePath;
    }
}

export default Storage;