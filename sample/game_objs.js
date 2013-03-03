// Environment - custom object
environment = {
  id: "environment",
  tiles: {'o': images.grass, '.': images.dirt},
  map: [
    "oooo..oooooooooooooooooooooooo",
    "ooooo..ooooooooooooooooooooooo",
    "oooooo.......ooooooooooooooooo",
    "oooooooooooo.ooooooooooooooooo",
    "oooooooooooo.ooooooooooooooooo",
    "oooooooo.........ooooooooooooo",
    "oooooooo.........ooooooooooooo",
    "oooooooo.........ooooooooooooo",
    "oooooooo.........ooooooooooooo",
    "..............................",
    "oooooooo.........ooooooooooooo",
    "oooooooo.........ooooooooooooo",
    "oooooooo.........ooooooooooooo",
    "oooooooo.........ooooooooooooo",
    "oooooooooooo.ooooooooooooooooo",
    "oooooooooooo.ooooooooooooooooo",
    "oooooooooooo.ooooooooooooooooo",
    "oooooooooooo.ooooooooooooooooo",
    "oooooooooooo.ooooooooooooooooo",
    "oooooooooooo.ooooooooooooooooo"
  ],
  tick: function() {
  },
  draw: function() {
    for (var row=0; row < this.map.length; row++) {
      for (var col=0; col < this.map[0].length; col++) {
        this.drawTile(row, col);
      }
    }
  },
  drawTile: function(row, col) {
    var img = this.tiles[this.map[row].slice(col, col+1)];
    game.ctx.drawImage(img, col*game.tilesize.x, row*game.tilesize.y);
  }
}
game.objects.push(environment);

// Two more custom objects
start_sign = {
  id: "start sign",
  pos: xy(10, 140),
  img: images.startsign,
  tick: function() {},
  draw: function() {
    game.ctx.drawImage(this.img, this.pos.x, this.pos.y)
  }
}
end_sign = {
  id: "end sign",
  pos: xy(550, 140),
  img: images.endsign,
  tick: function() {},
  draw: function() {
    game.ctx.drawImage(this.img, this.pos.x, this.pos.y)
  }
}
game.objects.push(start_sign);
game.objects.push(end_sign);


// Player object - created with CanvasObject
matt = CanvasObject(game.ctx, xy(40, 110), [], "Matt");
showImages(matt, images.character);
navigate(matt, keydirs_lrud, 10);
game.objects.push(matt);

