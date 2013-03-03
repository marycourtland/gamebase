(function() {
  var add, degrees, distance, dot, equals, midpoint, mod, modes, neg, normalize, radians, randAngle, randXY, rotate, round, rth, scale, subtract, vector, vmod, vround, vunit, vzero, xreflect, xshift, xy, xy_inv, xyshift, yreflect, yshift;

  vector = function(vec_params, mode) {
    vec_params._set_rth = function(r, th, override_constant) {
      if (this.constant && !override_constant) {
        return;
      }
      this.r = r;
      this.th = mod(th, 2 * Math.PI);
      return this._update_xy(override_constant);
    };
    vec_params._set_xy = function(x, y, override_constant) {
      if (this.constant && !override_constant) {
        return;
      }
      this.x = x;
      this.y = y;
      return this._update_rth(override_constant);
    };
    vec_params._update_rth = function(override_constant) {
      if (this.constant && !override_constant) {
        return;
      }
      this.r = Math.sqrt(this.x * this.x + this.y * this.y);
      return this.th = mod(Math.atan2(this.y, this.x), 2 * Math.PI);
    };
    vec_params._update_xy = function(override_constant) {
      if (this.constant && !override_constant) {
        return;
      }
      this.x = this.r * Math.cos(this.th);
      return this.y = this.r * Math.sin(this.th);
    };
    vec_params.add = function(v) {
      this._set_xy(this.x + v.x, this.y + v.y);
      return this;
    };
    vec_params.subtract = function(v) {
      this._set_xy(this.x - v.x, this.y - v.y);
      return this;
    };
    vec_params.neg = function() {
      this._set_rth(-this.r, this.th);
      return this;
    };
    vec_params.xshift = function(dx) {
      this._set_xy(this.x + dx, this.y);
      return this;
    };
    vec_params.yshift = function(dy) {
      this._set_xy(this.x, this.y + dy);
      return this;
    };
    vec_params.normalize = function(r) {
      if (r == null) {
        r = 1;
      }
      return this._set_rth(r, this.th);
    };
    vec_params.scale = function(c) {
      this._set_rth(this.r * c, this.th);
      return this;
    };
    vec_params.rotate = function(radians) {
      this._set_rth(this.r, this.th + radians);
      return this;
    };
    vec_params.xreflect = function() {
      this._set_xy(this.x * -1, this.y);
      return this;
    };
    vec_params.yreflect = function() {
      this._set_xy(this.x, this.y * -1);
      return this;
    };
    vec_params.round = function(decimals) {
      return this._set_xy(round(this.x, decimals), round(this.y, decimals), true);
    };
    vec_params.toString = function() {
      return this.mode[0] + "(" + vec_params[vec_params.mode[1]] + "," + vec_params[vec_params.mode[2]] + ")";
    };
    vec_params.copy = function() {
      return xy(this.x, this.y);
    };
    vec_params.marker = function(ctx) {
      return marker(ctx, this);
    };
    vec_params.arrowOn = function(ctx, center, color) {
      var arrowhead1, arrowhead2;
      if (!color) {
        color = "white";
      }
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      if (!center) {
        center = xy(0, 0);
      }
      line(ctx, center, this);
      arrowhead1 = rth(-5, this.th);
      arrowhead1.rotate(radians(20));
      arrowhead1.add(this);
      arrowhead2 = rth(-5, this.th);
      arrowhead2.rotate(radians(-20));
      arrowhead2.add(this);
      ctx.beginPath();
      ctx.moveTo(arrowhead1.x, arrowhead1.y);
      ctx.lineTo(this.x, this.y);
      ctx.lineTo(arrowhead2.x, arrowhead2.y);
      return ctx.fill();
    };
    if (mode && !vec_params.mode) {
      vec_params.mode = mode;
    }
    if ((vec_params.x != null) && (vec_params.y != null)) {
      vec_params._set_xy(vec_params.x, vec_params.y, true);
      if (!vec_params.mode) {
        vec_params.mode = modes.xy;
      }
    } else if ((vec_params.r != null) && (vec_params.th != null)) {
      vec_params.th = mod(vec_params.th, 2 * Math.PI);
      vec_params._set_rth(vec_params.r, vec_params.th, true);
      if (!vec_params.mode) {
        vec_params.mode = modes.rth;
      }
    } else {
      throw "argument error: a vector must be constructed with a complete set of coordinates.";
    }
    return vec_params;
  };

  xy = function(x, y, constant) {
    return vector({
      x: x,
      y: y,
      constant: constant
    });
  };

  rth = function(r, th, constant) {
    return vector({
      r: r,
      th: th,
      constant: constant
    });
  };

  equals = function(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y;
  };

  neg = function(v) {
    return xy(-v.x, -v.y);
  };

  add = function(v1, v2) {
    return xy(v1.x + v2.x, v1.y + v2.y);
  };

  subtract = function(v1, v2) {
    return xy(v1.x - v2.x, v1.y - v2.y);
  };

  xshift = function(v, x) {
    return xy(v.x + x, v.y);
  };

  yshift = function(v, y) {
    return xy(v.x, v.y + y);
  };

  xyshift = function(v, x, y) {
    return xy(v.x + x, v.y + y);
  };

  scale = function(v, c) {
    return xy(v.x * c, v.y * c);
  };

  xreflect = function(v) {
    return xy(-v.x, v.y);
  };

  yreflect = function(v) {
    return xy(v.x, -v.y);
  };

  xy_inv = function(v) {
    return xy(1 / v.x, 1 / v.y);
  };

  dot = function(vectors) {
    var i, x, y;
    x = 1;
    y = 1;
    i = 0;
    while (i < arguments_.length) {
      x *= arguments_[i].x;
      y *= arguments_[i].y;
      i++;
    }
    return xy(x, y);
  };

  rotate = function(v, radians) {
    return rth(v.r, v.th + radians);
  };

  distance = function(v1, v2) {
    return Math.abs(v1.r - v2.r);
  };

  midpoint = function(v1, v2) {
    return scale(add(v1, v2), 0.5);
  };

  randXY = function(v1, v2) {
    if (v2 == null) {
      return xy(Math.random() * v1.x, Math.random() * v1.y);
    }
    return xy(v1.x + Math.random() * (v2.x - v1.x), v1.y + Math.random() * (v2.y - v1.y));
  };

  randAngle = function(r, th1, th2) {
    if ((th1 == null) && (th2 == null)) {
      th1 = 0;
      th2 = Math.PI * 2;
    } else if (th2 == null) {
      th2 = th1;
      th1 = 0;
    }
    return rth(r, th1 + Math.random() * (th2 - th1));
  };

  radians = function(deg) {
    return 2 * Math.PI * deg / 360;
  };

  degrees = function(rad) {
    return 360 * rad / (2 * Math.PI);
  };

  mod = function(x, n) {
    return n * (x / n - Math.floor(x / n));
  };

  vmod = function(v, n) {
    return xy(mod(v.x, n.x), mod(v.y, n.y));
  };

  round = function(x, decimals) {
    if (decimals == null) {
      decimals = 0;
    }
    return Math.round(x * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  vround = function(v, decimals) {
    return xy(round(v.x, decimals), round(v.y, decimals));
  };

  modes = {
    xy: ["xy", "x", "y"],
    rth: ["rθ", "r", "th"]
  };

  vzero = xy(0, 0, true);

  vunit = {
    x: xy(1, 0, true),
    y: xy(0, 1, true),
    r: function(th) {
      return xy(Math.cos(th), Math.sin(th), true);
    },
    th: function(th) {
      return xy(-Math.sin(th), Math.cos(th), true);
    }
  };

  normalize = function(v, r) {
    if (r == null) {
      r = 1;
    }
    return rth(r, v.th);
    return s;
  };

}).call(this);
