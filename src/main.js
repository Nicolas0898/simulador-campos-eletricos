import './style.css'
import ChargeParticle from './classes/chargeParticle'
import { Point } from './classes/generics'
import { ContextRender, WebglRender } from './render'
import testVertexShader from './shaders/test.glsl?raw'
import bufferlessVertex from './shaders/bufferlessfragment.glsl?raw'
import testFragmentShader from './shaders/testfragment.glsl?raw'
import pinkfragment from './shaders/pink.glsl?raw'

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
const charge3 = new ChargeParticle(new Point(200,300),-0.002)
// const charge4 = new ChargeParticle(new Point(200,600),-0.002)

// const charge3 = new ChargeParticle(new Point(200,600),-20)
// const charge4 = new ChargeParticle(new Point(600,100),20)


// render.drawCharge(charge1)
// render.drawCharge(charge2)
// render.drawCharge(charge3)
// render.drawCharge(charge3)
// render.drawField(40)
render.drawPathFromCharge(charge1,20)
render.drawPathFromCharge(charge2,20)
// render.drawPathFromCharge(charge3,20)
// render.drawPathFromCharge(charge4,20)

console.log(ChargeParticle.get_field_from_array(new Point(0,0)))




const glRender = new WebglRender(glcanvas)
/**
 * @type {WebGL2RenderingContext}
 */
const gl = glRender.context
console.log(glRender)
// console.log(test)



const vertex = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(vertex,testVertexShader)
gl.compileShader(vertex)

const fragment = gl.createShader(gl.FRAGMENT_SHADER)
gl.shaderSource(fragment,pinkfragment)
gl.compileShader(fragment)
console.log(gl.getShaderInfoLog(fragment));

const bufferless_vertex = gl.createShader(gl.VERTEX_SHADER)
gl.shaderSource(bufferless_vertex,bufferlessVertex)
gl.compileShader(bufferless_vertex)
console.log(gl.getShaderInfoLog(bufferless_vertex))

const program = gl.createProgram()
gl.attachShader(program,vertex)
gl.attachShader(program,fragment)
gl.linkProgram(program)
console.log(gl.getProgramParameter(program, gl.LINK_STATUS))
console.log(gl.getProgramInfoLog(program))

// const resolution = gl.getUniformLocation(program,"resolution")
// const charges = gl.getUniformLocation(program,"charges")
// const charge_count = gl.getUniformLocation(program,"charge_count")




const vertex_buffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER,vertex_buffer)
const vertex_buffer_pos = gl.getAttribLocation(program,"a_position")

const points = []
for(let i of ChargeParticle.Charges){
    points.push(-i.position.x/800.0)
    points.push(i.position.y/800.0)
    points.push(0)
    points.push(1)
}

gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW)

const vao = gl.createVertexArray()
gl.bindVertexArray(vao)
gl.enableVertexAttribArray(vertex_buffer_pos)
gl.vertexAttribPointer(vertex_buffer_pos,2,gl.FLOAT,false,0,0)

gl.useProgram(program)

// gl.uniform2fv(resolution,[800,800])
// gl.uniform1i(charge_count,ChargeParticle.Charges.length)
// let chargesarr = []
// for(let charge of ChargeParticle.Charges){
//     chargesarr.push(charge.position.x)
//     chargesarr.push(charge.position.y)
//     chargesarr.push(charge.charge)
// }
// gl.uniform3fv(charges,chargesarr)
// console.log(chargesarr)
// gl.bindVertexArray(vao2)
// gl.drawArrays(gl.TRIANGLES,0,3)

// const path = new Float32Array(render.calculatePathFromCharge(charge1).map(x=>x/800.0))
// const path2 = new Float32Array(render.calculatePathFromCharge(charge2).map(x=>x/800.0))
// const path3 = new Float32Array(render.calculatePathFromCharge(charge3).map(x=>x/800.0))
// const path4 = new Float32Array(render.calculatePathFromCharge(charge4).map(x=>x/800.0))
// gl.bindVertexArray(vao)
// gl.bufferData(gl.ARRAY_BUFFER,path,gl.STATIC_DRAW)
// gl.drawArrays(gl.POINTS,0,path.length)
// gl.bufferData(gl.ARRAY_BUFFER,path2,gl.STATIC_DRAW)
// gl.drawArrays(gl.POINTS,0,path2.length)
// gl.bufferData(gl.ARRAY_BUFFER,path3,gl.STATIC_DRAW)
// gl.drawArrays(gl.POINTS,0,path3.length)
// gl.bufferData(gl.ARRAY_BUFFER,path4,gl.STATIC_DRAW)
// gl.drawArrays(gl.POINTS,0,path4.length)



// gl.useProgram(program2)
// gl.drawArrays(gl.POINTS,0,500)

// gl.bindVertexArray(vao2)
// gl.drawArrays(gl.POINTS,0,3)

// console.log(path)


///// MOUSE REGION
requestAnimationFrame(upd)


var mx,my
function upd(){
    requestAnimationFrame(upd)
    charge2.position = new Point(mx,my)
    // render.context.reset()
    // render.drawPathFromCharge(charge1,20)
    // render.drawPathFromCharge(charge2,20)
    // render.drawPathFromCharge(charge3,20)
    // render.drawPathFromCharge(charge4,20)
    

    // let chargesarr = []
    // for(let charge of ChargeParticle.Charges){
    //     chargesarr.push(charge.position.x)
    //     chargesarr.push(charge.position.y)
    //     chargesarr.push(charge.charge)
    // }
    // gl.uniform3fv(charges,chargesarr)
    // gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,1,0,1  ,1,1,0,1  ,-1,-1,0,1,  1,-1,0,1,  -1,-1,0,1,  1,1,0,1]),gl.STATIC_DRAW)
    // gl.drawArrays(gl.TRIANGLES,0,6)
    const path = new Float32Array(render.calculatePathFromCharge(charge1,20,10).map(x=>(x/400.0) - 1))
    const path2 = new Float32Array(render.calculatePathFromCharge(charge2,20,10).map(x=>(x/400.0) - 1))
    const path3 = new Float32Array(render.calculatePathFromCharge(charge3,20,10).map(x=>(x/400.0) - 1))
    // const path4 = new Float32Array(render.calculatePathFromCharge(charge4,8,10).map(x=>(x/400.0) - 1))
    gl.bindVertexArray(vao)
    gl.lineWidth(1)
    gl.bufferData(gl.ARRAY_BUFFER,path,gl.STATIC_DRAW)
    gl.drawArrays(gl.LINES,0,path.length)
    gl.bufferData(gl.ARRAY_BUFFER,path2,gl.STATIC_DRAW)
    gl.drawArrays(gl.LINES,0,path2.length)
    gl.bufferData(gl.ARRAY_BUFFER,path3,gl.STATIC_DRAW)
    gl.drawArrays(gl.LINES,0,path3.length)
    // gl.bufferData(gl.ARRAY_BUFFER,path4,gl.STATIC_DRAW)
    // gl.drawArrays(gl.LINES,0,path4.length)    
}

window.addEventListener("mousemove",e=>{
    mx = e.clientX
    my = e.clientY

    // render.drawPathFromCharge(charge3,20)

})