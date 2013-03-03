(function() {
  var boxcoords, clear, drawGrid, grid, hw, isArray, isInArray, iter, loadImage, logf, randomColor, text;

  logf = function() {
    var func, indent, stack, stackstring;
    stack = [];
    func = arguments_.callee.caller;
    stackstring = func.name;
    indent = "";
    while (func && stack.length < 10) {
      stack.push(func);
      func = stack[stack.length - 1]["arguments"].callee.caller;
      if (func) {
        stackstring = func.name + " > " + stackstring;
        indent += "    ";
      }
    }
    return console.log("[-logf-]", stackstring, stack[0]["arguments"]);
  };

  loadImage = function(ctx, src, pos) {
    var img;
    img = new Image();
    if (pos) {
      img.onload = function() {
        return ctx.drawImage(img, pos.x, pos.y);
      };
    }
    img.src = src;
    return img;
  };

  iter = function(array, callback) {
    var i, _results;
    if (!callback || !array || !array.length) {
      return;
    }
    i = 0;
    _results = [];
    while (i < array.length) {
      callback(array[i]);
      _results.push(i++);
    }
    return _results;
  };

  isArray = function(a) {
    return Object.prototype.toString.apply(a) === "[object Array]";
  };

  isInArray = function(item, a) {
    return a.indexOf(item) !== -1;
  };

  hw = function() {
    return console.log("Hello world");
  };

  clear = function(ctx) {
    return ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  text = function(txt, pos, pos_loc) {
    var i, _results;
    if (!isArray(txt)) {
      txt = [txt];
    }
    if (pos === "center") {
      pos = xy(c.width / 2 - ctx.measureText(txt).width / 2, c.height / 2 + font.size / 2);
    } else if (!pos_loc || pos_loc.toLowerCase() === "nw") {
      pos.add(xy(0, font.size));
    } else if (pos_loc.toLowerCase() === "ne") {
      pos.add(xy(-ctx.measureText(txt).width, font.size));
    } else {
      if (pos_loc.toLowerCase() === "se") {
        pos.add(xy(ctx.measureText(txt).width, 0));
      }
    }
    i = 0;
    _results = [];
    while (i < txt.length) {
      if (typeof txt[i] !== "string") {
        continue;
      }
      ctx.fillText(txt[i], pos.x, pos.y);
      pos.add(xy(0, font.size));
      _results.push(i++);
    }
    return _results;
  };

  boxcoords = function(size) {
    var r;
    r = size / 2;
    return [xy(-r, -r), xy(r, -r), xy(r, r), xy(-r, r)];
  };

  randomColor = function() {
    var rgb;
    rgb = Math.floor(Math.random() * Math.pow(256, 3)).toString(16);
    return "#" + rgb;
  };

  drawGrid = function() {
    var H, W, dx, dy, i, p0, p1, _results;
    if (!grid.dash) {
      grid.dash = 1;
    }
    if (!grid.color) {
      grid.color = "gray";
    }
    ctx.strokeStyle = grid.color;
    ctx.lineWidth = 1;
    W = ctx.canvas.width;
    H = ctx.canvas.height;
    dx = xy(grid.x, 0);
    dy = xy(0, grid.y);
    p0 = xy(0, 0.5);
    p1 = xy(W, 0.5);
    i = 0;
    while (p0.y <= H) {
      if (grid.X && i % grid.X !== 0) {
        p1.x = grid.dash;
        while (p1.x <= W) {
          line(ctx, p0, p1);
          p0.add({
            x: grid.dash * 2,
            y: 0
          });
          p1.add({
            x: grid.dash * 2,
            y: 0
          });
        }
        p0.x = 0;
        p1.x = W;
      } else {
        line(ctx, p0, p1);
      }
      p0.add({
        x: 0,
        y: grid.y
      });
      p1.add({
        x: 0,
        y: grid.y
      });
      i++;
    }
    p0 = xy(0.5, 0);
    p1 = xy(0.5, H);
    i = 0;
    _results = [];
    while (p0.x <= W) {
      if (grid.Y && i % grid.Y !== 0) {
        p1.y = grid.dash;
        while (p1.y <= H) {
          line(ctx, p0, p1);
          p0.add({
            x: 0,
            y: grid.dash * 2
          });
          p1.add({
            x: 0,
            y: grid.dash * 2
          });
        }
        p0.y = 0;
        p1.y = H;
      } else {
        line(ctx, p0, p1);
      }
      p0.add({
        x: grid.x,
        y: 0
      });
      p1.add({
        x: grid.x,
        y: 0
      });
      _results.push(i++);
    }
    return _results;
  };

  grid = {
    color: "gray",
    x: 20,
    y: 20,
    X: 5,
    Y: 5
  };

}).call(this);
