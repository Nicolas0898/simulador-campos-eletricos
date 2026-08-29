import './css/style.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import ChargeParticle from './classes/chargeParticle'
import { Point } from './classes/generics'
import { ContextRender, WebglRender } from './render'
import { UserInteraction } from './classes/userInteraction'
import testCharge from './classes/testCharge'
import 'bootstrap/dist/js/bootstrap'
import SimulatorConfiguration from './classes/configuration'



/////////////////////////////////////////////
//              PROGRAM
/////////////////////////////////////////////

new ChargeParticle(new Point(500,400),-0.02)
new ChargeParticle(new Point(700,300),0.02)

/**
 * @type {HTMLCanvasElement}
 */
var glcanvas = document.getElementById("glcanvas")
const glRender = new WebglRender(glcanvas)
const userInteraction = new UserInteraction(glcanvas)
SimulatorConfiguration.setup()
SimulatorConfiguration.currentRenderer = glRender
SimulatorConfiguration.currentUserInteraction = userInteraction
/**
 * @type {WebGL2RenderingContext}
 */
const gl = glRender.context

const lines = document.getElementById("lines")
const arrows = document.getElementById("arrows")
function update(){
    const bg = document.querySelector("[name='bg']:checked").value
    ChargeParticle.clear_field_lines()
    glRender.clear()
    // glRender.drawNormalBackground()
    if(bg!="n"){
        glRender.drawBackground(bg)
    }
    if(lines.checked){
        glRender.drawFieldLines(ChargeParticle.Charges)
    }
    if(arrows.checked){
        glRender.drawFieldVectorArrow(20)
    }
    // glRender.drawLine([[new Point(10,10), new Point(100,100)]],1)
    glRender.drawCharges(ChargeParticle.Charges)
    glRender.drawTestCharges(testCharge.testCharges)
    
    // glRender.drawArrow(400,400,10,Math.PI,1)
    

    requestAnimationFrame(update)
}
update()

// glcanvas.addEventListener("mousemove",e=>{
//     const rect = glcanvas.getBoundingClientRect()
//     console.log(rect)
//     charges[0].position.x = e.offsetX/rect.width * gl.canvas.width
//     charges[0].position.y = e.offsetY/rect.height * gl.canvas.height
// })
SimulatorConfiguration.printInfo()