import './style.css'
import ChargeParticle from './classes/chargeParticle'
import { Point } from './classes/generics'
import { ContextRender } from './render'

/////////////////////////////////////////////
//              PROGRAM
/////////////////////////////////////////////

/**
 * @type {HTMLCanvasElement}
 */
var canvas = document.getElementById("maincanvas")

const render = new ContextRender(canvas)
const charge1 = new ChargeParticle(new Point(200,200),20)
const charge2 = new ChargeParticle(new Point(400,400),-20)
const charge3 = new ChargeParticle(new Point(200,600),20)


render.drawCharge(charge1)
render.drawCharge(charge2)
render.drawCharge(charge3)
render.drawField(20)

// context.
console.log(charge1.eletric_field_at(new Point(0,0)))
console.log(ChargeParticle.get_field_from_array(new Point(0,0)))
