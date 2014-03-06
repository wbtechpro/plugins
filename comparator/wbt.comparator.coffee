WBTComparator = ($this, params)->
  @$el = $this
  @direction = if params.direction not in ["vertical", "horizontal"] then "vertical" else params.direction
  @src = params.src
  @timeoutValue = if params.timeout? then params.timeout else 500
  @timeoutId = 0
  @initDelay = if params.initDelay? then params.initDelay else true

  @$el.addClass("wbt-comparator wbt-comparator__#{@direction}")
  @loadedImages = 0
  @isInitialized = false
  @imagesLoad()

  if @initDelay
    $(window).on "scroll", {"this": @}, @imagesInitIfVisible

WBTComparator::imagesLoad = ->
  self = @
  for source, id in @src
    $imageNew = $(new Image())
    @$el.append $imageNew
    $imageNew.addClass("wbt-comparator_image")
    if id is 0
      @imageBackground = $imageNew.wrap("<div class='wbt-comparator_wrap wbt-comparator_wrap__background'>").parent()
    else
      @imageOverlay = $imageNew.wrap("<div class='wbt-comparator_wrap wbt-comparator_wrap__overlay'>").parent()
    $imageNew.on "load", ->
      if ++self.loadedImages is 2
        if self.initDelay
          self.imagesInitIfVisible(data: {"this": self})
        else
          self.imagesInit()
      self.imageOverlay.css
        height: self.imageBackground.height()
        width: self.imageBackground.width()
    $imageNew.attr(src: source)

WBTComparator::imagesInit = ->
  self = @
  @isInitialized = true
  @imageOverlay.addClass("wbt-comparator_reset__#{this.direction}")

  @$el.on "mousemove touchmove",(e)->
    e.preventDefault()
    clearTimeout self.timeoutId
    self.imageOverlay.removeClass("wbt-comparator_reset__#{self.direction}")

    offset = self.imageBackground.offset()
    event = if e.type is "touchmove" then e.originalEvent.touches[0] else e

    if self.direction is "horizontal"
      self.imageOverlay.css "width", event.pageX - offset.left
    else
      self.imageOverlay.css "height", event.pageY - offset.top

  if @timeoutValue isnt false
    @$el.on "mouseleave touchend", ->
      self.timeoutId = setTimeout ->
        self.imageOverlay.addClass("wbt-comparator_reset__#{self.direction}")
      , self.timeoutValue

WBTComparator::imagesInitIfVisible = (e)->
  self = e.data["this"]
  return if self.isInitialized
  rect = self.$el[0].getBoundingClientRect()
#  if rect.top >= 0 and rect.left >= 0 and rect.bottom <= $(window).height() and rect.right <= $(window).width()
  self.imagesInit()

$.fn.wbtComparator = (params)->
  new WBTComparator(this, params)