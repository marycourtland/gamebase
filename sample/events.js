var t0 = new Date().getTime();
function time() { return new Date().getTime() - t0; }

game.canvas.addEventListener("mousemove", function(event) {
  pos = calcMouseCanvasPos(event);
  mouse.velocity = add(pos, neg(mouse.pos));
  mouse.pos = pos;
  mouse.new_pos = true;
  mouse.motion = "moving";
  
  if (mouse.state == MOUSE_DOWN) { mouse.state = MOUSE_DRAG; }
      
  if (mouse.state == MOUSE_DRAG) {
    if (game.canvas.clicked_object) game.canvas.clicked_object.ondrag(mouse.velocity);
  }
  
});
game.canvas.addEventListener("mousedown", function(event) {
  mouse.state = MOUSE_DOWN;
  iter(game.objects, function(obj) { 
    if (obj.contains && obj.contains(mouse.pos)) game.canvas.clicked_object = obj;
  });
  if (game.canvas.clicked_object) game.canvas.clicked_object.onmousedown();
});
game.canvas.addEventListener("mouseup", function(event) {
  //console.log("\t" + time() + "\tmouseup\t" + mouse.motion + "\t" + mouse.velocity);
  // CanvasObject onclick event
  if (mouse.state == MOUSE_DOWN && game.canvas.clicked_object) game.canvas.clicked_object.onclick(mouse.pos);
  
  // CanvasObject onmouseup event
  if (game.canvas.clicked_object) game.canvas.clicked_object.onmouseup();
  
  mouse.state = MOUSE_UP;
  game.canvas.clicked_object = null;
});
game.canvas.addEventListener("click", function(event) {
  console.log("Clicked at " + mouse.pos);
})
function calcMouseCanvasPos(event) {
  if (navigator.userAgent.match(/Firefox/i)) {
    return xy(event.layerX, event.layerY);
  }
  else if (navigator.userAgent.match(/Chrome/i)) {
    return xy(event.layerX, event.layerY);
  }
  else if (navigator.userAgent.match(/MSIE/i)) {
    return xy(event.x - game.canvas.offsetLeft, event.y - game.canvas.offsetTop);
  }
  else {
  // This is the same as the Chrome code
    return xy(event.layerX, event.layerY);
  }
}

