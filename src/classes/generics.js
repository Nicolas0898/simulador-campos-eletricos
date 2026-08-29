export class Point{
  /** @type {number} */
  x
  /** @type {number} */
  y

  /**
   * 
   * @param {Point} to 
   */
  distance_to(to){
    return Math.sqrt(Math.pow(Math.abs(Math.abs(this.x)-Math.abs(to.x)),2) + Math.pow(Math.abs(Math.abs(this.y)-Math.abs(to.y)),2))
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x,y){
    this.x = parseFloat(x)
    this.y = parseFloat(y)
  }

  magnitude(){
    return Math.hypot(this.x,this.y)
  }


  direction(other){
    return this.subtract_point(other).normalize()
  }

  subtract_point(other){
    return new Point(this.x-other.x,this.y-other.y)
  }

  sum_point(other){
    return new Point(this.x+other.x,this.y+other.y)
  }

  normalize(){
    const magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    if (magnitude === 0) {
        return new Point(0,0);
    }
    return new Point(this.x/magnitude,this.y/magnitude)
  }

  divide(n){
    return new Point(this.x/n,this.y/n)
  }
 
  multiply(n){
    return new Point(this.x*n,this.y*n)
  }

  round(){
    return new Point(Math.round(this.x),Math.round(this.y))
  }

  dot(other){
    // //console.log(this.x,this.y,other.x,other.y)
    return (this.x*other.x+this.y*other.y)
  }
}
