import './style.css'
import ChargeParticle from './classes/chargeParticle'
import { Point } from './classes/generics'
import { ContextRender, WebglRender } from './render'
import test from './shaders/test.glsl?raw'

/////////////////////////////////////////////
//              PROGRAM
/////////////////////////////////////////////

/**
 * @type {HTMLCanvasElement}
 */
var canvas = document.getElementById("maincanvas")
var glcanvas = document.getElementById("glcanvas")

const render = new ContextRender(canvas)

const charge1 = new ChargeParticle(new Point(400,200),0.0002)
const charge2 = new ChargeParticle(new Point(500,400),0.0002)
const charge3 = new ChargeParticle(new Point(200,300),0.002)
const charge4 = new ChargeParticle(new Point(200,600),-0.002)

// const charge3 = new ChargeParticle(new Point(200,600),-20)
// const charge4 = new ChargeParticle(new Point(600,100),20)


// render.drawCharge(charge1)
// render.drawCharge(charge2)
// render.drawCharge(charge3)
// render.drawCharge(charge3)
// render.drawField(40)
render.drawPathFromCharge(charge1,20)
render.drawPathFromCharge(charge2,20)
render.drawPathFromCharge(charge3,20)
render.drawPathFromCharge(charge4,20)

console.log(ChargeParticle.get_field_from_array(new Point(0,0)))


// requestAnimationFrame(upd)


/////// MOUSE REGION
// var mx,my
// function upd(){
//     requestAnimationFrame(upd)
//     charge2.position = new Point(mx,my)
//     render.context.reset()
//     render.drawPathFromCharge(charge1,20)
//     render.drawPathFromCharge(charge2,20)
//     render.drawPathFromCharge(charge3,20)
//     render.drawPathFromCharge(charge4,20)
// }

// window.addEventListener("mousemove",e=>{
//     mx = e.clientX
//     my = e.clientY

//     // render.drawPathFromCharge(charge3,20)

// })

const glRender = new WebglRender(glcanvas)
/**
 * @type {WebGL2RenderingContext}
 */
const gl = glRender.context
console.log(glRender)
console.log(test)
