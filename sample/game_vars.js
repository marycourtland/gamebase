var game = {
  title: "Sample game!",
  canvas: document.getElementById("game"),
  ctx: document.getElementById("game").getContext("2d"),
  frame: 0,
  fps: 60,
  objects: [],
  bg_color: 'black',
  size: xy(600,400),
  tilesize: xy(20,20),
  font: {size: 20, type: 'Arial'}
}
