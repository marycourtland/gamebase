(function() {
  var Character,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Character = (function(_super) {

    __extends(Character, _super);

    function Character() {
      this.draw = __bind(this.draw, this);
      this.say = __bind(this.say, this);
      this.switchHands = __bind(this.switchHands, this);
      this.drops = __bind(this.drops, this);
      this.holds = __bind(this.holds, this);      this.inventory = [];
    }

    Character.prototype.holds = function(item, offset) {
      if (offset == null) {
        offset = xy(-20, 0);
      }
      item.hold_offset = offset;
      item.ignore("held");
      item.obey("held", heldBy(obj, offset));
      return this.inventory.push(item);
    };

    Character.prototype.drops = function(item, relocation) {
      if (this.inventory.indexOf(item) === -1) {
        return;
      }
      item.ignore("held");
      this.inventory.splice(this.inventory.indexOf(item), 1);
      if (relocation != null) {
        return item.move(relocation);
      }
    };

    Character.prototype.switchHands = function() {
      if (this.inventory.length === 0) {
        return;
      }
      this.inventory[0].hold_offset.xreflect();
      this.inventory[0].ignore("held");
      return this.inventory[0].obey("held", heldBy(obj, this.inventory[0].hold_offset));
    };

    Character.prototype.comment = null;

    Character.prototype.commentOffset = null;

    Character.prototype.say = function(txt, offset) {
      var duration;
      duration = 2;
      this.comment = txt;
      this.comment_offset = (offset ? offset : xy(25, -5));
      return setTimeout((function() {
        return this.comment = null;
      }), duration * 1000);
    };

    Character.prototype.draw_before_comment = obj.draw;

    Character.prototype.draw = function() {
      this.draw_before_comment();
      if (this.comment != null) {
        newFontSize(12);
        text(this.comment, add(this.pos, this.comment_offset), "sw");
        return newFontSize(20);
      }
    };

    return Character;

  })(CanvasObject);

}).call(this);
