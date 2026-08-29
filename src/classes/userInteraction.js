import ChargeParticle from "./chargeParticle"
import SimulatorConfiguration from "./configuration"
import { Point } from "./generics"
import testCharge from "./testCharge"

export class UserInteraction {

    /** @type {WebGL2RenderingContext} */
    gl


    modeSelector

    // STATE
    /** @type {Point} */
    mousePos = new Point(0, 0)
    selectedObject
    activeMode = "selection"
    mouseDown = false
    propertyHandler = new PropertyHandler()
    gridSize = 0

    constructor(canvas) {
        this.canvas = canvas
        this.gl = this.canvas.getContext("webgl2")

        this.modeSelector = document.getElementById("modeSelector")
        for (let child of this.modeSelector.children) {
            child.addEventListener("click", this.setModeActive.bind(this, child.dataset.mode))
        }


        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this))
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this))
        this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this))
        
        this.canvas.addEventListener("touchmove", this.onMouseMove.bind(this))
        this.canvas.addEventListener("touchstart", this.onMouseDown.bind(this))
        this.canvas.addEventListener("touchend", this.onMouseUp.bind(this))
    }

    /** @param {Point} pos  */
    getQuantPos(pos){
        const scale = SimulatorConfiguration.scale
        const size = SimulatorConfiguration.grid_size/scale
        if(size==0|!SimulatorConfiguration.enable_grid){
            return pos
        }else{
            
            pos = pos.divide(size).round().multiply(size)
            return pos
        }
    }

    convertClientPosToCanvasPos(pos) {
        const bounding_box = this.canvas.getBoundingClientRect()
        return new Point((pos.x / bounding_box.width) * this.gl.canvas.width, (pos.y / bounding_box.height) * this.gl.canvas.height)
    }

    setModeActive(name) {
        /** @type {HTMLElement} */
        for (let child of this.modeSelector.children) {
            if (child.dataset.mode == name) {
                child.classList.add("tool-btn-active")
            } else {
                child.classList.remove("tool-btn-active")
            }
        }
        this.activeMode = name
        // //console.log(this.activeMode)
    }

    selectObject(object) {
        this.propertyHandler.setCurrentTarget(object)
    }

    // EVENT FUNCTIONS
    onMouseMove(e,forceUpdate=false) {
        if(this.activeMode!="selection" && !forceUpdate) return
        e.preventDefault()
        let pos = new Point(0,0)
        if(e instanceof TouchEvent){
            const touch = e.touches[0]
            console.log(touch)
            pos = new Point(touch.pageX-touch.target.offsetLeft, touch.pageY-touch.target.offsetTop)
        }else{
            pos = new Point(e.offsetX, e.offsetY)
        }
        this.mousePos = this.convertClientPosToCanvasPos(pos)
        console.log(this.mouseDown)
        if(forceUpdate) return
        if (this.mouseDown && this.propertyHandler.target != null) {
            this.propertyHandler.target.position = this.getQuantPos(this.mousePos)
            this.propertyHandler.updateUI()
        }
    }

    onMouseDown(e) {
        e.preventDefault()
        this.mouseDown = true

        if(e instanceof TouchEvent){
            this.selectObject(null)
        }

        //console.log("pressed with:", this.activeMode)
        switch (this.activeMode) {
            case "selection":
                this.onMouseMove(e,true)
                this.selectionDown()
                break
            case "create_charge":
                this.onMouseMove(e,true)
                const c = new ChargeParticle(this.getQuantPos(this.mousePos), -0.002)
                this.selectObject(c)
                this.setModeActive("selection")
                break
            case "create_test_charge":
                this.onMouseMove(e,true)
                const tc = new testCharge(this.getQuantPos(this.mousePos), -0.002)
                this.selectObject(tc)
                this.setModeActive("selection")
                break
            default:
                this.setModeActive("selection")
        }
    }

    onMouseUp(e) {
        this.mouseDown = false
        e.preventDefault()
    }

    selectionDown(e) {
        const isMobile = navigator.userAgentData.mobile;
        const selection_distance = (isMobile)?50:20
        // console.log(isMobile,selection_distance)
        // console.log("selectiondown")
        var selected = null
        for (let charge of [...ChargeParticle.Charges, ...testCharge.testCharges]) {
            var distance = charge.position.distance_to(this.mousePos)
            if (distance < selection_distance) {
                selected = charge
            }
        }
        //console.log(selected)
        this.selectObject(selected)
    }
}


class PropertyHandler {
    // HTML Elements
    /** @type {HTMLCanvasElement} */
    canvas
    propertyMenu
    propertyForm
    status

    // Generated UI
    position_x_input
    position_y_input
    charge_input
    charge_range_input
    local_scale_input
    local_scale_range_input
    eletricalfieldintensity
    eletricalfieldforce


    // State
    target

    constructor() {
        this.propertyMenu = document.getElementById("propertyMenu")
        this.propertyForm = document.getElementById("propertyForm")
        this.status = document.getElementById("status")
    }

    changeStatusText(newText) {
        this.status.innerText = newText
    }

    setCurrentTarget(object) {
        if (object) {
            this.status.innerHTML = object.name + " (" + object.id + ")"
        } else {
            this.status.innerHTML = "(nenhum objeto selecionado)"
        }

        if (object != this.target) {
            this.propertyForm.innerHTML = ""
        }
        //console.log(this.target)

        if (object == this.target) {
            this.updateUI()
        } else if (object) {
            this.target = object
            //console.log("aa")
            this.generateUI()
            this.updateUI()
        }
        this.target = object

    }

    generateUI() {
        const scale = SimulatorConfiguration.scale

        const deleteButton = document.createElement("button")
        deleteButton.className = ""
        deleteButton.innerText = "Excluir"
        const positionspan = document.createElement("p")
        positionspan.textContent = "Posição (Metros):"
        positionspan.className = "m-0"
        const wrapper = document.createElement("div")
        wrapper.className = "d-flex justify-content-between flex-wrap gap-1"
        this.position_x_input = document.createElement("input")
        this.position_x_input.type = "number"
        this.position_x_input.placeholder = "x"
        this.position_x_input.step = 0
        this.position_x_input.className = "flex-grow-1"
        this.position_y_input = document.createElement("input")
        this.position_y_input.type = "number"
        this.position_y_input.placeholder = "y"
        this.position_y_input.step = 0
        this.position_y_input.className = "flex-grow-1"
        const chargespan = document.createElement("p")
        chargespan.textContent = "Carga (Coulomb):"
        chargespan.className = "m-0"
        this.charge_input = document.createElement("input")
        this.charge_input.type = "number"
        this.charge_input.placeholder = "carga"
        this.charge_input.step = 0.01
        this.charge_range_input = document.createElement("input")
        this.charge_range_input.type = "range"
        this.charge_range_input.placeholder = "carga"
        this.charge_range_input.min = -0.2
        this.charge_range_input.max = 0.2
        this.charge_range_input.step = 0.00001
        const resultspan = document.createElement("p")
        resultspan.className = "mb-0 fw-bold"
        resultspan.innerText = "Resultados:"
        this.eletricalfieldforce = document.createElement("p")


        this.charge_input.addEventListener("change", () => {
            this.target.charge = parseFloat(this.charge_input.value)
            this.updateUI()
        })
        this.charge_range_input.addEventListener("input", () => {
            this.target.charge = parseFloat(this.charge_range_input.value)
            this.updateUI()
        })

        deleteButton.addEventListener("click", () => {
            this.target.remove();
            this.setCurrentTarget(null)
        })

        const t = this
        this.position_x_input.addEventListener("change", (e) => {
            this.target.position.x = parseFloat(this.position_x_input.value) / scale
            this.updateUI()
        })
        this.position_y_input.addEventListener("change", (e) => {
            this.target.position.y = parseFloat(this.position_y_input.value) / scale
            this.updateUI()
        })


        this.propertyForm.appendChild(positionspan)
        this.propertyForm.appendChild(wrapper)
        wrapper.appendChild(this.position_x_input)
        wrapper.appendChild(this.position_y_input)
        this.propertyForm.appendChild(chargespan)
        this.propertyForm.appendChild(this.charge_input)
        this.propertyForm.appendChild(this.charge_range_input)

        this.propertyForm.appendChild(resultspan)
        this.propertyForm.appendChild(document.createElement("hr"))
        if (this.target instanceof testCharge) {
            this.generateTestChargeUI()
        }
        this.propertyForm.appendChild(this.eletricalfieldforce)


        this.propertyForm.appendChild(deleteButton)
        //console.log(deleteButton)
        //console.log(this.propertyForm)
        //console.log("generatedUI")
    }


    generateTestChargeUI() {
        this.eletricalfieldintensity = document.createElement("p")
        this.eletricalfieldintensity.className = "mb-0"

        const scalespan = document.createElement("span")
        scalespan.innerText = "Escala da exibição:"
        if (!SimulatorConfiguration.normalize_vectors) {
            this.local_scale_range_input = document.createElement("input")
            this.local_scale_range_input.type = "range"
            this.local_scale_range_input.min = 0.0001
            this.local_scale_range_input.max = 1.2
            this.local_scale_range_input.step = 0.000001
            this.local_scale_input = document.createElement("input")
            this.local_scale_input.type = "number"


            this.local_scale_range_input.addEventListener("input", e => {
                this.target.scale = parseFloat(this.local_scale_range_input.value)
                this.updateUI()
            })

            this.local_scale_input.addEventListener("change", e => {
                this.target.scale = parseFloat(this.local_scale_input.value)
                this.updateUI()
            })

        }

        if (!SimulatorConfiguration.normalize_vectors) {
            this.propertyForm.appendChild(scalespan)
            this.propertyForm.appendChild(this.local_scale_input)
            this.propertyForm.appendChild(this.local_scale_range_input)
        }
        this.propertyForm.appendChild(this.eletricalfieldintensity)
    }

    updateUI() {
        const scale = SimulatorConfiguration.scale
        if (!this.target) return

        this.position_x_input.value = (this.target.position.x * scale).toFixed(2)
        this.position_y_input.value = (this.target.position.y * scale).toFixed(2)

        if (Math.abs(this.target.charge) < 0.1) {
            this.charge_input.value = this.target.charge.toExponential(2)
        } else {
            this.charge_input.value = this.target.charge
        }

        this.charge_range_input.value = this.target.charge
        if (this.target instanceof testCharge) {
            var efiv = ChargeParticle.get_field_from_array(this.target.position).magnitude()
            var formatedefiv = (efiv>0.1 && efiv<1000.0) ? efiv.toFixed(4) : efiv.toExponential(2)

            var eff = this.target.getForce().magnitude()
            var formatedeff = (eff>0.1 && eff<1000.0) ? eff.toFixed(4) : eff.toExponential(2)
            this.eletricalfieldforce.innerHTML = `Força Elétrica: <span class="answer">${formatedeff} N</span>`
            this.eletricalfieldintensity.innerHTML = `Intensidade do campo elétrico: <span class="answer">${formatedefiv} N</span>`

            if (!SimulatorConfiguration.normalize_vectors) {
                this.local_scale_input.value = this.target.scale
                this.local_scale_range_input.value = this.target.scale
            }
        }else{
            var eff = this.target.getForce().magnitude()
            var formatedeff = (eff>0.1 && eff<1000.0) ? eff.toFixed(4) : eff.toExponential(2)

            this.eletricalfieldforce.innerHTML = `Força Elétrica: <span class="answer">${formatedeff} N</span>`

        }
    }

}