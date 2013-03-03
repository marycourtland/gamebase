# CanvasObject: a class for making 
# requires math2D.js

# Distance units are in pixels
# Time units are in ticks
CanvasObject = (ctx, pos, points, id) ->
  num_canvas_objects++
  obj =
    id: (if id then id else "obj" + (num_canvas_objects - 1).toString())
    ctx: ctx
    points: points
    pos: pos
    rotation: 0 # in degrees
    graphics:
      color: "black"
      lineWidth: 2

    getPos: ->
      @pos

    
    # Draw the object on the canvas
    draw: ->
      @pos.add xy(0.5, 0.5)
      
      #this.ctx.lineWidth = 2;
      @ctx.lineWidth = 0 #this.graphics.lineWidth;
      @ctx.strokeStyle = @graphics.color
      @ctx.fillStyle = (if @graphics.outline_color then @graphics.outline_color else @graphics.color)
      @ctx.beginPath()
      @ctx.moveTo @pos.x + @points[0].x, @pos.y + @points[0].y
      c0 = null
      c1 = null
      i = 1

      while i < @points.length
        unless @points[i].length
          if c0 and c1
            @ctx.bezierCurveTo @pos.x + c0.x, @pos.y + c0.y, @pos.x + c1.x, @pos.y + c1.y, @pos.x + @points[i].x, @pos.y + @points[i].y
          
          #console.log("bz curve to " + this.points[i]);
          else
            
            #console.log("line to " + this.points[i])
            @ctx.lineTo @pos.x + @points[i].x, @pos.y + @points[i].y
          c0 = null
          c1 = null
        else
          
          #console.log("bz controls:  " + this.points[i][0] + " " + this.points[i][1]);
          c0 = @points[i][0]
          c1 = @points[i][1]
        i++
      @ctx.lineTo @pos.x + @points[0].x, @pos.y + @points[0].y
      @ctx.stroke()
      @ctx.fill()
      @ctx.closePath()
      @pos.subtract xy(0.5, 0.5)

    move: (displacement) ->
      @pos.add displacement
      @pos.round 1

    rotate: (degrees) ->
      rad = radians(degrees)
      i = 0

      while i < @points.length
        if @points[i].length
          @points[i][0].rotate rad
          @points[i][1].rotate rad
        else
          @points[i].rotate rad
        i++
      @rotation += degrees

    rotateTo: (degrees) ->
      @rotate -@rotation
      @rotate degrees

    
    # Get the absolute coordinates of one of the object's vertices
    getPoint: (i) ->
      throw "out of bounds: " + i + " > " + @points.length - 1  if i >= @points.length
      add @points[i], @pos

    
    # Returns true when the given point is inside the object's convex hull
    contains: (p) ->
      
      #console.log(""+this.pos);
      #console.log(""+p);
      #console.log("");
      #p.marker(ctx);
      #p = add(this.pos, neg(p));
      #v1 = add(this.getPoint(0), neg(p));
      #console.log(""+v1);
      angle = 0
      angles = []
      i = 0

      while i < @points.length
        angles.push mod(add(@getPoint(i), neg(p)).th, 360)
        i++
      angles.sort (a1, a2) ->
        a1 - a2

      i = 1

      while i < @points.length
        a1 = angles[i - 1]
        a2 = angles[i]
        return false  if a2 - a1 > Math.PI
        i++
      2 * Math.PI - angles[@points.length - 1] + angles[0] <= Math.PI

    distanceTo: (obj) ->
      Math.abs subtract(@pos, obj.pos).r

    isNear: (obj, radius) ->
      radius = 30  unless radius?
      @distanceTo(obj) <= radius

    
    # Input events
    onclick: (evt) ->

    ondrag: (evt) ->

    onmousedown: (evt) ->

    onmouseup: (evt) ->

    
    # The tick event
    tick: ->
      
      #console.log(this.tickActions);
      i = 0

      while i < @tickActions.length
        @tickActions[i].call this
        i++
      
      # Temoporary code - to stop the object from moving past the bottom
      @pos.y > 400

    
    #this.velocity = vzero;
    #this.pos = xy(this.pos.x, 400);
    tickActions: []

  ctx.canvas.objects = []  unless ctx.canvas.objects
  ctx.canvas.objects.push obj
  obj

# Functions to give objects certain features

# Motion-related
actuate = (obj) -> # Allow it to move & obey forces
  # todo: add mass or something (or include it in the vector field)
  obj.is_dynamic = true
  obj.velocity = xy(0, 0)
  obj.frozen = false
  obj.forces = {}
  obj.getVelocity = ->
    @velocity

  obj.tickActions.push ->
    return  if @frozen
    for i of @forces
      continue  unless @forces[i]
      type = @forces[i].type
      if type.length >= 4 and type.slice(0, 4) is "temp"
        @forces[i].countdown -= 0
        continue  if @forces[i].countdown < 0
        type = type.replace("temp ", "")
      if type is "effect"
        @forces[i].at this
      else if type is "acceleration"
        @velocity.add @forces[i].at(this)
      else @move @forces[i].at(this)  if type is "velocity"

  obj.tickActions.push ->
    return  if @frozen
    @move obj.velocity

  obj.obey = (id, vectorfield) ->
    @forces[id] = vectorfield

  obj.ignore = (id) ->
    return  unless id of @forces
    delete @forces[id]

  obj.freeze = ->
    @frozen = true

  obj.unfreeze = ->
    @frozen = false

  obj
handle = (obj) -> # Allow the user to click & drag it
  obj.is_handled = true
  obj.onmousedown = ->
    @freeze()  if @is_dynamic

  obj.ondrag = ->
    @move mouse.velocity

  obj.onmouseup = ->
    @unfreeze()  if @is_dynamic

  obj
launch = (obj) -> # Allow the user to "throw" it with the mouse
  handle obj  unless obj.is_handled
  obj.is_launchable = true
  obj.onmouseup = ->
    if @is_dynamic
      @velocity.add mouse.velocity
      @unfreeze()

  obj

# Allow the user to move it around w/ keys
# Smooth motion
navigate = (obj, keydirs, speed, freeze) ->
  obj.is_navigated = true
  obj.navigation = []
  unless speed?
    obj.speed = 3
  else
    obj.speed = speed
  obj.tickActions.push ->
    return  if @navigation.length is 0
    dx = xy(0, 0)
    i = 0

    while i < @navigation.length
      dx.add xy(-1, 0)  if @navigation[i] is "left"
      dx.add xy(1, 0)  if @navigation[i] is "right"
      dx.add xy(0, -1)  if @navigation[i] is "up"
      dx.add xy(0, 1)  if @navigation[i] is "down"
      i++
    dx.normalize @speed
    obj.move dx

  window.addEventListener "keydown", ((event) ->
    key = getKeyFromEvent(event)
    if key of keydirs
      i = 0

      while i < obj.navigation.length
        return  if obj.navigation[i] is keydirs[key]
        i++
      obj.navigation.push keydirs[key]
      obj.freeze()  if obj.is_dynamic and freeze
  ), false
  window.addEventListener "keyup", (event) ->
    key = getKeyFromEvent(event)
    obj.navigation.splice obj.navigation.indexOf(keydirs[key]), 1  unless obj.navigation.indexOf(keydirs[key]) is -1
    obj.unfreeze()  if obj.navigation.length is 0 and obj.unfreeze

  obj

# Discrete motion
#
#function navigate(obj, keydirs, speed, freeze) {  
#  obj.is_navigated = true;
#  obj.navigation = [];
#  if (speed == null) obj.speed = 3;
#  else obj.speed = speed;
#  obj.tickActions.push(function() {
#    if (this.navigation.length == 0) return;
#    dx = xy(0, 0);
#    for (var i=0; i < this.navigation.length; i++) {
#      if (this.navigation[i] == 'left') dx.add(xy(-1, 0));
#      if (this.navigation[i] == 'right') dx.add(xy(1, 0));
#      if (this.navigation[i] == 'up') dx.add(xy(0, -1));
#      if (this.navigation[i] == 'down') dx.add(xy(0, 1));
#    }
#    dx.normalize(this.speed);
#    obj.move(dx);
#  });
#  window.addEventListener("keydown", function(event) {
#    key = getKeyFromEvent(event);
#    if (key in keydirs) key = keydirs[key];
#    if (key == 'left') obj.move(xy(-block_size.x, 0));
#    if (key == 'right') obj.move(xy(block_size.x, 0));
#    if (key == 'up') obj.move(xy(0, -block_size.y));
#    if (key == 'down') obj.move(xy(0, block_size.y));
#  });
#  return obj;
#}

# Game-related
character = (obj) ->
  obj.inventory = []
  obj.holds = (item, offset) ->
    offset = xy(-20, 0)  unless offset?
    item.hold_offset = offset
    item.ignore "held"
    item.obey "held", heldBy(obj, offset)
    @inventory.push item

  obj.drops = (item, relocation) ->
    return  if @inventory.indexOf(item) is -1
    item.ignore "held"
    @inventory.splice @inventory.indexOf(item), 1
    item.move relocation  if relocation?

  obj.switchHands = ->
    return  if @inventory.length is 0
    @inventory[0].hold_offset.xreflect()
    @inventory[0].ignore "held"
    @inventory[0].obey "held", heldBy(obj, @inventory[0].hold_offset)

  obj.comment = null
  obj.commentOffset = null
  obj.say = (txt, offset) ->
    duration = 2
    obj.comment = txt
    obj.comment_offset = (if offset then offset else xy(25, -5))
    setTimeout (->
      obj.comment = null
    ), duration * 1000

  obj.draw_before_comment = obj.draw
  obj.draw = ->
    @draw_before_comment()
    if obj.comment?
      newFontSize 12
      text obj.comment, add(obj.pos, obj.comment_offset), "sw"
      newFontSize 20

  obj

# Other
showImages = (obj, images, keep_shape) ->
  if (!isArray(images)) images = [images]
  obj.draw_shape = obj.draw  if keep_shape?
  if (obj.images) obj.images.extend(images)
  else obj.images = images
  obj.draw = ->
    obj.draw_shape()  if keep_shape?
    i = 0

    while i < @images.length
      if @images[i].length and @images[i].length > 0
        img = @images[i][0]
        if @images[i].length >= 2
          offset = @images[i][1]
        else
          offset = xy(0, 0)
      else
        img = @images[i]
        offset = xy(0, 0)
      @ctx.drawImage img, round(@pos.x + offset.x, 0), round(@pos.y + offset.y, 0)
      i++

  obj
bindClick = (obj, callback) ->
  obj.onclick = callback
  obj
bindKey = (obj, key, callback) ->
  window.addEventListener "keypress", (event) ->
    callback event  if getKeyFromEvent(event) is key

  obj
num_canvas_objects = 0
