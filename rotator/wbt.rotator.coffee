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
    @framePrevious = 0
    @frameCurrent = @cfg.frameFirst
    @frameCount = 0
    @frameLoadedCount = 0
    @frameSize =
      width: 0
      height: 0
    @masks = [] # TODO Refactor
    @paths = [] # TODO Refactor
    @pathCount = 0 # TODO Refactor
    @pathLoadedCount = 0 # TODO Refactor
    @pathRoot = null # TODO Remove
    @pointerPressed = false
    @pointerPosition =
      x: 0
      y: 0

    return $.wbtError("Specify non empty rotator placeholder.") unless @$el.length
    return $.wbtError("Specify 'frameSrc' in $().wbtRotator() call.") if not @cfg.frameSrc or @cfg.frameSrc.length is 0

    # Dealing with template string
    @getFrameSrc() if typeof @cfg.frameSrc is "string"
    @getPathSrc() if typeof @cfg.pathSrc is "string"
    @frameCount = @cfg.frameSrc.length
    @pathCount = @cfg.pathSrc.length
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
    @$el.on "click.wbt-rotator", $.proxy(@loadImages, this)

    @$mask = $("<div></div>").attr("class": "wbt-rotator-mask").appendTo(@$el)
    @maskPaper = Snap()
    @$mask.append(@maskPaper.node)

    @loadImages() if @cfg.autoLoad
    return

  WBTRotator::defaults =
    showLoader: true
    frameCover: "" # if not present, first frame taken
    frameSrc: ""
    pathSrc: ""
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
    if @cfg.enableMouseWheel
      @$el.on "mousewheel DOMMouseScroll", $.proxy(@onScroll, this)
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

  WBTRotator::getPathSrc = ->
    pathCount = parseInt(@cfg.pathSrc.replace(/.*{{|}}.*/g, "")) # Remove everything except contents between {{ and }}
    pathCountLength = ("" + pathCount).length
    pathIndex = 0
    pathIndexLength = 0
    pathSrc = []
    i = 0
    while i < pathCount
      pathIndex = i
      pathIndex = "0" + pathIndex  while pathIndexLength = ("" + pathIndex).length < pathCountLength  if @cfg.leadingZero
      pathSrc.push @cfg.pathSrc.replace(/{{.*}}/, pathIndex)
      i++
    @cfg.pathSrc = pathSrc
    return

  WBTRotator::loadCover = ->
    @$cover = $("<img />")
    .attr(class: "wbt-rotator-cover", src: @cfg.frameCover, alt: "")
    .appendTo(@$el)
    .on("load", =>
        @frameSize =
          width: @$cover.width()
          height: @$cover.height()
        @$el.width(@frameSize.width).height @frameSize.height
        return
      )
    return

  WBTRotator::loadImages = ->
    # Avoid double initialization
    @$el.off("click.wbt-rotator").addClass "wbt-rotator__loading"

    for i in [0..@frameCount]
      $("<img />").attr(
        class: "wbt-rotator-image"
        src: @cfg.frameSrc[i]
        alt: ""
      ).appendTo(@$el).on "load", (e) =>
        @frameLoadedCount++
        if @frameLoadedCount is 1 and not @frameCover
          $this = $(e.target)
          @frameSize =
            width: $this.width()
            height: $this.height()
          @$el.width(@frameSize.width).height @frameSize.height
        if @frameLoadedCount is @frameCount
          @loadImagesComplete()
        return
    return

  WBTRotator::loadPaths = (i)->
    # Avoid double initialization
    @$el.off("click.wbt-rotator").addClass "wbt-rotator__loading"

    self = this

    $.get @cfg.pathSrc[i], (el)=>
      @pathLoadedCount++

      imageNew = @maskPaper.image(@cfg.frameSrc[i], 0, 0)
      imageNew.attr("display", "none")

      pathsSet = @maskPaper.g().attr(display: "none")
      $(el).find("path").each (index, el)=>
        pathNew = @maskPaper.path $(el).attr("d")
        pathNew.transform("s.25,.25,0,0")
        pathNew.attr
#          fill:"rgba(0,255,0,.5)"
          fill: "transparent"
          cursor: "pointer"
        pathNew.click ->
          self.$mask.toggleClass("wbt-rotator-mask__active")
        pathsSet.add pathNew
        pathsSet.data("group", "testgroup")
        pathsSet.data("index", i)

      @paths.push pathsSet

      imageNew.attr("mask", pathsSet.clone().attr(fill: "#fff", display: ""))
      @masks.push imageNew

      if @pathLoadedCount is @pathCount
        @loadPathsComplete()
      else
        @loadPaths(++i)
    return

  WBTRotator::loadImagesComplete = ->
    @loadPaths(0)
    return

  WBTRotator::loadPathsComplete = ->
#    TODO sync with images loading
    @$frames = @$el.children(".wbt-rotator-image")
    @changeFrame @frameCurrent
    @changePath @frameCurrent

    @$el.removeClass("wbt-rotator__loading").addClass "wbt-rotator__loaded"
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

      @changeFrame delta, @frameCurrent
      @changePath delta, @frameCurrent
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

      @frameCurrent %= @frameCount
      if scrollUp then ++@frameCurrent else --@frameCurrent
      @changeFrame @frameCurrent
      @changePath @frameCurrent
    return

  WBTRotator::changeFrame = (newIndex) ->
    # Avoid negative values before rotation by adding base and Rotate around total frame count
    newIndex %= @frameCount
    newIndex += @frameCount
    newIndex %= @frameCount

    # TODO: allow non-circular rotation, arc rotation
    @$frameCurrent.removeClass "wbt-rotator-image__active"
    @$frameCurrent = @$frames.eq(newIndex)
    @$frameCurrent.addClass "wbt-rotator-image__active"

    @masks[@framePrevious].attr "display": "none"
    @masks[newIndex].attr "display": ""
    return

  WBTRotator::changePath = (newIndex) ->
    # Avoid negative values before rotation by adding base and Rotate around total frame count
    newIndex %= @frameCount
    newIndex += @frameCount
    newIndex %= @frameCount
    @paths[@framePrevious].attr(display: "none")
    @paths[newIndex].attr(display: "")

    @framePrevious = newIndex
    return

  WBTRotator::startAutoRotate = ->
    setInterval (=>
      if @cfg.invertAutoRotate then ++@frameCurrent else --@frameCurrent
      unless @pointerPressed
        @changeFrame @frameCurrent
        @changePath @frameCurrent
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