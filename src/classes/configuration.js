import { WebglRender } from "../render"
import ChargeParticle from "./chargeParticle"
import testCharge from "./testCharge"

export default class SimulatorConfiguration {
    static scale = 1
    static scale_diff = 1
    static normalize_vectors = true
    static enable_grid = false
    static grid_size = 10

    static currentRenderer
    static currentUserInteraction

    static simulation_quality = 8
    static simulation_iterations = 400

    static input_scale
    static input_normalize_vectors
    static input_simulation_quality
    static input_simulation_iterations
    static input_enable_grid
    static input_grid_size

    static update() {
        WebglRender.NUMBER_OF_LINE_STEPS = this.simulation_iterations
        WebglRender.STEP_AMT = this.simulation_quality
        if (this.currentRenderer) {
            this.currentRenderer.setScale(this.scale)
        }
        if (this.currentUserInteraction) {
            this.currentUserInteraction.propertyHandler.updateUI()
        }
        for (let charge of ChargeParticle.Charges) {
            charge.position = charge.position.multiply(this.scale_diff)
        }
        for (let testc of testCharge.testCharges) {
            testc.position = testc.position.multiply(this.scale_diff)
        }
    }

    static updateDom() {
        this.input_scale.value = this.scale
        this.input_normalize_vectors.checked = this.normalize_vectors
        this.input_simulation_quality.value = this.simulation_quality
        this.input_simulation_iterations.value = this.simulation_iterations
        this.input_enable_grid.checked = this.enable_grid
        this.input_grid_size.value = this.grid_size
    }

    static loadFromDom() {
        const sclinp = Math.max(parseFloat(this.input_scale.value), 0.0001)
        this.input_scale.value = sclinp

        this.scale_diff = this.scale / sclinp
        this.scale = sclinp
        this.normalize_vectors = this.input_normalize_vectors.checked
        this.simulation_quality = parseFloat(this.input_simulation_quality.value)
        this.simulation_iterations = parseFloat(this.input_simulation_iterations.value)
        this.enable_grid = this.input_enable_grid.checked
        this.grid_size = parseFloat(this.input_grid_size.value)
        this.update()
    }

    static setup() {
        this.input_scale = document.getElementById("scale")
        this.input_normalize_vectors = document.getElementById("normalize_vectors")
        this.input_simulation_quality = document.getElementById("simulation_quality")
        this.input_simulation_iterations = document.getElementById("simulation_iterations")
        this.input_enable_grid = document.getElementById("enable_grid")
        this.input_grid_size = document.getElementById("grid_size")

        this.input_scale.addEventListener("change", this.loadFromDom.bind(this))
        this.input_normalize_vectors.addEventListener("change", this.loadFromDom.bind(this))
        this.input_simulation_quality.addEventListener("change", this.loadFromDom.bind(this))
        this.input_simulation_iterations.addEventListener("change", this.loadFromDom.bind(this))
        console.log(this.input_enable_grid)
        this.input_enable_grid.addEventListener("change", this.loadFromDom.bind(this))
        this.input_grid_size.addEventListener("change", this.loadFromDom.bind(this))

        this.updateDom()
    }

    static printInfo() {
        //console.log(this.input_scale)
        //console.log(this.input_normalize_vectors)
        //console.log(this.input_simulation_quality)
        //console.log(this.input_simulation_iterations)
        //console.log(this.scale)
        //console.log(this.normalize_vectors)
        //console.log(this.simulation_quality)
        //console.log(this.simulation_iterations)
    }
}