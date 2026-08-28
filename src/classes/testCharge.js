import ChargeParticle from "./chargeParticle"
import { Point } from "./generics"
import { NodeObj } from "./node"

export default class testCharge extends NodeObj{
    static testCharges = []
    charge = 0.0
    name = "Carga de Teste"
    scale = 0.15

    getForce(){
        var field_vec = ChargeParticle.get_field_from_array(this.position)
        var force = field_vec.multiply(this.charge)

        return force
    }


    remove(){
        testCharge.testCharges = testCharge.testCharges.filter(x=> x!=this)
    }


    constructor(pos,charge){
        super()
        this.position = pos
        this.charge = charge
        testCharge.testCharges.push(this)
    }

}