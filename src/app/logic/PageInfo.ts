/**
 * Created by gcannata on 17/08/2015.
 */
class PageInfo {
    public id: string;
    public title: string;
    public lastModified: Date;
    public created: Date;

    constructor(id, title, created, lastModified){
        this.id = id;
        this.title = title;
        this.created = created;
        this.lastModified = lastModified || created;
    }
}

export default PageInfo;