function update_mouse() {
  if (!mouse.new_pos) {
    if (mouse.motion == "moving") mouse.motion = "stopped";
    else {
      mouse.motion = "still";
      mouse.velocity = xy(0, 0);
    }
  }
  mouse.new_pos = false;
}
function next() {
  update_mouse();
  game.ctx.fillStyle = game.bg_color;
  game.ctx.fillRect(0, 0, 600, 400);
  iter(game.objects, function(obj) { obj.tick(); });
  iter(game.objects, function(obj) { obj.draw(); });
  tick();
}
function tick() {
  game.frame++;
  setTimeout(next, 1000/game.fps);
}
window.onload = function() {
  game.ctx.canvas.style.backgroundColor = game.bg_color;
  game.ctx.font = game.font.size.toString() + "px " + game.font.type;
  //titleScreen();
  //menu();
  
  tick();
}
