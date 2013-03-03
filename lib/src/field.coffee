# Vector field class (requires math2D.js)
#  The at_func argument should take an object (e.g. a CanvasObject) and
#  compute the vector at that object's position (obj.pos).
#  
#  Use field.at(obj) to get 
#

class Field
  constructor: (type, at_func) ->
    if arguments.length is 1
      @at_func = type
      @type = "effect"

  at: @at_func
  type: @type

  display: (ctx, spacing) ->
    # Assumes that the canvas hasn't been translated
    pos = xy(0.5, 0.5)

    while pos.y <= ctx.canvas.height
      while pos.x <= ctx.canvas.width
        pos.marker ctx

field = (type, at_func) ->
  display: (ctx, spacing) ->
    
    # Assumes that the canvas hasn't been translated
    pos = xy(0.5, 0.5)
    while pos.y <= ctx.canvas.height
      while pos.x <= ctx.canvas.width
        pos.marker ctx
        line ctx, pos, add(pos, @at(pos))
        pos.xshift spacing
      pos.yshift spacing
      pos.x = 0.5

  
  # Only allow nonzero field values when the condition_func returns true
  condition: (condition_func) ->
    at_func = @at
    @at = (obj) ->
      return xy(0, 0)  unless condition_func(obj)
      at_func obj

    this

  bound: (boundary_values) ->
    
    # This puts a bounding box on the vector field.
    # Outside the bbox (or circular area), the field is zero.
    @boundaries = boundary_values
    if @boundaries.radius? and @boundaries.pos?
      radius = @boundaries.radius
      pos = @boundaries.pos
      cond_func = ->
        subtract(obj.pos, pos).r > radius
    else
      cond_func = (obj) ->
        (not @boundaries.xmin? or obj.pos.x > @boundaries.xmin) and (not @boundaries.xmax? or obj.pos.x > @boundaries.xmax) and (not @boundaries.ymin? or obj.pos.y > @boundaries.ymin) and (not @boundaries.ymax? or obj.pos.y > @boundaries.ymax)
    @condition cond_func
    this

# Particular cases of vector fields
field_constant = (v) -> # useful for standard earth-gravity
  vf = field("acceleration", null)
  vf.at = (obj) ->
    v

  vf
field_linear = (v0, delta) ->
  
  # v0 is the vield at the origin; delta is the constant difference
  vf = field((obj) ->
    add v0, dot(obj.pos, delta)
  )
  vf.type = "acceleration"
  vf
field_inverse_square = (center, params) -> # useful for planetary orbits
  params = (if params then params else {})
  params.scale = (if params.scale then params.scale else 1)
  vf = field((obj) ->
    dist = subtract(center, obj.pos)
    rth params.scale / (dist.r * dist.r), mod(dist.th, Math.PI * 2)
  )
  vf.type = "acceleration"
  vf
reflecting_boundary = (boundary_values) ->
  vf = field("effect", null)
  vf.vals = boundary_values
  vf.at = (obj) ->
    obj.velocity.xreflect()  if @vals.xmin? and obj.pos.x <= @vals.xmin and obj.velocity.x < 0
    obj.velocity.xreflect()  if @vals.xmax? and obj.pos.x >= @vals.xmax and obj.velocity.x > 0
    obj.velocity.yreflect()  if @vals.ymin? and obj.pos.y <= @vals.ymin and obj.velocity.y < 0
    obj.velocity.yreflect()  if @vals.ymax? and obj.pos.y >= @vals.ymax and obj.velocity.y > 0

  vf
reflecting_surfaces = (boundary_values) ->
  vf = field((obj) ->
    vzero
  )
  vf.type = "effect"
  vf.left = boundary_values.left
  vf.right = boundary_values.right
  vf.top = boundary_values.top
  vf.bottom = boundary_values.bottom
  return vf  if not vf.left? or not vf.right? or not vf.top? or not vf.bottom?
  vf.at = (obj) ->
    wall_distances =
      top: obj.pos.y - @top
      bottom: @bottom - obj.pos.y
      left: obj.pos.x - @left
      right: @right - obj.pos.x

    for d of wall_distances
      return vzero  if wall_distances[d] < 0
    min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right)
    obj.velocity.yreflect()  if min_dist is wall_distances.top and obj.velocity.y > 0
    obj.velocity.yreflect()  if min_dist is wall_distances.bottom and obj.velocity.y < 0
    obj.velocity.xreflect()  if min_dist is wall_distances.right and obj.velocity.x < 0
    obj.velocity.xreflect()  if min_dist is wall_distances.left and obj.velocity.x > 0
    vzero

  vf
dynamic_reflecting_surfaces = (obj, boundary_values) ->
  
  # This is for when the surfaces are moving;
  # boundary_values should hold functions instead of values.
  unless boundary_values?
    boundary_values = obj
    obj = null
  vf = field("effect", (obj) ->
    vzero
  )
  vf.left = boundary_values.left
  vf.right = boundary_values.right
  vf.top = boundary_values.top
  vf.bottom = boundary_values.bottom
  return vf  if not vf.left? or not vf.right? or not vf.top? or not vf.bottom?
  vf.at = (obj) ->
    wall_distances =
      top: obj.pos.y - @top()
      bottom: @bottom() - obj.pos.y
      left: obj.pos.x - @left()
      right: @right() - obj.pos.x

    console.log wall_distances  if @print and game.frame % 30 is 0
    for d of wall_distances
      return  if wall_distances[d] < 0
    min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right)
    obj.velocity.yreflect()  if min_dist is wall_distances.top and obj.velocity.y > 0
    obj.velocity.yreflect()  if min_dist is wall_distances.bottom and obj.velocity.y < 0
    obj.velocity.xreflect()  if min_dist is wall_distances.right and obj.velocity.x < 0
    obj.velocity.xreflect()  if min_dist is wall_distances.left and obj.velocity.x > 0

  vf
solid_object_surfaces = (solid_obj, boundary_values) ->
  solid_obj.bvals = boundary_values
  vf = field("effect", null)
  vf.obj = solid_obj
  vf.top = ->
    @obj.pos.y + @obj.bvals.top

  vf.bottom = ->
    @obj.pos.y + @obj.bvals.bottom

  vf.left = ->
    @obj.pos.x + @obj.bvals.left

  vf.right = ->
    @obj.pos.x + @obj.bvals.right

  vf.at = (obj) ->
    wall_distances =
      top: obj.pos.y - @top()
      bottom: @bottom() - obj.pos.y
      left: obj.pos.x - @left()
      right: @right() - obj.pos.x

    for d of wall_distances
      return  if wall_distances[d] < 0
    min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right)
    vec = xy(0, 0)
    if obj.is_navigated
      if min_dist is wall_distances.top
        dir = "up"
        vec = xy(0, -min_dist - 1)
      if min_dist is wall_distances.bottom
        dir = "down"
        vec = xy(0, min_dist + 1)
      if min_dist is wall_distances.right
        dir = "right"
        vec = xy(min_dist + 1, 0)
      if min_dist is wall_distances.left
        dir = "left"
        vec = xy(-min_dist - 1, 0)
      obj.move vec
      i = 0

      while i < obj.navigation.length
        console.log vec + "", dir, obj.navigation[i]  if game.frame % 150 is 0 and obj.id is "grownup"
        obj.navigation.splice i, 1  unless obj.navigation[i] is dir
        i++
    else
      obj.velocity.yreflect()  if min_dist is wall_distances.top and obj.velocity.y > 0
      obj.velocity.yreflect()  if min_dist is wall_distances.bottom and obj.velocity.y < 0
      obj.velocity.xreflect()  if min_dist is wall_distances.right and obj.velocity.x < 0
      obj.velocity.xreflect()  if min_dist is wall_distances.left and obj.velocity.x > 0

  vf
goToDestination = (scale_factor) ->
  field "velocity", (obj) ->
    return xy(0, 0)  unless obj.getDestination
    return xy(0, 0)  if equals(obj.pos, obj.getDestination())
    scale subtract(obj.getDestination(), obj.pos), scale_factor

leaveDestination = (scale_factor) ->
  field "velocity", (obj) ->
    return xy(0, 0)  unless obj.getDestination
    scale subtract(obj.pos, obj.getDestination()), scale_factor

springforce = (center, k) ->
  vf = field("acceleration", null)
  vf.k = k
  vf.center = xy(center.x, center.y)
  vf.at = (obj) ->
    
    #console.log(obj.pos+"", this.center+"", subtract(obj.pos, this.center)+"", this.k, scale(subtract(obj.pos, this.center), this.k)+"");
    scale subtract(@center, obj.pos), @k

  vf
oscillation = (frequency, amplitude) -> # Frequency in hz
  vf = field("acceleration", null)
  vf.t0 = getTime()
  vf.amp = amplitude
  vf.freq = frequency
  vf.at = (obj) ->
    t = (getTime() - @t0) / 1000
    console.log t, Math.cos(2 * Math.PI * @freq * t), scale(@amp * 2 * Math.PI * @freq, Math.cos(2 * Math.PI * @freq * t)) + ""
    scale @amp * 2 * Math.PI * @freq, Math.cos(2 * Math.PI * @freq * t)

  vf.f0 = game.frame
  vf

# This makes an item stay close to the character holding it
heldBy = (holder, offset) ->
  vf = field("effect", (item) ->
    item.pos = add(offset, holder.getPos())
  )
  vf

# Two implementations of random walks
random_walk = (max_speed) ->
  field "velocity", (obj) ->
    return randAngle(Math.random() * max_speed)  if obj.is_dynamic
    xy 0, 0

random_turns = (interval, angle1, angle2) ->
  unless angle1?
    angle_width = Math.PI * 2
  else unless angle2?
    angle_width = angle1
  else
    angle_width = angle2 - angle1
  field "effect", (obj) ->
    if obj.is_dynamic and mod(game.frame, interval) is 0
      da = Math.random() * angle_width
      da *= -1  if Math.random() < 0.5
      obj.velocity.rotate da

random_turns_with_pauses = (interval, pause, pause_width, angle1, angle2) ->
  unless angle1?
    angle_width = Math.PI * 2
  else unless angle2?
    angle_width = angle1
  else
    angle_width = angle2 - angle1
  vf = field("effect", null)
  vf.pause = pause + Math.random() * pause_width
  vf.at = (obj) ->
    if obj.is_dynamic
      obj._velocity = obj.velocity  unless obj._velocity
      obj.velocity = xy(0, 0)  if mod(game.frame, interval + @pause) > interval
      if mod(game.frame, interval + @pause) is 0
        @pause = pause + Math.random() * pause_width
        da = Math.random() * angle_width
        da *= -1  if Math.random() < 0.5
        obj.velocity = obj._velocity
        obj.velocity.rotate da
        obj._velocity = obj.velocity

# Field superposition
superpose = (vf1, vf2) ->
  vf = field(null, null)
  vf.type = vf1.type
  vf.f1 = vf1
  vf.f2 = vf2
  vf.at = (obj) ->
    at1 = @f1.at(obj)
    at2 = @f2.at(obj)
    unless @f2.type is @type
      obj.move at2  if @f2.type is "velocity"
      obj.velocity.add at2  if @f2.type is "acceleration"
      return at1
    add at1, at2  unless @type is "effect"
