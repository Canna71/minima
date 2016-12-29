/**
 * Created by gcannata on 28/06/2015.
 */



    function replacer(key, value){
        if(typeof value === 'object' && value !== null){
            value.__type = value.constructor.name;
        }
        if(key.indexOf('__')==0 && key !== '__type'){
            return undefined;
        }
        return value;
    }

    function serialize(p){
        //p.__type = 'Person';

        var str = JSON.stringify(p,replacer);
        delete(p.__type);
        return str;
    }



    function deserialize(str,resolve){

        function toCtor(name){
            if(!resolve) return Object;
            var ctor;
            try{
                ctor = eval(name);
            } catch(e) {
                if(typeof resolve === 'function'){
                    ctor = resolve(name);
                } else if (resolve instanceof Array){
                    for(var i=0;i<resolve.length;i++){
                        if(typeof resolve[i] === 'function' && resolve[i].name === name){
                            return resolve[i];
                        }
                        ctor = toCtor[resolve[i]];
                        if(ctor) break;
                    }
                } else {
                    ctor = resolve[name];
                }
            }

            return ctor;
        }

        function revive(ob){
            if(ob.__type){
                var ctor = toCtor(ob.__type);
                if(!ctor){
                    throw new Error('Deserialization Error: cannot find constructor for type <' + ob.__type+'>');
                }
                var f = new Function("return function "+ob.__type+"(){}")();
                f.prototype = ctor.prototype;
                f.prototype.constructor = ctor;
                var deserialized = new f();

                delete(ob.__type);

                //$.extend(deserialized,ob);
                for(var prop in ob){
                    deserialized[prop] = revive(ob[prop]);
                }

                return deserialized;
            }
            if (ob instanceof Array){
                for(var i=0;i<ob.length;i++){
                    ob[i] = revive(ob[i]);
                }
            }

            return ob;
        }

        var tmp = JSON.parse(str);
        return revive(tmp);
    }



export class Serialization  {


    public static serialize(object: any): string {
        return serialize(object);
    }

    public static deserialize(str: string, resolve: any): any {
        return deserialize(str, resolve);
    }
}

export default Serialization;