(function() {
  var Draw;

  Draw = (function() {

    function Draw() {}

    Draw.line = function(ctx, p0, p1) {
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      return ctx.closePath();
    };

    Draw.rect = function(ctx, p0, p1) {
      ctx.beginPath();
      ctx.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
      ctx.fill();
      ctx.stroke();
      return ctx.closePath();
    };

    Draw.circle = function(ctx, center, radius) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
      ctx.stroke();
      return ctx.closePath();
    };

    Draw.bezier = function(ctx, p0, p1, c0, c1, show_controls) {
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(c0.x, c0.y, c1.x, c1.y, p1.x, p1.y);
      ctx.stroke();
      ctx.closePath();
      if (show_controls) {
        marker(ctx, c0.x, c0.y);
        return marker(ctx, c1.x, c1.y);
      }
    };

    Draw.marker = function(ctx, pos, color) {
      if (color) {
        ctx.strokeStyle = color;
      }
      return circle(ctx, pos, 1);
    };

    return Draw;

  }).call(this);

  window.Z.Draw = Draw;

}).call(this);
