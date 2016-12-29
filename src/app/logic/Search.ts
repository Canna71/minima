/**
 * Created by Gabriele on 17/08/2015.
 */
var w = (<any>window);
var searchIndex = w.require('search-index');

class Search {
    public static addPage(page){
        searchIndex({},function (err, si) {
            si.add({'batchName': 'onepage'}, [page], function (err) {
                if (!err) console.log('indexed!');
                else console.log(err);
            });
        });

    }

    public static search(query, callback) {
        var words = query.split(' ');
        var q = {query: {'*': words}};
        searchIndex({},function (err, si) {
            si.search(q, function (err, results) {
                //check for errors and do something with search results, for example this:
                if (!err) console.log(results)
            });
        });


    }
}

export default Search;