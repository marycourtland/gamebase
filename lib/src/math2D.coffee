# 2D VECTOR MATH
#  The vector class is easy to use, but it is NOT optimized!
#  (Each vector operation has computational overhead so that
#   the different coordinates are updated and easy to use.)
#
#  Examples of vectors:
#    v1 = xy(3, 4)
#    v2 = rth(6, Math.PI/2)    // equivalent to xy(0, 6)
#    v3 = rth(6, radians(90))  // same as v2
#  
#  The vectors will automatically compute the coordinates
#  in both rectangular and polar coordinate systems:
#    v1.r  =>  5
#    v2.y  =>  6
#  
#  Display vectors:
#    v1.toString()           =>  "xy(3,4)"
#    v2.toString()           =>  "rth(6,1.5707963267948966)"
#    round(v2, 2).toString() =>  "rth(6,1.57)"
#    
#  Create new vectors with sundry vector operations:
#    v4 = add(v1, v2);             v4 =>  xy(3, 10)
#    v5 = scale(v1, 10);           v5 =>  xy(30, 40)
#    v6 = rotate(v1, Math.PI);     v6 =>  rth(3, -4)
#  (see code for full list of operations)
#  
#  Perform an operation directly on a vector:
#    v1.subtract(xy(1, 1));        v1 =>  xy(2, 3)
#    v2.yreflect();                v2 =>  rth(-6, 1.57...)
#    
#  Declare a vector to be constant; operations will not affect it:
#    v7 = xy(7, 70); v7.add(v1);   v7 =>  xy(7, 70)  
#

# CONVENTIONS:
# Everything in this script is for two dimensions 
# All angles are in radians, unless otherwise specified

# Modes (coordinate systems)

# 2D vectors
vector = (vec_params, mode) ->
  vec_params._set_rth = (r, th, override_constant) ->
    return  if @constant and not override_constant
    @r = r
    @th = mod(th, 2 * Math.PI)
    @_update_xy override_constant

  vec_params._set_xy = (x, y, override_constant) ->
    return  if @constant and not override_constant
    @x = x
    @y = y
    @_update_rth override_constant

  vec_params._update_rth = (override_constant) ->
    return  if @constant and not override_constant
    @r = Math.sqrt(@x * @x + @y * @y)
    @th = mod(Math.atan2(@y, @x), 2 * Math.PI)

  vec_params._update_xy = (override_constant) ->
    return  if @constant and not override_constant
    @x = @r * Math.cos(@th)
    @y = @r * Math.sin(@th)

  vec_params.add = (v) ->
    @_set_xy @x + v.x, @y + v.y
    this

  vec_params.subtract = (v) ->
    @_set_xy @x - v.x, @y - v.y
    this

  vec_params.neg = ->
    @_set_rth -@r, @th
    this

  vec_params.xshift = (dx) ->
    @_set_xy @x + dx, @y
    this

  vec_params.yshift = (dy) ->
    @_set_xy @x, @y + dy
    this

  vec_params.normalize = (r) ->
    r = 1  unless r?
    @_set_rth r, @th

  vec_params.scale = (c) ->
    @_set_rth @r * c, @th
    this

  vec_params.rotate = (radians) ->
    @_set_rth @r, @th + radians
    this

  vec_params.xreflect = ->
    @_set_xy @x * -1, @y
    this

  vec_params.yreflect = ->
    @_set_xy @x, @y * -1
    this

  vec_params.round = (decimals) ->
    @_set_xy round(@x, decimals), round(@y, decimals), true

  vec_params.toString = ->
    @mode[0] + "(" + vec_params[vec_params.mode[1]] + "," + vec_params[vec_params.mode[2]] + ")"

  vec_params.copy = ->
    xy @x, @y

  vec_params.marker = (ctx) ->
    marker ctx, this

  vec_params.arrowOn = (ctx, center, color) ->
    color = "white"  unless color
    ctx.fillStyle = color
    ctx.strokeStyle = color
    center = xy(0, 0)  unless center
    line ctx, center, this
    arrowhead1 = rth(-5, @th)
    arrowhead1.rotate radians(20)
    arrowhead1.add this
    arrowhead2 = rth(-5, @th)
    arrowhead2.rotate radians(-20)
    arrowhead2.add this
    ctx.beginPath()
    ctx.moveTo arrowhead1.x, arrowhead1.y
    ctx.lineTo @x, @y
    ctx.lineTo arrowhead2.x, arrowhead2.y
    ctx.fill()

  vec_params.mode = mode  if mode and not vec_params.mode
  if vec_params.x? and vec_params.y?
    vec_params._set_xy vec_params.x, vec_params.y, true
    vec_params.mode = modes.xy  unless vec_params.mode
  else if vec_params.r? and vec_params.th?
    vec_params.th = mod(vec_params.th, 2 * Math.PI)
    vec_params._set_rth vec_params.r, vec_params.th, true
    vec_params.mode = modes.rth  unless vec_params.mode
  else
    throw "argument error: a vector must be constructed with a complete set of coordinates."
  vec_params
xy = (x, y, constant) ->
  vector
    x: x
    y: y
    constant: constant

rth = (r, th, constant) ->
  vector
    r: r
    th: th
    constant: constant


# Comparative operators
equals = (v1, v2) ->
  v1.x is v2.x and v1.y is v2.y

# Additive operators
neg = (v) ->
  xy -v.x, -v.y
add = (v1, v2) ->
  xy v1.x + v2.x, v1.y + v2.y
subtract = (v1, v2) ->
  xy v1.x - v2.x, v1.y - v2.y
xshift = (v, x) ->
  xy v.x + x, v.y
yshift = (v, y) ->
  xy v.x, v.y + y
xyshift = (v, x, y) ->
  xy v.x + x, v.y + y

# Multiplicative operators
scale = (v, c) ->
  xy v.x * c, v.y * c
xreflect = (v) ->
  xy -v.x, v.y
yreflect = (v) ->
  xy v.x, -v.y
xy_inv = (v) ->
  xy 1 / v.x, 1 / v.y
dot = (vectors) ->
  
  # TODO: generalize this so that it will take a list OR multiple arguments.
  # TODO: also, make it recursive.
  x = 1
  y = 1
  i = 0

  while i < arguments_.length
    x *= arguments_[i].x
    y *= arguments_[i].y
    i++
  xy x, y

# Other operations
rotate = (v, radians) ->
  rth v.r, v.th + radians
distance = (v1, v2) ->
  Math.abs v1.r - v2.r
midpoint = (v1, v2) ->
  scale add(v1, v2), 0.5

# Specific vectors (constants)
# Unit vectors
# x direction
# y direction
# r direction (depends on angle)
# theta direction (depends on angle)
randXY = (v1, v2) ->
  return xy(Math.random() * v1.x, Math.random() * v1.y)  unless v2?
  xy v1.x + Math.random() * (v2.x - v1.x), v1.y + Math.random() * (v2.y - v1.y)
randAngle = (r, th1, th2) ->
  if not th1? and not th2?
    th1 = 0
    th2 = Math.PI * 2
  else unless th2?
    th2 = th1
    th1 = 0
  rth r, th1 + Math.random() * (th2 - th1)

# Convert between degrees and radians
radians = (deg) ->
  2 * Math.PI * deg / 360
degrees = (rad) ->
  360 * rad / (2 * Math.PI)

# This is a better mod function. (returns x mod n)
# Javascript mod:  -1 % n     ==>  1
# This function:   mod(-1, n) ==>  n-1
mod = (x, n) ->
  n * (x / n - Math.floor(x / n))
vmod = (v, n) ->
  xy mod(v.x, n.x), mod(v.y, n.y)

# Wrapper for Math.round
round = (x, decimals) ->
  decimals = 0  unless decimals?
  Math.round(x * Math.pow(10, decimals)) / Math.pow(10, decimals)

# This applies the round function to the X and Y coords of a vector
vround = (v, decimals) ->
  xy round(v.x, decimals), round(v.y, decimals)
modes =
  xy: ["xy", "x", "y"]
  rth: ["rθ", "r", "th"]

vzero = xy(0, 0, true)
vunit =
  x: xy(1, 0, true)
  y: xy(0, 1, true)
  r: (th) ->
    xy Math.cos(th), Math.sin(th), true

  th: (th) ->
    xy -Math.sin(th), Math.cos(th), true

normalize = (v, r) ->
  r = 1  unless r?
  return rth(r, v.th)
  s
