/**
 * Created by gcannata on 13/06/2015.
 */
export default class Rect {

    top: number;
    left: number;
    right: number;
    bottom: number;

    constructor(top: number, right: number, bottom: number, left: number) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    get width(): number {
        return this.right - this.left;
    }

    get height(): number {
        return this.bottom - this.top;
    }

    get area(): number {
        return this.width * this.height;
    }
}

