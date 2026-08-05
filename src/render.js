import ChargeParticle from "./classes/chargeParticle"
import { Point } from "./classes/generics"

export class ContextRender{
    /**
     * @type {HTMLCanvasElement}
     */
    canvas
    /**
     * @type {CanvasRenderingContext2D}
     */
    context

    constructor(canvas){
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
        this.context.arc(point.x,point.y,1,0,2*Math.PI)
        this.context.fill()
        this.context.stroke()
    }

    /**
     * 
     * @param {ChargeParticle} charge 
     */
    drawCharge(charge){
        this.context.beginPath()
        this.context.arc(charge.position.x,charge.position.y,4,0,2*Math.PI)
        this.context.fill()
        this.context.stroke()
        this.context.fillText((charge.charge>0?"+":"") + charge.charge.toString(),charge.position.x + 10,charge.position.y + 4)
    }

    /// 
    drawArrow( fromX, fromY, toX, toY, headLength = 15, headAngle = Math.PI / 6,stroke=true) {
        // Calculate the angle of the main line
        const angle = Math.atan2(toY - fromY, toX - fromX);

        if(stroke){
           
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
        if(stroke){
            this.context.stroke();
        }
    }


    drawField(step=1){
        for(let x=0;x<this.canvas.width;x+=step){
            for(let y=0;y<this.canvas.width;y+=step){
                // this.drawPoint(new Point(x,y))
                var vec = ChargeParticle.get_field_from_array(new Point(x,y))
                console.log(ChargeParticle.Charges)
                vec = vec.normalize()
                console.log(vec)
                const angle = Math.atan2(vec.x,vec.y)
                vec = vec.multiply(15)

                this.drawArrow(x,y,x+vec.x,y+vec.y,8)
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
    drawPathFromCharge(charge,LINES=8){
        for(let line = 0;line<LINES;line++){
            this.context.beginPath()
            this.context.moveTo(charge.position.x,charge.position.y)
            const angle = line/LINES * 2 * Math.PI
            let lastpos = new Point(charge.position.x + Math.cos(angle),charge.position.y + Math.sin(angle))
            
            for(let i = 0;i<2000;i++){
                let field = ChargeParticle.get_field_from_array(lastpos)
                field = field.normalize()
                let nextpos = new Point(lastpos.x+field.x,lastpos.y+field.y)
                // console.log(i%10)
                if((i%100)==0){
                    this.drawArrow(lastpos.x,lastpos.y,nextpos.x,nextpos.y,8,Math.PI/6.0,false)
                    this.context.moveTo(nextpos.x,nextpos.y)
                }
                this.context.lineTo(nextpos.x,nextpos.y)
                lastpos = nextpos
            }
            this.context.stroke()
        }

    }

    calculatePathFromCharge(charge,LINES=8,step=1){
        var points = []

        for(let line = 0;line<LINES;line++){
            const angle = line/LINES * 2 * Math.PI
            let lastpos = new Point(charge.position.x + Math.cos(angle),charge.position.y + Math.sin(angle))
            
            for(let i = 0;i<800;i++){
                let field = ChargeParticle.get_field_from_array(lastpos)
                field = field.normalize()
                field = field.multiply(step)
                let nextpos = new Point(lastpos.x+field.x,lastpos.y+field.y)
                points.push(lastpos.x)
                points.push(800- lastpos.y)
                points.push(nextpos.x)
                points.push(800- nextpos.y)
                // console.log(i%10)
                lastpos = nextpos
            }
        }

        return points
    }


}  

export class WebglRender{
        /**
     * @type {HTMLCanvasElement}
     */
    canvas
    /**
     */
    context

    constructor(canvas){
        this.canvas = canvas
        this.context = this.canvas.getContext("webgl2")
        this.context.imageSmoothingEnabled = false;
        // this.canvas.style.imageRendering = "pixelated"
    }
}