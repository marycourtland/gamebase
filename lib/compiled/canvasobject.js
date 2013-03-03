(function() {
  var Actuateable, CanvasObject, Handleable, Launchable, Navigateable, bindClick, bindKey, num_canvas_objects,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CanvasObject = (function() {

    function CanvasObject(ctx, pos, points, id) {
      this.showImages = __bind(this.showImages, this);
      this.tick = __bind(this.tick, this);
      this.isNear = __bind(this.isNear, this);
      this.distanceTo = __bind(this.distanceTo, this);
      this.contains = __bind(this.contains, this);
      this.getPoint = __bind(this.getPoint, this);
      this.rotateTo = __bind(this.rotateTo, this);
      this.rotate = __bind(this.rotate, this);
      this.move = __bind(this.move, this);
      this.draw = __bind(this.draw, this);
      this.getPos = __bind(this.getPos, this);      window.num_canvas_objects++;
      this.id = id || ("obj" + (num_canvas_objects - 1));
      this.ctx = ctx;
      this.points = points;
      this.pos = pos;
      this.rotation = 0;
      this.graphics = {
        color: "black",
        lineWidth: 2
      };
      this.tickActions = [];
      if (this.ctx.canvas.objects != null) {
        this.ctx.canvas.objects.push(this);
      } else {
        this.ctx.canvas.objects = [this];
      }
    }

    CanvasObject.prototype.getPos = function() {
      return this.pos;
    };

    CanvasObject.prototype.draw = function() {
      var c0, c1, i;
      this.pos.add(xy(0.5, 0.5));
      this.ctx.lineWidth = 0;
      this.ctx.strokeStyle = this.graphics.color;
      this.ctx.fillStyle = this.graphics.outline_color || this.graphics.color;
      this.ctx.beginPath();
      this.ctx.moveTo(this.pos.x + this.points[0].x, this.pos.y + this.points[0].y);
      c0 = null;
      c1 = null;
      i = 1;
      while (i < this.points.length) {
        if (!this.points[i].length) {
          if (c0 && c1) {
            this.ctx.bezierCurveTo(this.pos.x + c0.x, this.pos.y + c0.y, this.pos.x + c1.x, this.pos.y + c1.y, this.pos.x + this.points[i].x, this.pos.y + this.points[i].y);
          } else {
            this.ctx.lineTo(this.pos.x + this.points[i].x, this.pos.y + this.points[i].y);
          }
          c0 = null;
          c1 = null;
        } else {
          c0 = this.points[i][0];
          c1 = this.points[i][1];
        }
        i++;
      }
      this.ctx.lineTo(this.pos.x + this.points[0].x, this.pos.y + this.points[0].y);
      this.ctx.stroke();
      this.ctx.fill();
      this.ctx.closePath();
      return this.pos.subtract(xy(0.5, 0.5));
    };

    CanvasObject.prototype.move = function(displacement) {
      this.pos.add(displacement);
      return this.pos.round(1);
    };

    CanvasObject.prototype.rotate = function(degrees) {
      var i, rad;
      rad = radians(degrees);
      i = 0;
      while (i < this.points.length) {
        if (this.points[i].length) {
          this.points[i][0].rotate(rad);
          this.points[i][1].rotate(rad);
        } else {
          this.points[i].rotate(rad);
        }
        i++;
      }
      return this.rotation += degrees;
    };

    CanvasObject.prototype.rotateTo = function(degrees) {
      this.rotate(-this.rotation);
      return this.rotate(degrees);
    };

    CanvasObject.prototype.getPoint = function(i) {
      if (i >= this.points.length) {
        throw "out of bounds: " + i + " > " + (this.points.length - 1);
      }
      return add(this.points[i], this.pos);
    };

    CanvasObject.prototype.contains = function(p) {
      var a1, a2, angle, angles, i;
      angle = 0;
      angles = [];
      i = 0;
      while (i < this.points.length) {
        angles.push(mod(add(this.getPoint(i), neg(p)).th, 360));
        i++;
      }
      angles.sort(function(a1, a2) {
        return a1 - a2;
      });
      i = 1;
      while (i < this.points.length) {
        a1 = angles[i - 1];
        a2 = angles[i];
        if (a2 - a1 > Math.PI) {
          return false;
        }
        i++;
      }
      return 2 * Math.PI - angles[this.points.length - 1] + angles[0] <= Math.PI;
    };

    CanvasObject.prototype.distanceTo = function(obj) {
      return Math.abs(subtract(this.pos, obj.pos).r);
    };

    CanvasObject.prototype.isNear = function(obj, radius) {
      if (radius == null) {
        radius = 30;
      }
      return this.distanceTo(obj) <= radius;
    };

    CanvasObject.prototype.onclick = null;

    CanvasObject.prototype.ondrag = null;

    CanvasObject.prototype.onmousedown = null;

    CanvasObject.prototype.onmouseup = null;

    CanvasObject.prototype.tick = function() {
      var i;
      i = 0;
      while (i < this.tickActions.length) {
        this.tickActions[i].call(this);
        i++;
      }
      return this.pos.y > 400;
    };

    CanvasObject.prototype.showImages = function(images, keep_shape) {
      var _this = this;
      if (!isArray(images)) {
        images = [images];
      }
      if (keep_shape != null) {
        this.draw_shape = this.draw;
      }
      if (this.images(this.images.extend(images))) {

      } else {
        this.images = images;
      }
      return this.draw = function() {
        var i, img, offset, _results;
        if (keep_shape != null) {
          _this.draw_shape();
        }
        i = 0;
        _results = [];
        while (i < _this.images.length) {
          if (_this.images[i].length && _this.images[i].length > 0) {
            img = _this.images[i][0];
            if (_this.images[i].length >= 2) {
              offset = _this.images[i][1];
            } else {
              offset = xy(0, 0);
            }
          } else {
            img = _this.images[i];
            offset = xy(0, 0);
          }
          _this.ctx.drawImage(img, round(_this.pos.x + offset.x, 0), round(_this.pos.y + offset.y, 0));
          _results.push(i++);
        }
        return _results;
      };
    };

    return CanvasObject;

  })();

  Actuateable = (function(_super) {

    __extends(Actuateable, _super);

    function Actuateable() {
      this.unfreeze = __bind(this.unfreeze, this);
      this.freeze = __bind(this.freeze, this);
      this.ignore = __bind(this.ignore, this);
      this.obey = __bind(this.obey, this);
      this.addTickActions = __bind(this.addTickActions, this);
      this.getVelocity = __bind(this.getVelocity, this);      Actuateable.__super__.constructor.apply(this, arguments);
      this.is_dynamic = true;
      this.velocity = xy(0, 0);
      this.frozen = false;
      this.forces = {};
      this.addTickActions();
    }

    Actuateable.prototype.getVelocity = function() {
      return this.velocity;
    };

    Actuateable.prototype.addTickActions = function() {
      var _this = this;
      this.tickActions.push(function() {
        var i, type, _results;
        if (_this.frozen) {
          return;
        }
        _results = [];
        for (i in _this.forces) {
          if (!_this.forces[i]) {
            continue;
          }
          type = _this.forces[i].type;
          if (type.length >= 4 && type.slice(0, 4) === "temp") {
            _this.forces[i].countdown -= 0;
            if (_this.forces[i].countdown < 0) {
              continue;
            }
            type = type.replace("temp ", "");
          }
          if (type === "effect") {
            _results.push(_this.forces[i].at(_this));
          } else if (type === "acceleration") {
            _results.push(_this.velocity.add(_this.forces[i].at(_this)));
          } else {
            if (type === "velocity") {
              _results.push(_this.move(_this.forces[i].at(_this)));
            } else {
              _results.push(void 0);
            }
          }
        }
        return _results;
      });
      return this.tickActions.push(function() {
        if (_this.frozen) {
          return;
        }
        return _this.move(obj.velocity);
      });
    };

    Actuateable.prototype.obey = function(id, vectorfield) {
      return this.forces[id] = vectorfield;
    };

    Actuateable.prototype.ignore = function(id) {
      if (!(id in this.forces)) {
        return;
      }
      return delete this.forces[id];
    };

    Actuateable.prototype.freeze = function() {
      return this.frozen = true;
    };

    Actuateable.prototype.unfreeze = function() {
      return this.frozen = false;
    };

    return Actuateable;

  })(CanvasObject);

  Handleable = (function(_super) {

    __extends(Handleable, _super);

    function Handleable() {
      this.onmouseup = __bind(this.onmouseup, this);
      this.ondrag = __bind(this.ondrag, this);
      this.onmousedown = __bind(this.onmousedown, this);      this.is_handled = true;
    }

    Handleable.prototype.onmousedown = function() {
      if (this.is_dynamic) {
        return this.freeze();
      }
    };

    Handleable.prototype.ondrag = function() {
      return this.move(mouse.velocity);
    };

    Handleable.prototype.onmouseup = function() {
      if (this.is_dynamic) {
        return this.unfreeze();
      }
    };

    return Handleable;

  })(CanvasObject);

  Launchable = (function(_super) {

    __extends(Launchable, _super);

    function Launchable() {
      this.onmouseup = __bind(this.onmouseup, this);      this.is_launchable = true;
    }

    Launchable.prototype.onmouseup = function() {
      if (this.is_dynamic) {
        this.velocity.add(mouse.velocity);
        return this.unfreeze();
      }
    };

    return Launchable;

  })(Handleable);

  Navigateable = (function(_super) {

    __extends(Navigateable, _super);

    function Navigateable() {
      this.addTickActions = __bind(this.addTickActions, this);
      Navigateable.__super__.constructor.apply(this, arguments);
    }

    Navigateable.prototype.construct = function(keydirs, speed, freeze) {
      this.speed = speed;
      this.is_navigated = true;
      this.navigation = [];
      if (!this.speed) {
        this.speed = 3;
      }
      return this.addTickActions();
    };

    Navigateable.prototype.addTickActions = function() {
      var _this = this;
      this.tickActions.push(function() {
        var dx, i;
        if (_this.navigation.length === 0) {
          return;
        }
        dx = xy(0, 0);
        i = 0;
        while (i < _this.navigation.length) {
          if (_this.navigation[i] === "left") {
            dx.add(xy(-1, 0));
          }
          if (_this.navigation[i] === "right") {
            dx.add(xy(1, 0));
          }
          if (_this.navigation[i] === "up") {
            dx.add(xy(0, -1));
          }
          if (_this.navigation[i] === "down") {
            dx.add(xy(0, 1));
          }
          i++;
        }
        dx.normalize(_this.speed);
        return _this.move(dx);
      });
      window.addEventListener("keydown", (function(event) {
        var i, key;
        key = getKeyFromEvent(event);
        if (key in keydirs) {
          i = 0;
          while (i < _this.navigation.length) {
            if (_this.navigation[i] === keydirs[key]) {
              return;
            }
            i++;
          }
          _this.navigation.push(keydirs[key]);
          if (_this.is_dynamic && _this.freeze) {
            return _this.freeze();
          }
        }
      }), false);
      return window.addEventListener("keyup", function(event) {
        var key;
        key = getKeyFromEvent(event);
        if (_this.navigation.indexOf(keydirs[key]) !== -1) {
          _this.navigation.splice(_this.navigation.indexOf(keydirs[key]), 1);
        }
        if (_this.navigation.length === 0 && _this.unfreeze) {
          return _this.unfreeze();
        }
      });
    };

    return Navigateable;

  })(CanvasObject);

  bindClick = function(obj, callback) {
    obj.onclick = callback;
    return obj;
  };

  bindKey = function(obj, key, callback) {
    window.addEventListener("keypress", function(event) {
      if (getKeyFromEvent(event) === key) {
        return callback(event);
      }
    });
    return obj;
  };

  num_canvas_objects = 0;

}).call(this);
