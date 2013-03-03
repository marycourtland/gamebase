# Game-related
class Character extends CanvasObject
  constructor: ->
    @inventory = []
  
  holds: (item, offset) =>
    offset = xy(-20, 0)  unless offset?
    item.hold_offset = offset
    item.ignore "held"
    item.obey "held", heldBy(obj, offset)
    @inventory.push item

  drops: (item, relocation) =>
    return if @inventory.indexOf(item) is -1
    item.ignore "held"
    @inventory.splice @inventory.indexOf(item), 1
    item.move relocation if relocation?

  switchHands: =>
    return if @inventory.length is 0
    @inventory[0].hold_offset.xreflect()
    @inventory[0].ignore "held"
    @inventory[0].obey "held", heldBy(obj, @inventory[0].hold_offset)

  comment: null
  commentOffset: null
  say: (txt, offset) =>
    duration = 2
    @comment = txt
    @comment_offset = (if offset then offset else xy(25, -5))
    setTimeout (->
      @comment = null
    ), duration * 1000

  draw_before_comment: obj.draw
  draw: =>
    @draw_before_comment()
    if @comment?
      newFontSize 12
      text @comment, add(@pos, @comment_offset), "sw"
      newFontSize 20
