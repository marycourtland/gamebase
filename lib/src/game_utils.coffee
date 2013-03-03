# Miscellaneous useful functions
logf = ->
  stack = []
  func = arguments_.callee.caller
  stackstring = func.name
  indent = ""
  while func and stack.length < 10
    stack.push func
    func = stack[stack.length - 1].arguments.callee.caller
    if func
      stackstring = func.name + " > " + stackstring
      indent += "    "
  console.log "[-logf-]", stackstring, stack[0].arguments
loadImage = (ctx, src, pos) ->
  img = new Image()
  if pos
    img.onload = ->
      ctx.drawImage img, pos.x, pos.y
  img.src = src
  img
iter = (array, callback) ->
  return  if not callback or not array or not array.length
  i = 0

  while i < array.length
    callback array[i]
    i++
isArray = (a) ->
  Object::toString.apply(a) is "[object Array]"
isInArray = (item, a) ->
  a.indexOf(item) isnt -1
hw = ->
  console.log "Hello world"
clear = (ctx) ->
  ctx.clearRect 0, 0, ctx.canvas.width, ctx.canvas.height
text = (txt, pos, pos_loc) ->
  txt = [txt]  unless isArray(txt)
  if pos is "center"
    pos = xy(c.width / 2 - ctx.measureText(txt).width / 2, c.height / 2 + font.size / 2)
  else if not pos_loc or pos_loc.toLowerCase() is "nw"
    pos.add xy(0, font.size)
  else if pos_loc.toLowerCase() is "ne"
    pos.add xy(-ctx.measureText(txt).width, font.size)
  else pos.add xy(ctx.measureText(txt).width, 0)  if pos_loc.toLowerCase() is "se"
  i = 0

  while i < txt.length
    continue  unless typeof (txt[i]) is "string"
    ctx.fillText txt[i], pos.x, pos.y
    pos.add xy(0, font.size)
    i++
boxcoords = (size) ->
  r = size / 2
  [xy(-r, -r), xy(r, -r), xy(r, r), xy(-r, r)]
randomColor = ->
  rgb = Math.floor(Math.random() * Math.pow(256, 3)).toString(16)
  "#" + rgb
drawGrid = ->
  grid.dash = 1  unless grid.dash
  grid.color = "gray"  unless grid.color
  ctx.strokeStyle = grid.color
  ctx.lineWidth = 1
  W = ctx.canvas.width
  H = ctx.canvas.height
  dx = xy(grid.x, 0)
  dy = xy(0, grid.y)
  
  # Horizontal grid lines
  p0 = xy(0, 0.5)
  p1 = xy(W, 0.5)
  i = 0
  while p0.y <= H
    
    # Minor grid lines
    if grid.X and i % grid.X isnt 0
      p1.x = grid.dash
      while p1.x <= W
        line ctx, p0, p1
        p0.add
          x: grid.dash * 2
          y: 0

        p1.add
          x: grid.dash * 2
          y: 0

      p0.x = 0
      p1.x = W
    
    # Major grid lines
    else
      line ctx, p0, p1
    p0.add
      x: 0
      y: grid.y

    p1.add
      x: 0
      y: grid.y

    i++
  
  # Vertical grid lines
  p0 = xy(0.5, 0)
  p1 = xy(0.5, H)
  i = 0
  while p0.x <= W
    
    # Minor grid lines
    if grid.Y and i % grid.Y isnt 0
      p1.y = grid.dash
      while p1.y <= H
        line ctx, p0, p1
        p0.add
          x: 0
          y: grid.dash * 2

        p1.add
          x: 0
          y: grid.dash * 2

      p0.y = 0
      p1.y = H
    
    # Major grid lines
    else
      line ctx, p0, p1
    p0.add
      x: grid.x
      y: 0

    p1.add
      x: grid.x
      y: 0

    i++
grid =
  color: "gray"
  x: 20
  y: 20
  X: 5
  Y: 5
