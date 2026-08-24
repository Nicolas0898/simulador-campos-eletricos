import ChargeParticle from "./classes/chargeParticle"
import { Point } from "./classes/generics"
import charge from './shaders/vertex/charge.glsl?raw'
import solid from './shaders/fragment/solid.glsl?raw'
import normalFragment from './shaders/fragment/normal.glsl?raw'

const GLSL_MACROS = [
    [/#clip ?\(\s*(\w+)\s*,\s*(\w+)\s*\)/gm, "(($1/$2 - 0.5) * 2.0) * vec2(1,-1)"]
];

export class WebglRender {
    /**
 * @type {HTMLCanvasElement}
 */
    canvas
    /**
     */
    context


    // ChargeRenderStates
    /** @type {WebGLProgram} */
    chargeProgram
    /** @type {WebGLBuffer} */
    chargeBuffer
    /** @type {WebGLVertexArrayObject} */
    chargeVAO
    chargeUniforms = {}
    
    
    /** @type {WebGLProgram} */
    normalProgram
    /** @type {WebGLBuffer} */
    normalBuffer
    /** @type {WebGLVertexArrayObject} */
    normalVAO
    /** @type {WebGLTexture} */
    normalTEXTURE
    normalUniforms = {}

    static NUMBER_OF_LINE_STEPS = 400

    constructor(canvas) {
        this.canvas = canvas
        this.context = this.canvas.getContext("webgl2")
        const gl = this.context
        // this.context.imageSmoothingEnabled = false;
        // this.canvas.style.imageRendering = "pixelated"

        /////// ChargeRender configuration
        {
            const vertex = this.loadShader(gl.VERTEX_SHADER, charge)
            const fragment = this.loadShader(gl.FRAGMENT_SHADER, solid)
            this.chargeProgram = this.createProgram(vertex, fragment)
            this.chargeBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)


            const inputPos = gl.getAttribLocation(this.chargeProgram, "position")
            const resolutionPos = gl.getUniformLocation(this.chargeProgram, "resolution")
            const colorPos = gl.getUniformLocation(this.chargeProgram, "inColor")
            this.chargeUniforms.resolution = resolutionPos
            this.chargeUniforms.color = colorPos

            this.chargeVAO = gl.createVertexArray()
            gl.bindVertexArray(this.chargeVAO)
            gl.enableVertexAttribArray(inputPos)
            gl.vertexAttribPointer(inputPos, 2, gl.FLOAT, false, 0, 0)

            gl.useProgram(this.chargeProgram)
            gl.uniform2fv(resolutionPos, [gl.canvas.width, gl.canvas.height])
            gl.uniform4fv(colorPos, [0, 0, 0, 1.0])
        }

        {
            const vertex = this.loadShader(gl.VERTEX_SHADER,charge)
            const fragment = this.loadShader(gl.FRAGMENT_SHADER,normalFragment)
            const program = this.createProgram(vertex,fragment)
            this.normalProgram = program

            const inputPos = gl.getAttribLocation(this.normalProgram, "position")
            const resolutionPos = gl.getUniformLocation(this.normalProgram, "resolution")
            const point_n = gl.getUniformLocation(this.normalProgram, "point_n")
            const typePos = gl.getUniformLocation(this.normalProgram, "type")

            this.normalUniforms.inputPos = inputPos
            this.normalUniforms.resolutionPos = resolutionPos
            this.normalUniforms.point_n = point_n
            this.normalUniforms.type = typePos

            const vao = gl.createVertexArray()
            this.normalVAO = vao

            const buffer = gl.createBuffer()
            this.normalBuffer = buffer

            const texture = gl.createTexture()
            const texturePos = gl.getUniformLocation(this.normalProgram,"point_data")
            this.normalTEXTURE = texture
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D,texture)
            
            const [data_texture,points] = ChargeParticle.charges_to_texture()
            console.log(data_texture,points)
            
            gl.pixelStorei(gl.UNPACK_ALIGNMENT,1)
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB32F,1,points,0,gl.RGB,gl.FLOAT,data_texture)
            // gl.generateMipmap(gl.TEXTURE_2D)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            const heatmapTexture = gl.createTexture();
            const heatPos = gl.getUniformLocation(program,"heatmap");
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D,heatmapTexture)
            gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,3,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([
                0,0,100,255,
                200,200,255,255,
                255,200,255,255,
            ]))
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)

            gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
            gl.bindVertexArray(vao)
            gl.enableVertexAttribArray(inputPos)
            gl.vertexAttribPointer(inputPos,2,gl.FLOAT,false,0,0)

            gl.useProgram(this.normalProgram)
            gl.uniform1i(texturePos,0)
            gl.uniform1i(heatPos,1)
            gl.uniform2fv(resolutionPos, [gl.canvas.width, gl.canvas.height])
            gl.uniform1i(point_n,points)
            gl.uniform1i(typePos,1)


        }


        gl.viewport(0,0,gl.canvas.width,gl.canvas.height)
    }

    clear(){
        const gl = this.context
        gl.clear(gl.COLOR_BUFFER_BIT)

        // gl.useProgram(this.chargeProgram)
        // gl.bindVertexArray(this.chargeVAO)
        // gl.uniform4fv(this.chargeUniforms.color,[0,0,0,0.5])
        // gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)
        // const size = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE)/
        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(size), gl.STATIC_DRAW)
        // gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(size))
        // gl.drawArrays(gl.TRIANGLES, 0, 0)
    }
    /**
     * 
     * @param {GLenum} type 
     * @param {String} source 
     */
    loadShader(type, source, disableMacros = false) {
        const gl = this.context
        var shader = gl.createShader(type)
        var compiled_source = source

        for (const [regex, replacement] of GLSL_MACROS) {
            console.log(regex, replacement)
            /** @type {RegExp} */
            // const regex = new RegExp(pattern,"g")
            console.log(regex)
            compiled_source = compiled_source.replace(regex, replacement)
        }
        console.log(compiled_source)

        gl.shaderSource(shader, compiled_source)
        gl.compileShader(shader)

        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if (success) {
            return shader
        }

        const error = gl.getShaderInfoLog(shader)
        console.warn(error)
    }

    createProgram(vertex, fragment) {
        const gl = this.context
        const program = gl.createProgram()
        gl.attachShader(program, vertex)
        gl.attachShader(program, fragment)
        gl.linkProgram(program)

        var sucess = gl.getProgramParameter(program, gl.LINK_STATUS)
        if (sucess) {
            return program
        }

        const error = gl.getProgramInfoLog(program)
        console.warn(error)
    }


    /**
     * @returns {Float32Array}
     */
    createCirclePoints(cx, cy, r, POINTS = 20) {
        var array = new Float32Array(20 * 6)

        for (let p = 0; p < POINTS; p++) {
            const angle = Math.PI * 2 * (p / POINTS)
            const angle2 = Math.PI * 2 * ((p + 1) / POINTS)
            array[0 + (p * 6)] = cx
            array[1 + (p * 6)] = cy
            array[2 + (p * 6)] = cx + Math.cos(angle) * r
            array[3 + (p * 6)] = cy + Math.sin(angle) * r
            array[4 + (p * 6)] = cx + Math.cos(angle2) * r
            array[5 + (p * 6)] = cy + Math.sin(angle2) * r
        }

        return array
    }

    drawCharges(charge, ...args) {
        const gl = this.context
        var array = Array.isArray(charge) ? [...charge, ...args] : [charge, ...args]

        var result_points = new Float32Array(20 * 6 * array.length)

        let lastpos = 0
        for (let charge of array) {
            const points = this.createCirclePoints(charge.position.x, charge.position.y, 5)
            result_points.set(points, lastpos)
            lastpos += points.length
        }

        gl.useProgram(this.chargeProgram)
        gl.bindVertexArray(this.chargeVAO)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, result_points, gl.STATIC_DRAW)
        // gl.bufferSubData()
        gl.drawArrays(gl.TRIANGLES, 0, result_points.length/2.0)


        // console.log(result_points)
    }


    drawPoints(points, ...args) {
        const gl = this.context
        var array = Array.isArray(points) ? [...points, ...args] : [points, ...args]

        var result_points = new Float32Array(20 * 6 * array.length)

        let lastpos = 0
        for (let point of array) {
            const points = this.createCirclePoints(point.x, point.y, 1)
            result_points.set(points, lastpos)
            lastpos += points.length
        }

        gl.useProgram(this.chargeProgram)
        gl.bindVertexArray(this.chargeVAO)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, result_points, gl.STATIC_DRAW)
        // gl.bufferSubData()
        gl.drawArrays(gl.TRIANGLES, 0, result_points.length/2.0)


        // console.log(result_points)
    }
    drawBackground(type=1) {
        const gl = this.context

        gl.useProgram(this.normalProgram)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D,this.normalTEXTURE)
        const [data_texture,points] = ChargeParticle.charges_to_texture()
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB32F,1,points,0,gl.RGB,gl.FLOAT,data_texture)
        gl.uniform1i(this.normalUniforms.point_n,points)
        gl.uniform1i(this.normalUniforms.type,type)

        gl.bindVertexArray(this.normalVAO)
        gl.bindBuffer(gl.ARRAY_BUFFER,this.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
            0,0,
            gl.canvas.width,0,
            gl.canvas.width,gl.canvas.height,
            0,0,
            0,gl.canvas.height,
            gl.canvas.width,gl.canvas.height,

        ]),gl.STATIC_DRAW)
        gl.drawArrays(gl.TRIANGLES,0,6)
    }

    getArrowPoints(x, y, length, angle, arc = 1) {
        const p1 = new Point(x,y)
        const p2 = new Point(x + Math.cos(angle + arc / 2) * length,y + Math.sin(angle + arc / 2) * length,y)
        const p3 = new Point(x + Math.cos(angle - arc / 2) * length,y + Math.sin(angle - arc / 2) * length,y)
        return [
            ...this.getLinePoints(p1.x,p1.y,p2.x,p2.y,1.0),
            ...this.getLinePoints(p1.x,p1.y,p3.x,p3.y,1.0),
        ]
    }

    getLinePoints(x1,y1,x2,y2,length){
        const p1 = new Point(x1,y1)
        const p2 = new Point(x2,y2)
        const direction = p1.direction(p2)
        const perpendicular = new Point(direction.y,-direction.x)
        return [
            p1.x + (perpendicular.x*length)/2.0,
            p1.y + (perpendicular.y*length)/2.0,
            p1.x - (perpendicular.x*length)/2.0,
            p1.y - (perpendicular.y*length)/2.0,
            p2.x + (perpendicular.x*length)/2.0,
            p2.y + (perpendicular.y*length)/2.0,
            
            p2.x + (perpendicular.x*length)/2.0,
            p2.y + (perpendicular.y*length)/2.0,
            p2.x - (perpendicular.x*length)/2.0,
            p2.y - (perpendicular.y*length)/2.0,
            p1.x - (perpendicular.x*length)/2.0,
            p1.y - (perpendicular.y*length)/2.0,
        ]

    }

    drawArrow(buffer, length = 10, arc = 1,lengthbuffer=[]) {
        const gl = this.context
        const result_points = new Float32Array(24 * buffer.length )
        let lastpos = 0
        let i = 0
        for (let [x, y, angle] of buffer) {
            let thislength = length
            if(lengthbuffer.length != 0){
                thislength = lengthbuffer[i]
                i++
            }
            const points = this.getArrowPoints(x, y, thislength, angle, arc)
            // console.log(points)
            result_points.set(points, lastpos)
            lastpos += 24
        }
        i++
        // console.log(result_points)
        gl.useProgram(this.chargeProgram)
        gl.bindVertexArray(this.chargeVAO)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, result_points, gl.STATIC_DRAW)
        gl.drawArrays(gl.TRIANGLES, 0, result_points.length/2.0)
    }

    drawLine(buffer,length){
        const gl = this.context
        const result_points = new Float32Array(12 * buffer.length)
        let lastpos = 0
        for (let [p1, p2, angle] of buffer) {
            result_points.set(this.getLinePoints(p1.x,p1.y,p2.x,p2.y,length), lastpos)
            lastpos += 12
        }
        gl.useProgram(this.chargeProgram)
        gl.bindVertexArray(this.chargeVAO)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, result_points, gl.STATIC_DRAW)
        gl.drawArrays(gl.TRIANGLES, 0, result_points.length/2.0)
    }


    drawFieldLines(charges, step = 8, lines = 20) {
        const gl = this.context
        let array = Array.isArray(charges) ? charges : [charges]

        let result_points = new Float32Array(WebglRender.NUMBER_OF_LINE_STEPS * lines * 12 * array.length)
        let arrowbuffer = []

        // console.log(result_points)
        let lastpos = 0
        for (let charge of array) {
            // console.log(charge)
            const [points, arrows] = this.calculatePathFromCharge(charge, step, lines)
            arrowbuffer.push(...arrows)
            // console.log(points)
            result_points.set(points, lastpos)
            lastpos += points.length
        }

        gl.useProgram(this.chargeProgram)
        gl.bindVertexArray(this.chargeVAO)
        // gl.uniform4fv(this.chargeUniforms.color,[0,0,0,0.5])
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, result_points.byteLength, gl.STATIC_DRAW)
        gl.bufferData(gl.ARRAY_BUFFER, result_points, gl.STATIC_DRAW)
        gl.drawArrays(gl.TRIANGLES, 0, result_points.length/2.0)

        this.drawArrow(arrowbuffer)

        // console.log(result_points)
    }

    drawFieldVectorArrow(gridsize = 1) {
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

        const gl = this.context

        var buffer = []
        var lb = []
        for(let x=0;x<gl.canvas.width;x+=gridsize){
            for(let y=0;y<gl.canvas.height;y+=gridsize){
                const field = ChargeParticle.get_field_from_array(new Point(x,y))
                
                buffer.push([x,y,Math.PI+Math.atan2(field.y,field.x)])
                lb.push(clamp(field.magnitude()/8e+4,0,10))
            }
        }

        this.drawArrow(buffer,0,1,lb)
    }


    calculatePathFromCharge(charge, step = 1, LINES = 8, ARROWSTEP = 15) {
        // if (charge.charge < 0) return [[], []]
        var points = []
        var arrow_buffer = []
        let nn=0,pn=0
        for(let c of ChargeParticle.Charges){
            if(c.charge>0){
                pn+=1
            }else{
                nn+=1
            }
        }        
        let negative_dominant = nn>pn
        // negative_dominant = false
        // console.log(negative_dominant)

        if(charge.charge<0 &&! negative_dominant){
            return [[],[]]
        }else if(charge.charge>0 && negative_dominant){
            return [[],[]]
        }

        for (let line = 0; line < LINES; line++) {
            const angle = line / LINES * 2 * Math.PI
            let lastpos = new Point(charge.position.x + Math.cos(angle), charge.position.y + Math.sin(angle))
            // console.log(charge.charge,charge.fieldLines)
            for (let i = 0; i < WebglRender.NUMBER_OF_LINE_STEPS; i++) {
                let field = ChargeParticle.get_field_from_array(lastpos)
                field = field.normalize()
                var factor = charge.charge < 0 ? -1 : 1
                var f = field
                field = field.multiply(step * factor)
                let nextpos = new Point(lastpos.x + field.x, lastpos.y + field.y)
                const closestCharge = ChargeParticle.get_closest(lastpos,charge)
                
                // console.log(closestCharge)

                // console.log(field.dot(field))

                // console.log(closestCharge.position.distance_to(lastpos))
                if (closestCharge && closestCharge.position.distance_to(lastpos) < step*1.0) {
                    closestCharge.fieldLines.push(lastpos)
                    break
                } else {
                    const result_points = this.getLinePoints(lastpos.x,lastpos.y,nextpos.x,nextpos.y,1)

                    points.push(...result_points)
                    // points.push(lastpos.y)
                    // points.push(nextpos.x)
                    // points.push(nextpos.y)

                    if (i % ARROWSTEP == 0) {
                        arrow_buffer.push([lastpos.x, lastpos.y, Math.atan2(field.y, field.x) + (charge.charge>0.0?Math.PI:Math.PI*2.0)])
                    }
                }

                // console.log(i%10)
                lastpos = nextpos
            }
        }

        return [points, arrow_buffer]
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////

export class ContextRender {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas
    /**
     * @type {CanvasRenderingContext2D}
     */
    context

    constructor(canvas) {
        this.canvas = canvas
        this.context = this.canvas.getContext("2d")
        this.context.imageSmoothingEnabled = false;
        // this.canvas.style.imageRendering = "pixelated"
    }


    /**
     * 
     * @param {Point} point 
     */
    drawPoint(point) {
        this.context.beginPath()
        this.context.arc(point.x, point.y, 1, 0, 2 * Math.PI)
        this.context.fill()
        this.context.stroke()
    }

    /**
     * 
     * @param {ChargeParticle} charge 
     */
    drawCharge(charge) {
        this.context.beginPath()
        this.context.arc(charge.position.x, charge.position.y, 4, 0, 2 * Math.PI)
        this.context.fill()
        this.context.stroke()
        this.context.fillText((charge.charge > 0 ? "+" : "") + charge.charge.toString(), charge.position.x + 10, charge.position.y + 4)
    }

    /// 
    drawArrow(fromX, fromY, toX, toY, headLength = 15, headAngle = Math.PI / 6, stroke = true) {
        // Calculate the angle of the main line
        const angle = Math.atan2(toY - fromY, toX - fromX);

        if (stroke) {

            this.context.beginPath();
        }

        // Draw the main arrow shaft
        this.context.moveTo(fromX, fromY);
        this.context.lineTo(toX, toY);

        // Draw first wing of the arrowhead
        this.context.lineTo(
            toX - headLength * Math.cos(angle - headAngle),
            toY - headLength * Math.sin(angle - headAngle)
        );

        // Move back to the tip and draw second wing
        this.context.moveTo(toX, toY);
        this.context.lineTo(
            toX - headLength * Math.cos(angle + headAngle),
            toY - headLength * Math.sin(angle + headAngle)
        );

        // Render the lines onto the canvas
        if (stroke) {
            this.context.stroke();
        }
    }


    drawField(step = 1) {
        for (let x = 0; x < this.canvas.width; x += step) {
            for (let y = 0; y < this.canvas.width; y += step) {
                // this.drawPoint(new Point(x,y))
                var vec = ChargeParticle.get_field_from_array(new Point(x, y))
                console.log(ChargeParticle.Charges)
                vec = vec.normalize()
                console.log(vec)
                const angle = Math.atan2(vec.x, vec.y)
                vec = vec.multiply(15)

                this.drawArrow(x, y, x + vec.x, y + vec.y, 8)
                // this.context.beginPath()
                // this.context.moveTo(x+vec.x,y+vec.y)
                // this.context.lineTo(x+Math.cos(angle)*10,y+Math.sin(angle)*10)
                // this.context.moveTo(x+vec.x,y+vec.y)
                // this.context.lineTo(x+Math.cos(angle)*10,y)
                // this.context.stroke()


                // this.context.rotate(angle)

            }
        }
    }

    /**
     * 
     * @param {ChargeParticle} charge 
     */
    drawPathFromCharge(charge, LINES = 8) {
        for (let line = 0; line < LINES; line++) {
            this.context.beginPath()
            this.context.moveTo(charge.position.x, charge.position.y)
            const angle = line / LINES * 2 * Math.PI
            let lastpos = new Point(charge.position.x + Math.cos(angle), charge.position.y + Math.sin(angle))

            for (let i = 0; i < 2000; i++) {
                let field = ChargeParticle.get_field_from_array(lastpos)
                field = field.normalize()
                let nextpos = new Point(lastpos.x + field.x, lastpos.y + field.y)
                // console.log(i%10)
                if ((i % 100) == 0) {
                    this.drawArrow(lastpos.x, lastpos.y, nextpos.x, nextpos.y, 8, Math.PI / 6.0, false)
                    this.context.moveTo(nextpos.x, nextpos.y)
                }
                this.context.lineTo(nextpos.x, nextpos.y)
                lastpos = nextpos
            }
            this.context.stroke()
        }

    }



}  