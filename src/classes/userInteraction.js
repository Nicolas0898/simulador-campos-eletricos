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
    }

    // EVENT FUNCTIONS
    onMouseMove(e){
        this.mousePos = this.convertClientPosToCanvasPos(new Point(e.offsetX,e.offsetY))
    }

    onMouseDown(e){
        console.log("pressed with:", this.activeMode)
        switch(this.activeMode){
            case "selection":
                this.selectionDown()
                break
            default:
                this.setModeActive("selection")
        }
    }

    onMouseUp(e){
        
    }

    selectionDown(e){
        var selected = null
        for(let charge of ChargeParticle.Charges){
            var distance = charge.position.distance_to(this.mousePos)
            if (distance<10.0){
                selected = charge
            }
        }
        console.log(selected)
        this.selectObject(selected)
    }
}