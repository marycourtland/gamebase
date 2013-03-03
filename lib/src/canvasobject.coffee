# CanvasObject: a class for making objects on html5 canvases
# requires math2D.js

# Distance units are in pixels
# Time units are in ticks
class CanvasObject

  constructor: (ctx, pos, points, id) ->
    window.num_canvas_objects++
    @id = id || "obj#{num_canvas_objects - 1}"
    @ctx = ctx
    @points = points
    @pos = pos
    @rotation = 0 # In degrees
    @graphics = {
      color: "black"
      lineWidth: 2
    }
    @tickActions = []
    if @ctx.canvas.objects? then @ctx.canvas.objects.push(@) else @ctx.canvas.objects = [@]

  getPos: =>
    @pos

  draw: =>
    @pos.add xy(0.5, 0.5)
    @ctx.lineWidth = 0
    @ctx.strokeStyle = @graphics.color
    @ctx.fillStyle = @graphics.outline_color || @graphics.color
    @ctx.beginPath()
    @ctx.moveTo @pos.x + @points[0].x, @pos.y + @points[0].y
    c0 = null
    c1 = null
    i = 1

    while i < @points.length
      unless @points[i].length
        if c0 and c1
          @ctx.bezierCurveTo @pos.x + c0.x,
            @pos.y + c0.y,
            @pos.x + c1.x,
            @pos.y + c1.y
            @pos.x + @points[i].x,
            @pos.y + @points[i].y
        else
          @ctx.lineTo @pos.x + @points[i].x,
            @pos.y + @points[i].y
        c0 = null
        c1 = null
      else
        c0 = @points[i][0]
        c1 = @points[i][1]
      i++
    @ctx.lineTo @pos.x + @points[0].x, @pos.y + @points[0].y
    @ctx.stroke()
    @ctx.fill()
    @ctx.closePath()
    @pos.subtract xy(0.5, 0.5)

  move: (displacement) =>
    @pos.add displacement
    @pos.round 1

  rotate: (degrees) =>
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

  rotateTo: (degrees) =>
    @rotate -@rotation
    @rotate degrees

  # Get the absolute coordinates of one of the object's vertices
  getPoint: (i) =>
    throw "out of bounds: #{i} > #{@points.length - 1}" if i >= @points.length
    add @points[i], @pos

  # Returns true when the given point is inside the object's convex hull
  contains: (p) =>
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

  distanceTo: (obj) =>
    Math.abs subtract(@pos, obj.pos).r

  isNear: (obj, radius) =>
    radius = 30 unless radius?
    @distanceTo(obj) <= radius

  onclick: null
  ondrag: null
  onmousedown: null
  onmouseup: null

  tick: =>
    i = 0
    while i < @tickActions.length
      @tickActions[i].call(@)
      i++

    # Temporary code - to stop the object from moving past the bottom
    @pos.y > 400

  showImages: (images, keep_shape) =>
    images = [images] unless isArray(images)
    @draw_shape = @draw if keep_shape?

    if (@images) @images.extend(images)
    else @images = images

    @draw = =>
      @draw_shape() if keep_shape?
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

# Motion-related
# Give thingy a velocity
#
# TODO: add mass or something (or include it in the vector field)
class Actuateable extends CanvasObject
  constructor: ->
    super
    @is_dynamic = true
    @velocity = xy(0, 0)
    @frozen = false
    @forces = {}
    @addTickActions()

  getVelocity: =>
    @velocity

  addTickActions: =>
    @tickActions.push =>
      return if @frozen
      for i of @forces
        continue unless @forces[i]
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

    @tickActions.push =>
      return  if @frozen
      @move obj.velocity

  obey: (id, vectorfield) =>
    @forces[id] = vectorfield

  ignore: (id) =>
    return unless id of @forces
    delete @forces[id]

  freeze: =>
    @frozen = true

  unfreeze: =>
    @frozen = false

class Handleable extends CanvasObject
  constructor: ->
    @is_handled = true
  
  onmousedown: =>
    @freeze() if @is_dynamic

  ondrag: =>
    @move mouse.velocity

  onmouseup: =>
    @unfreeze() if @is_dynamic

class Launchable extends Handleable
  constructor: ->
    @is_launchable = true

  onmouseup: =>
    if @is_dynamic
      @velocity.add mouse.velocity
      @unfreeze()
    
# Allow the user to move it around w/ keys
# Smooth motion
class Navigateable extends CanvasObject 
  construct: (keydirs, @speed, freeze) ->
    @is_navigated = true
    @navigation = []
    @speed = 3 unless @speed
    @addTickActions()

  addTickActions: =>
    @tickActions.push =>
      return if @navigation.length is 0
      dx = xy(0, 0)
      i = 0

      while i < @navigation.length
        dx.add xy(-1, 0)  if @navigation[i] is "left"
        dx.add xy(1, 0)  if @navigation[i] is "right"
        dx.add xy(0, -1)  if @navigation[i] is "up"
        dx.add xy(0, 1)  if @navigation[i] is "down"
        i++
      dx.normalize @speed
      @move dx

    window.addEventListener "keydown", ((event) =>
      key = getKeyFromEvent(event)
      if key of keydirs
        i = 0

        while i < @navigation.length
          return  if @navigation[i] is keydirs[key]
          i++
        @navigation.push keydirs[key]
        @freeze()  if @is_dynamic and @freeze
    ), false

    window.addEventListener "keyup", (event) =>
      key = getKeyFromEvent(event)
      @navigation.splice @navigation.indexOf(keydirs[key]), 1  unless @navigation.indexOf(keydirs[key]) is -1
      @unfreeze() if @navigation.length is 0 and @unfreeze


# Other
bindClick = (obj, callback) ->
  obj.onclick = callback
  obj
bindKey = (obj, key, callback) ->
  window.addEventListener "keypress", (event) ->
    callback event  if getKeyFromEvent(event) is key

  obj
num_canvas_objects = 0
