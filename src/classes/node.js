export class NodeObj{
    static globalid = 0
    id = 0
    name

    constructor(){
        NodeObj.globalid+=1
        this.id=NodeObj.globalid
    }
}