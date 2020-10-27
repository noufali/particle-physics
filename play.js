var overlay = document.getElementById("overlay");
var system;
var img;
var two;
var children;
var desired = new Two.Vector(0, 0);
var steer = new Two.Vector(0, 0);
var distance = new Two.Vector(0, 0);

var blob = document.getElementById("ai");
var steerFactor = 1;
var runFactor = 0.4;
var xPos = -200;
var yPos = -100;
var scaleFactor = 1.5;

window.addEventListener('load', init);

function init() {
  two = new Two({
    width: window.innerWidth,
    height: window.innerHeight
  }).appendTo(overlay);

  two.renderer.domElement.style.background = '#EEDFD2';
  let shape = two.interpret(blob);
  children = shape._collection[0]._collection;

  // go over each children and add PROPERTIES
  for (let i=0; i<children.length;i++){
    let element = children[i];

    // PROPERTIES
    element.mass = 1;
    element.acceleration = new Two.Vector(0, 0);
    element.velocity = new Two.Vector(0,0);

    // DETERMINE IF PATH OR GROUP FOR CENTROIDS
    if (element._renderer['type'] == 'path'){
      // PATH
      children[i]._opacity = 1;
      let v = children[i].vertices;
      let center = findCentroid(v,xPos,yPos,scaleFactor);
      children[i].translation.set(xPos,yPos);
      children[i].scale = children[i].scale * scaleFactor;
      element.center = center;
      element.origin = new Two.Vector(0,0);
      element.origin.addSelf(center);
      // two.makeCircle(center.x,center.y,1);
      //two.makeCircle(205.333,349.3,1);
    } else {
      // GROUP
      let path = element._collection[0];
      path._opacity = 1;
      let vertices = path.vertices;
      let center = findCentroid(vertices,xPos,yPos,scaleFactor);
      children[i].translation.set(xPos,yPos);
      children[i].scale = children[i].scale * scaleFactor;
      element.center = center;
      element.origin = new Two.Vector(0,0);
      element.origin.addSelf(center);
      // two.makeCircle(center.x,center.y,1);
    }

    // FORCE FUNCTIONS
    element.applyForce = function(force){
     //let f = force.divideScalar(element.mass);
     element.acceleration.addSelf(force);
    }
    element.update = function() {
      element.velocity.addSelf(element.acceleration);
      //element.velocity.setLength(maxspeed);
      element.translation.addSelf(element.velocity);
      element.center.addSelf(element.velocity);
      element.acceleration.multiplyScalar(0);
    }
    element.seek = function() {
      let desired = new Two.Vector(0,0);
      // desired.sub(element.center,element.translation);
      desired.sub(element.origin, element.center);

      steer.sub(desired,element.velocity);
      let d = steer.length();
      steer.normalize();

      if (d < 100) {
        let m = map(d,0,100,0,steerFactor);
        steer.multiplyScalar(m);
      } else {
        steer.multiplyScalar(steerFactor);
      }

      element.applyForce(steer);
    }
    element.runAway = function() {
      let mouse = new Two.Vector(mouseX,mouseY);
      distance.sub(element.center,mouse);
      let d = distance.length();
      //console.log(d);
      if(d < 80){
        distance.normalize();
        distance.multiplyScalar(runFactor);
        element.applyForce(distance);
      }
      // calc the distance to the mouse
      // if it's lower than the threshold
      // calculate direction opposite
      // apply force in that direction
      // else, nothing
    }
  }

  // initial force
  // for (let i=0; i<children.length;i++){
  //   let element = children[i];
  //   element.applyForce(new Two.Vector(Math.random() * 1, Math.random() * -11));
  // }

  two.bind('update', function(frameCount) {
    //two.clear();
    for (let i=0; i<children.length;i++){
      let element = children[i];
      element.seek();
      element.runAway();
      element.update();
    }
  }).play();  // Finally, start the animation loop

}

function findCentroid(points, xValue, yValue, s){
  let x = 0;
  let y = 0;

  for (let i=0;i<points.length-1;i++){
  	x += (points[i]._x * s) + xValue;
  	y += (points[i]._y * s) + yValue;
  }

  x = x / (points.length-1);
  y = y / (points.length-1);

  let c = new Two.Vector(x,y);
  return c
};

function draw(){};
