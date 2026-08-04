import './style.css'

class Point{
  /** @type {number} */
  x
  /** @type {number} */
  y

  /**
   * 
   * @param {Point} to 
   */
  distance_to(to){
    return Math.sqrt(Math.pow(Math.abs(Math.abs(this.x)-Math.abs(to.x)),2) + Math.pow(Math.abs(Math.abs(this.y)-Math.abs(to.y)),2))
  }

  /**
   * 
   * @param {number} x 
   * @param {number} y 
   */
  constructor(x,y){
    this.x = parseFloat(x)
    this.y = parseFloat(y)
  }

  divide(n){
    return new Point(this.x/n,this.y/n)
  }
}

class ChargeParticle{
  /** @type {Point} */
  position
  /** @type {number} */
  charge
  K = 9*Math.pow(10,9)


  /**
   * 
   * @param {Point} target_position 
   * @returns 
   */
  eletric_field_at(target_position){
    return this.K*(Math.abs(this.charge)/Math.pow(target_position.distance_to(this.position),2))
  }

  // /**
  //  * 
  //  * @param {Point} position 
  //  * @param {Array[ChargeParticle]} charges 
  //  */
  // static eletric_field_at(position,charges) {
    
  // }

  constructor(position,charge){
    this.position = position
    this.charge = charge
  }
}

function drawArrow(ctx, fromX, fromY, toX, toY, headLength = 15, headAngle = Math.PI / 6) {
  // Calculate the angle of the main line
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  
  // Draw the main arrow shaft
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);

  // Draw first wing of the arrowhead
  ctx.lineTo(
    toX - headLength * Math.cos(angle - headAngle),
    toY - headLength * Math.sin(angle - headAngle)
  );

  // Move back to the tip and draw second wing
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + headAngle),
    toY - headLength * Math.sin(angle + headAngle)
  );

  // Render the lines onto the canvas
  ctx.stroke();
}


/////////////////////////////////////////////
//              PROGRAM
/////////////////////////////////////////////

/**
 * @type {HTMLCanvasElement}
 */
var canvas = document.getElementById("maincanvas")
/**
 * @type {CanvasRenderingContext2D}
 */
const context = canvas.getContext("2d")

// context.strokeText("UUUUU esse texto está sendo desenhado dentro de um canvas via o CPU uuuuuuuuuuuu",0,10)
// context.fillRect(0,0,20,20)
const size = new Point(canvas.width,canvas.height)
const center = size.divide(2)

var charge = new ChargeParticle(new Point(center.x,center.y),10)


// context.beginPath()
// context.moveTo(center.x,center.y)
// context.lineTo(target_point.x,target_point.y)
// context.lineTo(target_point.x + 5 * Math.cos(target_point.x),target_point.y)
// context.stroke()

update_arr()

function update_arr(){
  context.reset()

  const xi = document.getElementById("x")
  const yi = document.getElementById("y")
  
  context.beginPath()
  context.arc(center.x,center.y,5,0,2*Math.PI)
  context.fill()
  context.stroke()
  
  var target_point = new Point(xi.value ?? 10,yi.value??10)
  var field_value = charge.eletric_field_at(target_point)//.toExponential(2)
  const txt = field_value.toExponential(2) + " N"
  console.log(target_point)
  context.fillText(txt,(center.x+target_point.x)/2,(center.y+target_point.y)/2 )
  
  console.log(txt)
  drawArrow(context,center.x,center.y,target_point.x,target_point.y)
}

document.getElementById("x").addEventListener("change",update_arr)
document.getElementById("y").addEventListener("change",update_arr)

// context.
// console200.log(field_value)