function line(ctx, p0, p1) {
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
  ctx.closePath();
}
function rect(ctx, p0, p1) {
  ctx.beginPath();
  ctx.rect(p0.x, p0.y, p1.x-p0.x, p1.y-p0.y);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
function circle(ctx, center, radius) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, false);
  //ctx.fill();
  ctx.stroke();
  ctx.closePath();
}
function bezier(ctx, p0, p1, c0, c1, show_controls) { 
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(c0.x, c0.y, c1.x, c1.y, p1.x, p1.y);
  ctx.stroke();
  ctx.closePath();
  if (show_controls) {
    marker(ctx, c0.x, c0.y);
    marker(ctx, c1.x, c1.y);
  }
}
function marker(ctx, pos, color) {
  if (color) { ctx.strokeStyle = color; }
    circle(ctx, pos, 1);
}
