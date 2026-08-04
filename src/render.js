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
        this.canvas.style.imageRendering = "pixelated"
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
    drawArrow( fromX, fromY, toX, toY, headLength = 15, headAngle = Math.PI / 6) {
        // Calculate the angle of the main line
        const angle = Math.atan2(toY - fromY, toX - fromX);

        this.context.beginPath();
        
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
        this.context.stroke();
    }


    drawField(step=1){
        for(let x=0;x<this.canvas.width;x+=step){
            for(let y=0;y<this.canvas.width;y+=step){
                // this.drawPoint(new Point(x,y))
                const vec = ChargeParticle.get_field_from_array(new Point(x,y))
                console.log(ChargeParticle.Charges)
                this.drawArrow(x,y,x+vec.x,y+vec.y-1,9)
            }
        }
    }

}   