class Vector  {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }

    sub(vec) {
        return new Vector(this.x - vec.x, this.y - vec.y);

    }

    mult(a) {
        return new Vector(this.x * a, this.y * a);
    }

    abs() {
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    }

    getLength() {
        return Math.sqrt(Math.pow(this.x, 2) +
                         Math.pow(this.y, 2));
    }

    getUnitVector() {
        let l = this.getLength();
        return new Vector(this.x/l, this.y/l);
    }

    getPerpendicularRight() {
        let n = this.getUnitVector();
        return new Vector(-n.y, n.x);
    }

    getPerpendicularLeft() {
        let n = this.getUnitVector();
        return new Vector(n.y, -n.x);
    }

    static getMidpoint(vec1, vec2) {
        return new Vector((vec1.x + vec2.x)/2, (vec1.y + vec2.y)/2);
    }

    static getVectorFromPoints(vec1, vec2) {
        return new Vector(vec2.x - vec1.x, vec2.y - vec1.y);
    }
}

export { Vector };