import { Point } from "./generics"
import { NodeObj } from "./node"

export default class ChargeParticle extends NodeObj{
  /** @type {number} */
  charge
  K = 9*Math.pow(10,9)

  static Charges = []
  fieldLines = []

  /**
   * 
   * @param {Point} target_position 
   * @returns 
   */
  eletric_field_at(target_position){
    const mod = this.K*(this.charge/Math.pow(target_position.distance_to(this.position),2))
    const dir = target_position.direction(this.position)
    if (!isFinite(mod)){
        return new Point(0,0)
    }
    // console.log(mod)
    return dir.multiply(mod)
  }

  /**
   * 
   * @param {Point} position 
   * @param {Array[ChargeParticle]} charges 
   */
  static get_field_from_array(position) {
    var vec = new Point(0,0)
    for(let i of ChargeParticle.Charges){
        const e = i.eletric_field_at(position)
        vec = vec.sum_point(e)
    }
    return vec
  }

  /**
   * 
   * @param {Point} position 
   * @param {ChargeParticle} self 
   * @returns {ChargeParticle|null}
   */
  static get_closest(position,self){
    var closest
    for(let i of ChargeParticle.Charges){
        if((!closest||closest.position.distance_to(position)>i.position.distance_to(position)) && !(i==self)){
          closest = i
        }
    }
    return closest
  }

  static charges_to_texture(){
    let data = []
    let points = 0
    for(let i of ChargeParticle.Charges){
      data.push(i.position.x)
      data.push(i.position.y)
      data.push(i.charge)
      points+=1
    }


    return [new Float32Array(data),points]
  }

  static clear_field_lines(){
    for(let i of ChargeParticle.Charges){
      i.fieldLines = []
    }
  }

  remove(){
    ChargeParticle.Charges = ChargeParticle.Charges.filter(x=>x!=this)
  }

  constructor(position,charge){
    super()
    this.position = position
    this.charge = charge
    ChargeParticle.Charges.push(this)
    ChargeParticle.Charges = ChargeParticle.Charges.sort((a,b) => b.charge-a.charge)
    console.log(ChargeParticle.Charges)
    this.name = "Carga"  
  }
}
