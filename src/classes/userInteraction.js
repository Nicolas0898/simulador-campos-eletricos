import ChargeParticle from "./chargeParticle"
import { Point } from "./generics"

export class UserInteraction{
    // HTML Elements
    /** @type {HTMLCanvasElement} */
    canvas
    propertyMenu
    propertyForm
    modeSelector
    status


    /** @type {WebGL2RenderingContext} */
    gl
    
    // STATE
    /** @type {Point} */
    mousePos = new Point(0,0)
    selectedObject
    activeMode = "selection"
    mouseDown = false

    constructor(canvas){
        this.canvas = canvas
        this.gl = this.canvas.getContext("webgl2")

        this.propertyMenu = document.getElementById("propertyMenu")
        this.propertyForm = document.getElementById("propertyForm")
        this.modeSelector = document.getElementById("modeSelector")
        this.status = document.getElementById("status")
        for(let child of this.modeSelector.children){
            child.addEventListener("click",this.setModeActive.bind(this,child.dataset.mode))
        }

        this.canvas.addEventListener("mousemove",this.onMouseMove.bind(this))
        this.canvas.addEventListener("mousedown",this.onMouseDown.bind(this))
        this.canvas.addEventListener("mouseup",this.onMouseUp.bind(this))
    }

    convertClientPosToCanvasPos(pos){
        const bounding_box = this.canvas.getBoundingClientRect()
        return new Point((pos.x/bounding_box.width)*this.gl.canvas.width,(pos.y/bounding_box.height)*this.gl.canvas.height)
    }

    setModeActive(name){
        /** @type {HTMLElement} */
        for(let child of this.modeSelector.children){
            if (child.dataset.mode==name){
                child.classList.add("tool-btn-active")
            }else{
                child.classList.remove("tool-btn-active")
            }
        }
        this.activeMode = name
        // console.log(this.activeMode)
    }

    selectObject(object){
        if(object){
            this.status.innerHTML =  object.name+" ("+object.id+")"
        }else{
            this.status.innerHTML = "(nenhum objeto selecionado)"
        }
        this.selectedObject = object
        this.exportChargeProperties()
        
    }

    exportChargeProperties(){
        this.propertyForm.innerHTML = ""
        const target = this.selectedObject
        if(!target) return

        // this.propertyForm.innerHTML = "<button>Excluir</button>"
        const deleteButton = document.createElement("button")
        deleteButton.className = ""
        deleteButton.innerText = "Excluir"

        const positionspan = document.createElement("p")
        positionspan.textContent = "Posição:"
        positionspan.className = "m-0"
        const wrapper = document.createElement("div")
        wrapper.className = "d-flex justify-content-between"
        const positionx = document.createElement("input")
        positionx.type = "number"
        positionx.placeholder = "x"
        positionx.value = target.position.x.toFixed(2)
        positionx.step = 0
        const positiony = document.createElement("input")
        positiony.type = "number"
        positiony.value = target.position.y.toFixed(2)
        positiony.placeholder = "y"
        positiony.step = 0
        
        
        const chargespan = document.createElement("p")
        chargespan.textContent = "Carga:"
        chargespan.className = "m-0"

        const charge = document.createElement("input")
        charge.type = "number"
        charge.placeholder = "carga"
        charge.value = target.charge
        charge.step = 0.01
        const chargeRange = document.createElement("input")
        chargeRange.type = "range"
        chargeRange.placeholder = "carga"
        chargeRange.value = target.charge
        chargeRange.min = -2
        chargeRange.max = 2
        chargeRange.step = 0.01

        charge.addEventListener("change",(e)=>{
            target.charge = parseFloat(charge.value)
            chargeRange.value = target.charge
        })
        chargeRange.addEventListener("input",()=>{
             target.charge = parseFloat(chargeRange.value)
             charge.value = target.charge
        })
        
        
        deleteButton.addEventListener("click",()=>{
            target.remove();
            this.selectObject(null)
        })
        
        this.propertyForm.appendChild(positionspan)
        this.propertyForm.appendChild(wrapper)
        wrapper.appendChild(positionx)
        wrapper.appendChild(positiony)
        this.propertyForm.appendChild(chargespan)
        this.propertyForm.appendChild(charge)
        this.propertyForm.appendChild(chargeRange)
        this.propertyForm.appendChild(deleteButton)


    }

    // EVENT FUNCTIONS
    onMouseMove(e){
        this.mousePos = this.convertClientPosToCanvasPos(new Point(e.offsetX,e.offsetY))
        if (this.mouseDown && this.selectedObject!=null){
            this.selectedObject.position = this.mousePos
            this.exportChargeProperties()
        }
    }

    onMouseDown(e){
        this.mouseDown = true
        console.log("pressed with:", this.activeMode)
        switch(this.activeMode){
            case "selection":
                this.selectionDown()
                break
            case "create_charge":
                const c = new ChargeParticle(this.mousePos,-0.2)
                this.selectObject(c)
                this.setModeActive("selection")
            default:
                this.setModeActive("selection")
        }
    }

    onMouseUp(e){
        this.mouseDown = false
    }

    selectionDown(e){
        var selected = null
        for(let charge of ChargeParticle.Charges){
            var distance = charge.position.distance_to(this.mousePos)
            if (distance<20.0){
                selected = charge
            }
        }
        console.log(selected)
        this.selectObject(selected)
    }
}