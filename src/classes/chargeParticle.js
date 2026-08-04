import { Point } from "./generics"

export default class ChargeParticle{
  /** @type {Point} */
  position
  /** @type {number} */
  charge
  K = 9*Math.pow(10,9)

  static Charges = []

  /**
   * 
   * @param {Point} target_position 
   * @returns 
   */
  eletric_field_at(target_position){
    const mod = this.K*(this.charge/Math.pow(target_position.distance_to(this.position),2))
    const dir = target_position.direction(this.position)
    if (target_position.x==this.position.x && target_position.y==this.position.y){
        return new Point(0,0)
    }
    console.log(dir)
    return dir.multiply(mod)
  }

  /**
   * 
   * @param {Point} position 
   * @param {Array[ChargeParticle]} charges 
   */
  static get_field_from_array(position,charges) {
    var vec = new Point(0,0)
    for(let i of ChargeParticle.Charges){
        const e = i.eletric_field_at(position)
        vec = vec.sum_point(e)
    }
    return vec
  }

  constructor(position,charge){
    this.position = position
    this.charge = charge
    ChargeParticle.Charges.push(this)
    
  }
}
