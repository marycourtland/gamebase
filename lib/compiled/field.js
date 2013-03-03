(function() {
  var Field, dynamic_reflecting_surfaces, field, field_constant, field_inverse_square, field_linear, goToDestination, heldBy, leaveDestination, oscillation, random_turns, random_turns_with_pauses, random_walk, reflecting_boundary, reflecting_surfaces, solid_object_surfaces, springforce, superpose;

  Field = (function() {

    function Field(type, at_func) {
      if (arguments.length === 1) {
        this.at_func = type;
        this.type = "effect";
      }
    }

    Field.prototype.at = Field.at_func;

    Field.prototype.type = Field.type;

    Field.prototype.display = function(ctx, spacing) {
      var pos, _results;
      pos = xy(0.5, 0.5);
      _results = [];
      while (pos.y <= ctx.canvas.height) {
        _results.push((function() {
          var _results1;
          _results1 = [];
          while (pos.x <= ctx.canvas.width) {
            _results1.push(pos.marker(ctx));
          }
          return _results1;
        })());
      }
      return _results;
    };

    return Field;

  })();

  field = function(type, at_func) {
    return {
      display: function(ctx, spacing) {
        var pos, _results;
        pos = xy(0.5, 0.5);
        _results = [];
        while (pos.y <= ctx.canvas.height) {
          while (pos.x <= ctx.canvas.width) {
            pos.marker(ctx);
            line(ctx, pos, add(pos, this.at(pos)));
            pos.xshift(spacing);
          }
          pos.yshift(spacing);
          _results.push(pos.x = 0.5);
        }
        return _results;
      },
      condition: function(condition_func) {
        at_func = this.at;
        this.at = function(obj) {
          if (!condition_func(obj)) {
            return xy(0, 0);
          }
          return at_func(obj);
        };
        return this;
      },
      bound: function(boundary_values) {
        var cond_func, pos, radius;
        this.boundaries = boundary_values;
        if ((this.boundaries.radius != null) && (this.boundaries.pos != null)) {
          radius = this.boundaries.radius;
          pos = this.boundaries.pos;
          cond_func = function() {
            return subtract(obj.pos, pos).r > radius;
          };
        } else {
          cond_func = function(obj) {
            return ((this.boundaries.xmin == null) || obj.pos.x > this.boundaries.xmin) && ((this.boundaries.xmax == null) || obj.pos.x > this.boundaries.xmax) && ((this.boundaries.ymin == null) || obj.pos.y > this.boundaries.ymin) && ((this.boundaries.ymax == null) || obj.pos.y > this.boundaries.ymax);
          };
        }
        this.condition(cond_func);
        return this;
      }
    };
  };

  field_constant = function(v) {
    var vf;
    vf = field("acceleration", null);
    vf.at = function(obj) {
      return v;
    };
    return vf;
  };

  field_linear = function(v0, delta) {
    var vf;
    vf = field(function(obj) {
      return add(v0, dot(obj.pos, delta));
    });
    vf.type = "acceleration";
    return vf;
  };

  field_inverse_square = function(center, params) {
    var vf;
    params = (params ? params : {});
    params.scale = (params.scale ? params.scale : 1);
    vf = field(function(obj) {
      var dist;
      dist = subtract(center, obj.pos);
      return rth(params.scale / (dist.r * dist.r), mod(dist.th, Math.PI * 2));
    });
    vf.type = "acceleration";
    return vf;
  };

  reflecting_boundary = function(boundary_values) {
    var vf;
    vf = field("effect", null);
    vf.vals = boundary_values;
    vf.at = function(obj) {
      if ((this.vals.xmin != null) && obj.pos.x <= this.vals.xmin && obj.velocity.x < 0) {
        obj.velocity.xreflect();
      }
      if ((this.vals.xmax != null) && obj.pos.x >= this.vals.xmax && obj.velocity.x > 0) {
        obj.velocity.xreflect();
      }
      if ((this.vals.ymin != null) && obj.pos.y <= this.vals.ymin && obj.velocity.y < 0) {
        obj.velocity.yreflect();
      }
      if ((this.vals.ymax != null) && obj.pos.y >= this.vals.ymax && obj.velocity.y > 0) {
        return obj.velocity.yreflect();
      }
    };
    return vf;
  };

  reflecting_surfaces = function(boundary_values) {
    var vf;
    vf = field(function(obj) {
      return vzero;
    });
    vf.type = "effect";
    vf.left = boundary_values.left;
    vf.right = boundary_values.right;
    vf.top = boundary_values.top;
    vf.bottom = boundary_values.bottom;
    if ((vf.left == null) || (vf.right == null) || (vf.top == null) || (vf.bottom == null)) {
      return vf;
    }
    vf.at = function(obj) {
      var d, min_dist, wall_distances;
      wall_distances = {
        top: obj.pos.y - this.top,
        bottom: this.bottom - obj.pos.y,
        left: obj.pos.x - this.left,
        right: this.right - obj.pos.x
      };
      for (d in wall_distances) {
        if (wall_distances[d] < 0) {
          return vzero;
        }
      }
      min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right);
      if (min_dist === wall_distances.top && obj.velocity.y > 0) {
        obj.velocity.yreflect();
      }
      if (min_dist === wall_distances.bottom && obj.velocity.y < 0) {
        obj.velocity.yreflect();
      }
      if (min_dist === wall_distances.right && obj.velocity.x < 0) {
        obj.velocity.xreflect();
      }
      if (min_dist === wall_distances.left && obj.velocity.x > 0) {
        obj.velocity.xreflect();
      }
      return vzero;
    };
    return vf;
  };

  dynamic_reflecting_surfaces = function(obj, boundary_values) {
    var vf;
    if (boundary_values == null) {
      boundary_values = obj;
      obj = null;
    }
    vf = field("effect", function(obj) {
      return vzero;
    });
    vf.left = boundary_values.left;
    vf.right = boundary_values.right;
    vf.top = boundary_values.top;
    vf.bottom = boundary_values.bottom;
    if ((vf.left == null) || (vf.right == null) || (vf.top == null) || (vf.bottom == null)) {
      return vf;
    }
    vf.at = function(obj) {
      var d, min_dist, wall_distances;
      wall_distances = {
        top: obj.pos.y - this.top(),
        bottom: this.bottom() - obj.pos.y,
        left: obj.pos.x - this.left(),
        right: this.right() - obj.pos.x
      };
      if (this.print && game.frame % 30 === 0) {
        console.log(wall_distances);
      }
      for (d in wall_distances) {
        if (wall_distances[d] < 0) {
          return;
        }
      }
      min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right);
      if (min_dist === wall_distances.top && obj.velocity.y > 0) {
        obj.velocity.yreflect();
      }
      if (min_dist === wall_distances.bottom && obj.velocity.y < 0) {
        obj.velocity.yreflect();
      }
      if (min_dist === wall_distances.right && obj.velocity.x < 0) {
        obj.velocity.xreflect();
      }
      if (min_dist === wall_distances.left && obj.velocity.x > 0) {
        return obj.velocity.xreflect();
      }
    };
    return vf;
  };

  solid_object_surfaces = function(solid_obj, boundary_values) {
    var vf;
    solid_obj.bvals = boundary_values;
    vf = field("effect", null);
    vf.obj = solid_obj;
    vf.top = function() {
      return this.obj.pos.y + this.obj.bvals.top;
    };
    vf.bottom = function() {
      return this.obj.pos.y + this.obj.bvals.bottom;
    };
    vf.left = function() {
      return this.obj.pos.x + this.obj.bvals.left;
    };
    vf.right = function() {
      return this.obj.pos.x + this.obj.bvals.right;
    };
    vf.at = function(obj) {
      var d, dir, i, min_dist, vec, wall_distances, _results;
      wall_distances = {
        top: obj.pos.y - this.top(),
        bottom: this.bottom() - obj.pos.y,
        left: obj.pos.x - this.left(),
        right: this.right() - obj.pos.x
      };
      for (d in wall_distances) {
        if (wall_distances[d] < 0) {
          return;
        }
      }
      min_dist = Math.min(wall_distances.top, wall_distances.bottom, wall_distances.left, wall_distances.right);
      vec = xy(0, 0);
      if (obj.is_navigated) {
        if (min_dist === wall_distances.top) {
          dir = "up";
          vec = xy(0, -min_dist - 1);
        }
        if (min_dist === wall_distances.bottom) {
          dir = "down";
          vec = xy(0, min_dist + 1);
        }
        if (min_dist === wall_distances.right) {
          dir = "right";
          vec = xy(min_dist + 1, 0);
        }
        if (min_dist === wall_distances.left) {
          dir = "left";
          vec = xy(-min_dist - 1, 0);
        }
        obj.move(vec);
        i = 0;
        _results = [];
        while (i < obj.navigation.length) {
          if (game.frame % 150 === 0 && obj.id === "grownup") {
            console.log(vec + "", dir, obj.navigation[i]);
          }
          if (obj.navigation[i] !== dir) {
            obj.navigation.splice(i, 1);
          }
          _results.push(i++);
        }
        return _results;
      } else {
        if (min_dist === wall_distances.top && obj.velocity.y > 0) {
          obj.velocity.yreflect();
        }
        if (min_dist === wall_distances.bottom && obj.velocity.y < 0) {
          obj.velocity.yreflect();
        }
        if (min_dist === wall_distances.right && obj.velocity.x < 0) {
          obj.velocity.xreflect();
        }
        if (min_dist === wall_distances.left && obj.velocity.x > 0) {
          return obj.velocity.xreflect();
        }
      }
    };
    return vf;
  };

  goToDestination = function(scale_factor) {
    return field("velocity", function(obj) {
      if (!obj.getDestination) {
        return xy(0, 0);
      }
      if (equals(obj.pos, obj.getDestination())) {
        return xy(0, 0);
      }
      return scale(subtract(obj.getDestination(), obj.pos), scale_factor);
    });
  };

  leaveDestination = function(scale_factor) {
    return field("velocity", function(obj) {
      if (!obj.getDestination) {
        return xy(0, 0);
      }
      return scale(subtract(obj.pos, obj.getDestination()), scale_factor);
    });
  };

  springforce = function(center, k) {
    var vf;
    vf = field("acceleration", null);
    vf.k = k;
    vf.center = xy(center.x, center.y);
    vf.at = function(obj) {
      return scale(subtract(this.center, obj.pos), this.k);
    };
    return vf;
  };

  oscillation = function(frequency, amplitude) {
    var vf;
    vf = field("acceleration", null);
    vf.t0 = getTime();
    vf.amp = amplitude;
    vf.freq = frequency;
    vf.at = function(obj) {
      var t;
      t = (getTime() - this.t0) / 1000;
      console.log(t, Math.cos(2 * Math.PI * this.freq * t), scale(this.amp * 2 * Math.PI * this.freq, Math.cos(2 * Math.PI * this.freq * t)) + "");
      return scale(this.amp * 2 * Math.PI * this.freq, Math.cos(2 * Math.PI * this.freq * t));
    };
    vf.f0 = game.frame;
    return vf;
  };

  heldBy = function(holder, offset) {
    var vf;
    vf = field("effect", function(item) {
      return item.pos = add(offset, holder.getPos());
    });
    return vf;
  };

  random_walk = function(max_speed) {
    return field("velocity", function(obj) {
      if (obj.is_dynamic) {
        return randAngle(Math.random() * max_speed);
      }
      return xy(0, 0);
    });
  };

  random_turns = function(interval, angle1, angle2) {
    var angle_width;
    if (angle1 == null) {
      angle_width = Math.PI * 2;
    } else if (angle2 == null) {
      angle_width = angle1;
    } else {
      angle_width = angle2 - angle1;
    }
    return field("effect", function(obj) {
      var da;
      if (obj.is_dynamic && mod(game.frame, interval) === 0) {
        da = Math.random() * angle_width;
        if (Math.random() < 0.5) {
          da *= -1;
        }
        return obj.velocity.rotate(da);
      }
    });
  };

  random_turns_with_pauses = function(interval, pause, pause_width, angle1, angle2) {
    var angle_width, vf;
    if (angle1 == null) {
      angle_width = Math.PI * 2;
    } else if (angle2 == null) {
      angle_width = angle1;
    } else {
      angle_width = angle2 - angle1;
    }
    vf = field("effect", null);
    vf.pause = pause + Math.random() * pause_width;
    return vf.at = function(obj) {
      var da;
      if (obj.is_dynamic) {
        if (!obj._velocity) {
          obj._velocity = obj.velocity;
        }
        if (mod(game.frame, interval + this.pause) > interval) {
          obj.velocity = xy(0, 0);
        }
        if (mod(game.frame, interval + this.pause) === 0) {
          this.pause = pause + Math.random() * pause_width;
          da = Math.random() * angle_width;
          if (Math.random() < 0.5) {
            da *= -1;
          }
          obj.velocity = obj._velocity;
          obj.velocity.rotate(da);
          return obj._velocity = obj.velocity;
        }
      }
    };
  };

  superpose = function(vf1, vf2) {
    var vf;
    vf = field(null, null);
    vf.type = vf1.type;
    vf.f1 = vf1;
    vf.f2 = vf2;
    return vf.at = function(obj) {
      var at1, at2;
      at1 = this.f1.at(obj);
      at2 = this.f2.at(obj);
      if (this.f2.type !== this.type) {
        if (this.f2.type === "velocity") {
          obj.move(at2);
        }
        if (this.f2.type === "acceleration") {
          obj.velocity.add(at2);
        }
        return at1;
      }
      if (this.type !== "effect") {
        return add(at1, at2);
      }
    };
  };

}).call(this);
