import './css/style.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import ChargeParticle from './classes/chargeParticle'
import { Point } from './classes/generics'
import { ContextRender, WebglRender } from './render'



/////////////////////////////////////////////
//              PROGRAM
/////////////////////////////////////////////
const charges=[
    new ChargeParticle(new Point(500,400),-0.2),
    new ChargeParticle(new Point(700,300),0.02),
    new ChargeParticle(new Point(200,300),0.2),
    new ChargeParticle(new Point(100,700),0.02),
    new ChargeParticle(new Point(800,700),-0.02),
    new ChargeParticle(new Point(1000,300),0.02),
    // new ChargeParticle(new Point(1000,1000),0.2),
    // new ChargeParticle(new Point(0,0),0.2),
    // new ChargeParticle(new Point(500,500),-1.0),
]
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



function update(){
    gl.clear(gl.COLOR_BUFFER_BIT)
    ChargeParticle.clear_field_lines()
    // glRender.drawNormalBackground()
    // glRender.drawBackground(0)
    glRender.drawFieldLines(charges)
    // glRender.drawFieldVectorArrow(20)
    // glRender.drawLine([[new Point(10,10), new Point(100,100)]],1)
    glRender.drawCharges(charges)
    
    // glRender.drawArrow(400,400,10,Math.PI,1)
    

    requestAnimationFrame(update)
}
update()

glcanvas.addEventListener("mousemove",e=>{
    const rect = glcanvas.getBoundingClientRect()
    console.log(rect)
    charges[0].position.x = e.offsetX/rect.width * gl.canvas.width
    charges[0].position.y = e.offsetY/rect.height * gl.canvas.height
})


