import ChargeParticle from "./classes/chargeParticle"
import { Point } from "./classes/generics"
import charge from './shaders/vertex/charge.glsl?raw'
import solid from './shaders/fragment/solid.glsl?raw'


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
            gl.uniform4fv(colorPos, [0, 0, 0, 1])
        }


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
        gl.drawArrays(gl.TRIANGLES, 0, result_points.length)


        // console.log(result_points)
    }

    drawHeatmapBackground() {

    }

    getArrowPoints(x, y, length, angle, arc = 1) {
        return [
            x,
            y,
            x + Math.cos(angle + arc / 2) * length,
            y + Math.sin(angle + arc / 2) * length,
            x,
            y,
            x + Math.cos(angle - arc / 2) * length,
            y + Math.sin(angle - arc / 2) * length,
        ]
    }

    drawArrow(buffer, length = 10, arc = 1) {
        const gl = this.context
        const result_points = new Float32Array(8 * buffer.length)
        let lastpos = 0
        for (let [x, y, angle] of buffer) {
            result_points.set(this.getArrowPoints(x, y, length, angle, arc), lastpos)
            lastpos += 8
        }
        gl.useProgram(this.chargeProgram)
        gl.bindVertexArray(this.chargeVAO)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, result_points, gl.STATIC_DRAW)
        gl.drawArrays(gl.LINES, 0, result_points.length)
    }


    drawFieldLines(charges, step = 8, lines = 20) {
        const gl = this.context
        let array = Array.isArray(charges) ? charges : [charges]

        let result_points = new Float32Array(WebglRender.NUMBER_OF_LINE_STEPS * lines * 4 * array.length)
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
        gl.bufferData(gl.ARRAY_BUFFER, result_points, gl.STATIC_DRAW)
        gl.drawArrays(gl.LINES, 0, result_points.length)

        this.drawArrow(arrowbuffer)

        // console.log(result_points)
    }

    drawFieldVectorArrow(gridsize = 1) {
        const gl = this.context

        var buffer = []
        for(let x=0;x<gl.canvas.width;x+=gridsize){
            for(let y=0;y<gl.canvas.height;y+=gridsize){
                const field = ChargeParticle.get_field_from_array(new Point(x,y))
                buffer.push([x,y,Math.PI+Math.atan2(field.y,field.x)])
            }
        }

        this.drawArrow(buffer)
    }


    calculatePathFromCharge(charge, step = 1, LINES = 8, ARROWSTEP = 15) {
        if (charge.charge < 0) return [[], []]
        var points = []
        var arrow_buffer = []

        for (let line = 0; line < LINES; line++) {
            const angle = line / LINES * 2 * Math.PI
            let lastpos = new Point(charge.position.x + Math.cos(angle), charge.position.y + Math.sin(angle))

            for (let i = 0; i < WebglRender.NUMBER_OF_LINE_STEPS; i++) {
                let field = ChargeParticle.get_field_from_array(lastpos)
                field = field.normalize()
                var factor = charge.charge < 0 ? 1 : 1
                var f = field
                field = field.multiply(step * factor)
                let nextpos = new Point(lastpos.x + field.x, lastpos.y + field.y)
                const closestCharge = ChargeParticle.get_closest(lastpos,charge)
                // console.log(closestCharge)

                // console.log(field.dot(field))

                // console.log(closestCharge.position.distance_to(lastpos))
                if (closestCharge.position.distance_to(lastpos) < step) {
                    break
                } else {


                    points.push(lastpos.x)
                    points.push(lastpos.y)
                    points.push(nextpos.x)
                    points.push(nextpos.y)

                    if (i % ARROWSTEP == 0) {
                        arrow_buffer.push([lastpos.x, lastpos.y, Math.atan2(field.y, field.x) + Math.PI])
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