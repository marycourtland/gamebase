// Miscellaneous useful 
MOUSE_DOWN = "mouse down";
MOUSE_UP = "mouse up";
MOUSE_DRAG = "mouse drag";

function logf() {
    stack = []
    func = arguments.callee.caller
    stackstring = func.name
    indent = ""
    while (func && stack.length<10) {
        stack.push(func)
        func = stack[stack.length-1].arguments.callee.caller
        if (func) {
            stackstring = func.name + " > " + stackstring
            indent += "    "
        }
    }
    console.log("[-logf-]", stackstring, stack[0].arguments);
}
function loadImage(ctx, src, pos) {
    var img = new Image();
    if (pos) img.onload = function() { ctx.drawImage(img, pos.x, pos.y); }
    img.src = src;
    return img
}
function iter(array, callback) {
    if (!callback || !array || !array.length) return;
    for (var i=0; i < array.length; i++) {
        callback(array[i]);
    }
}
function isArray(a) {
  return Object.prototype.toString.apply(a) === '[object Array]';
}
function isInArray(item, a) {
  return a.indexOf(item) != -1;
}
function hw() {
    console.log("Hello world");
}
function clear(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
function text(txt, pos, pos_loc) {
    if (!isArray(txt)) txt = [txt];
    
    if (pos == "center")
        pos = xy(c.width/2 - ctx.measureText(txt).width/2, c.height/2 + font.size/2);
    else if (!pos_loc || pos_loc.toLowerCase()=="nw")
        pos.add(xy(0, font.size));
    else if (pos_loc.toLowerCase()=="ne")
        pos.add(xy(-ctx.measureText(txt).width, font.size));
    else if (pos_loc.toLowerCase()=="se")
        pos.add(xy(ctx.measureText(txt).width, 0));
        
    for (var i=0; i < txt.length; i++) {
        if (typeof(txt[i]) != "string") continue;
        ctx.fillText(txt[i], pos.x, pos.y);
        pos.add(xy(0, font.size));
    }
}
function boxcoords(size) {
    var r = size/2;
    return [xy(-r, -r), xy(r, -r), xy(r, r), xy(-r, r)];
}
function randomColor() {
    rgb = Math.floor(Math.random() * Math.pow(256, 3)).toString(16);
    return '#' + rgb
} 

grid = {color: "gray", x:20, y:20, X:5, Y:5};
function drawGrid() {
    if (!grid.dash) grid.dash = 1;
    if (!grid.color) grid.color = "gray";
    
    ctx.strokeStyle = grid.color;
    ctx.lineWidth = 1;
    
    var W = ctx.canvas.width;
    var H = ctx.canvas.height;
    
    var dx = xy(grid.x, 0);
    var dy = xy(0, grid.y);
    
    // Horizontal grid lines
    var p0 = xy(0, 0.5);
    var p1 = xy(W, 0.5);
    var i = 0;
    while (p0.y <= H) {
        // Minor grid lines
        if (grid.X && i % grid.X != 0) {
            p1.x = grid.dash;
            while(p1.x <= W) {
                line(ctx, p0, p1);
                p0.add({x:grid.dash*2, y:0});
                p1.add({x:grid.dash*2, y:0});
            }
            p0.x = 0;
            p1.x = W;
        }
        // Major grid lines
        else {
            line(ctx, p0, p1);
        }
        p0.add({x:0, y:grid.y});
        p1.add({x:0, y:grid.y});
        i++;
    }
    // Vertical grid lines
    p0 = xy(0.5, 0);
    p1 = xy(0.5, H);
    i = 0;
    while (p0.x <= W) {
        // Minor grid lines
        if (grid.Y && i % grid.Y != 0) {
            p1.y = grid.dash;
            while(p1.y <= H) {
                line(ctx, p0, p1);
                p0.add({x:0, y:grid.dash*2});
                p1.add({x:0, y:grid.dash*2});
            }
            p0.y = 0;
            p1.y = H;
        }
        // Major grid lines
        else {
            line(ctx, p0, p1);
        }
        p0.add({x:grid.x, y:0});
        p1.add({x:grid.x, y:0});
        i++;
    }
}