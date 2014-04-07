###
wbt.rotator.js v1.0.3

Licensed under the MIT license.
http://opensource.org/licenses/mit-license.php

Dependencies: jQuery 1.7+

Basic usage:
$(".any-selector").wbtRotator({
frameSrc: "path/template/{{30}}.jpg"
});

For more instructions and examples, please visit http://wbtech.pro/blog/articles/rotator/

Copyright 2012, WBTech
http://wbtech.pro/
###
(($) ->
  WBTRotator = ($el, params) ->
    @cfg = $.extend({}, WBTRotator::defaults, params)
    @$el = $el.addClass("wbt-rotator")
    @$frames = $()
    @$frameCurrent = $()
    @frameCurrent = @cfg.frameFirst
    @frameCount = 0
    @frameLoadedCount = 0
    @frameSize =
      width: 0
      height: 0
    @pointerPressed = false
    @pointerPosition =
      x: 0
      y: 0

    return $.wbtError("Specify non empty rotator placeholder.") unless @$el.length
    return $.wbtError("Specify 'frameSrc' in $().wbtRotator() call.") if not @cfg.frameSrc or @cfg.frameSrc.length is 0

    # Dealing with template string
    @getFrameSrc()  if typeof @cfg.frameSrc is "string"
    @frameCount = @cfg.frameSrc.length
    @$loader = $("<span>&#9654;</span>").attr(class: "wbt-rotator-loader").appendTo(@$el)  if @cfg.showLoader
    @cfg.frameCover = @cfg.frameSrc[0]  unless @cfg.frameCover
    @loadCover()
    if @cfg.rotateManual
      if @cfg.cursor is "arrows"
        if @cfg.invertAxes
          @$el.addClass "wbt-rotator__vertical"
        else
          @$el.addClass "wbt-rotator__horizontal"
      else @$el.addClass "wbt-rotator__grab"  if @cfg.cursor is "grab"
    @loadImages()  if @cfg.autoLoad
    @$el.on "click.wbt-rotator", $.proxy(@loadImages, this)
    return

  WBTRotator::defaults =
    showLoader: true
    frameCover: "" # if not present, first frame taken
    frameSrc: ""
    frameFirst: 0
    leadingZero: true
    autoLoad: true
    rotateAuto: false
    rotateAutoSpeed: 100 # milliseconds per frame
    rotateManual: true # disable keyboard and mouse for rotation
    invertAxes: false # false: horizontal; true: vertical
    invertMouse: false # false: counter-clockwise; true: clockwise
    invertAutoRotate: false # false: counter-clockwise; true: clockwise
    enableMouseWheel: true
    cursor: "arrows"

  # TODO: User events support
  WBTRotator::registerEvents = ->
    @$el[0].addEventListener (if $.wbtIsTouch() then "touchstart" else "mousedown"), $.proxy(@onPointerDown, this)
    document.addEventListener (if $.wbtIsTouch() then "touchend" else "mouseup"), $.proxy(@onPointerUp, this)
    document.addEventListener (if $.wbtIsTouch() then "touchmove" else "mousemove"), $.proxy(@onPointerMove, this)
    @$el.on "mousewheel DOMMouseScroll", $.proxy(@onScroll, this)  if @cfg.enableMouseWheel
    if @cfg.rotateAuto
      @$el.on "mouseenter", $.proxy(@onPointerEnter, this)
      @$el.on "mouseleave", $.proxy(@onPointerLeave, this)
    return

  WBTRotator::getCoverSrc = ->

  WBTRotator::getFrameSrc = ->
    frameCount = parseInt(@cfg.frameSrc.replace(/.*{{|}}.*/g, "")) # Remove everything except contents between {{ and }}
    frameCountLength = ("" + frameCount).length
    frameIndex = 0
    frameIndexLength = 0
    frameSrc = []
    i = 0
    while i < frameCount
      frameIndex = i
      frameIndex = "0" + frameIndex  while frameIndexLength = ("" + frameIndex).length < frameCountLength  if @cfg.leadingZero
      frameSrc.push @cfg.frameSrc.replace(/{{.*}}/, frameIndex)
      i++
    @cfg.frameSrc = frameSrc
    return

  WBTRotator::loadCover = ->
    self = this
    @$cover = $("<img />")
    .attr(class: "wbt-rotator-cover", src: @cfg.frameCover, alt: "")
    .appendTo(@$el)
    .on("load", ->
      self.frameSize =
        width: self.$cover.width()
        height: self.$cover.height()
      self.$el.width(self.frameSize.width).height self.frameSize.height
      return
    )
    return

  WBTRotator::loadImages = ->
    # Avoid double initialization
    @$el.off("click.wbt-rotator").addClass "wbt-rotator__loading"
    self = this
    i = 0

    while i < @frameCount
      $("<img />").attr(
        class: "wbt-rotator-image"
        src: @cfg.frameSrc[i]
        alt: ""
      ).appendTo(@$el).on "load", (e) ->
        self.frameLoadedCount++
        self.loadImagesAnimation()
        if self.frameLoadedCount is 1 and not self.frameCover
          $this = $(this)
          self.frameSize =
            width: $this.width()
            height: $this.height()

          self.$el.width(self.frameSize.width).height self.frameSize.height
        self.loadImagesComplete()  if self.frameLoadedCount is self.frameCount
        return

      i++
    return

  WBTRotator::loadImagesAnimation = ->
    #        if(this.cfg.showLoader) {
    #        }

  WBTRotator::loadImagesComplete = ->
    @$el.removeClass("wbt-rotator__loading").addClass "wbt-rotator__loaded"
    @$frames = @$el.children(".wbt-rotator-image")
    @$frameCurrent = @$frames.eq(@frameCurrent).addClass("wbt-rotator-image__active")
    @registerEvents()
    @startAutoRotate()  if @cfg.rotateAuto
    return

  WBTRotator::onPointerDown = (e) ->
    (if (e.preventDefault) then e.preventDefault() else e.returnValue = false)
    @$el.addClass "wbt-rotator__active"
    @pointerPressed = true and @cfg.rotateManual
    @pointerPosition.x = e.pageX
    @pointerPosition.y = e.pageY
    return

  WBTRotator::onPointerUp = ->
    if @pointerPressed
      @$el.removeClass "wbt-rotator__active"
      @pointerPressed = false
      @frameCurrent = @$el.children(".wbt-rotator-image").index(@$frameCurrent)
    return

  WBTRotator::onPointerMove = (e) ->
    if @pointerPressed
      (if (e.preventDefault) then e.preventDefault() else e.returnValue = false)
      delta = undefined
      if @cfg.invertAxes
        delta = e.pageY - @pointerPosition.y
      else
        delta = e.pageX - @pointerPosition.x

      # Normalize
      delta = Math.floor(delta * @frameCount / ((if @invertAxes then @frameSize.height else @frameSize.width)))

      # Add current frame index
      if @cfg.invertMouse
        delta = @frameCurrent - delta
      else
        delta = @frameCurrent + delta
      @changeFrame delta
    return


  # TODO: add momentum
  WBTRotator::onPointerEnter = ->
    #        this.stopAutoRotate();

  WBTRotator::onPointerLeave = ->
    #        this.startAutoRotate();

  WBTRotator::onScroll = (e, delta) ->
    if @cfg.rotateManual
      e.preventDefault()
      scrollUp = undefined
      unless `undefined` is e.wheelDelta
        scrollUp = (e.wheelDelta > 0)
      else unless `undefined` is e.detail
        scrollUp = (e.detail > 0)
      else
        scrollUp = (e.originalEvent.wheelDelta > 0)
      @changeFrame (if scrollUp then ++@frameCurrent else --@frameCurrent)
    return

  WBTRotator::changeFrame = (newIndex) ->
    # Avoid negative values before rotation by adding base
    newIndex += @frameCount

    # Rotate around total frame count
    newIndex %= @frameCount

    # TODO: allow non-circular rotation, arc rotation
    @$frameCurrent.removeClass "wbt-rotator-image__active"
    @$frameCurrent = @$frames.eq(newIndex)
    @$frameCurrent.addClass "wbt-rotator-image__active"
    return

  WBTRotator::startAutoRotate = ->
    self = this
    setInterval (->
      self.changeFrame (if self.cfg.invertAutoRotate then ++self.frameCurrent else --self.frameCurrent)  unless self.pointerPressed
      return
    ), @cfg.rotateAutoSpeed
    return

  WBTRotator::stopAutoRotate = ->
    # TODO: Stop on mouse hover

  $.wbtError = (error) ->
    console.error error  if window.console and window.console.error
    return

  $.wbtIsTouch = ->
    (if (("ontouchstart" of window) or (window.DocumentTouch and document instanceof DocumentTouch)) then true else false)

  $.fn.wbtRotator = (params) ->
    new WBTRotator(this, params)

  return
) jQuery