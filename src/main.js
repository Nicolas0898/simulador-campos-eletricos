import './style.css'
import ChargeParticle from './classes/chargeParticle'
import { Point } from './classes/generics'
import { ContextRender, WebglRender } from './render'



/////////////////////////////////////////////
//              PROGRAM
/////////////////////////////////////////////

/**
 * @type {HTMLCanvasElement}
 */
// var canvas = document.getElementById("maincanvas")
var glcanvas = document.getElementById("glcanvas")

// const render = new ContextRender(canvas)
const glRender = new WebglRender(glcanvas)
/**
 * @type {WebGL2RenderingContext}
 */
const gl = glRender.context

// const charge1 = new ChargeParticle(new Point(400,200),-0.0002)
// const charge2 = 
// const charge3 = 
// const charge4 = new ChargeParticle(new Point(200,600),0.02)
const charges=[
    // new ChargeParticle(new Point(500,400),0.02),
    // new ChargeParticle(new Point(700,300),0.02),
    new ChargeParticle(new Point(200,300),0.02),
    new ChargeParticle(new Point(200,700),-0.02),
]


function update(){
    gl.clear(gl.COLOR_BUFFER_BIT)
    glRender.drawFieldLines(charges)
    glRender.drawFieldVectorArrow(20)
    glRender.drawCharges(charges)
    // glRender.drawArrow(400,400,10,Math.PI,1)
    

    requestAnimationFrame(update)
}
update()

glcanvas.addEventListener("mousemove",e=>{
    charges[0].position.x = e.clientX
    charges[0].position.y = e.clientY
})


