###
wbt.rotator.js v2.0.0

Dependencies: jQuery 1.7+, Snap SVG 0.2+

Basic usage:
$(".any-selector").wbtRotator({
  src: "path/template/{{30}}.jpg",
  masks: [{
    title: "First Mask",
    src: "path/to/mask/{{30}}.svg"
  }, {
    title: "Second Mask",
    src: "path/to/mask/{{30}}.svg"
  }]
});

Copyright 2014, Visual Science, http://visualscience.ru/
Created by WB—Tech, http://wbtech.pro/
###
(($) ->
  WBTRotator = ($el, params) ->
    @cfg = $.extend({}, WBTRotator::defaults, params)
    @cfg.frameSrc = @createSrcArray(@cfg.src) # Decompose template string into href arrays
    @cfg.frameCover = @cfg.cover # Alias
    @cfg.maskSrc = @cfg.masks # Alias

    @$el = $el.addClass("wbt-rotator")
    @$frameCurrent = $()
    @$maskCurrent = $()
    @$frames = $()
    @frames =
      previous: 0
      current: @cfg.frameFirst
      total: @cfg.frameSrc.length
      loaded: 0
      size:
        width: 0
        height: 0

    @$masks = {}
    @masks =
      current: ""
      titles: @cfg.maskSrc.length
      total: @cfg.maskSrc.length * @frames.total
      loaded: 0

    @pointerPressed = false
    @pointerPosition =
      x: 0
      y: 0

    return $.wbtError("Specify non empty rotator placeholder.") unless @$el.length
    return $.wbtError("Specify 'src' in $().wbtRotator() call.") if not @cfg.frameSrc

    # Create loading spinner
    @$loader = $("<span></span>").attr(class: "wbt-rotator-loader").prependTo(@$el)

    # Load cover
    @cfg.frameCover = @cfg.src.replace(/{{.*}}/, "00")  unless @cfg.frameCover
    @loadCover()

    # Set cursor
    if @cfg.rotateManual
      if @cfg.cursor is "arrows"
        if @cfg.invertAxes
          @$el.addClass "wbt-rotator__vertical"
        else
          @$el.addClass "wbt-rotator__horizontal"
      else @$el.addClass "wbt-rotator__grab"  if @cfg.cursor is "grab"

    # Load Images
    if @cfg.autoLoad
      @loadImages()
    else
      @$el.on "click.wbt-rotator", $.proxy(@loadImages, this)

    # Load Masks
    @maskSVG = Snap()
    @$maskSVG = $(@maskSVG.node)
    @$maskSVG.appendTo(@$el).attr("class": "wbt-rotator-mask")
    @$maskTitle = $("<span></span>").attr(class: "wbt-rotator-title").prependTo(@$el)
    if typeof @cfg.maskSrc is "object"
      if @cfg.autoLoad
        @loadSVG()
      else
        @$el.on "click.wbt-rotator", $.proxy(@loadSVG, this)
    else
      # TODO load combined svg

    # Load Legend
    if @cfg.legend
      @$maskLegend = $("<ul></ul>").attr(class: "wbt-rotator-legend").prependTo(@$el)
      for mask in @cfg.maskSrc
        $legendItem = $("<li></li>")
        $legendItem.text(mask.title)
        $legendItem.data("title", mask.title)
        circleColor = mask.color or "#fff"
        $legendItem.css("background", "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12'><circle cx='6' cy='6' r='5' stroke='rgba(255,255,255,.5)' stroke-width='1' fill='#{circleColor}' /></svg>\") left center no-repeat")
        $legendItem.appendTo(@$maskLegend)
      @$maskLegend.on "click", "li", $.proxy(@onPathClick, @, 0)
      @$maskLegend.on "mouseover", "li", $.proxy(@onPathOver, @, 0)
      @$maskLegend.on "mouseout", "li",  $.proxy(@onPathOut, @, 0)

    return

  WBTRotator::defaults =
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
    legend: true
    cursor: "grab"

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

  WBTRotator::createSrcArray = (template)->
    itemCount = parseInt(template.replace(/.*{{|}}.*/g, "")) # Remove everything except contents between {{ and }}
    itemCountLength = ("" + itemCount).length
    itemIndex = 0
    itemIndexLength = 0
    itemSrcArray = []
    i = 1
    while i <= itemCount
      itemIndex = i
      itemIndex = "0" + itemIndex  while itemIndexLength = ("" + itemIndex).length < itemCountLength  if @cfg.leadingZero
      itemSrcArray.push template.replace(/{{.*}}/, itemIndex)
      i++
    return itemSrcArray

  WBTRotator::updateLoader = ->
    @$loader.css("background-position", "left -#{Math.round((@frames.loaded + @masks.loaded) * 60 / (@frames.total + @masks.total)) * 40}px")
    return

  WBTRotator::loadCover = ->
    @$cover = $("<img />")
    .attr(class: "wbt-rotator-cover", src: @cfg.frameCover, alt: "")
    .appendTo(@$el)
    .on("load", =>
        @frames.size =
          width: @$cover.width()
          height: @$cover.height()
        @$el.width(@frames.size.width).height @frames.size.height
        return
      )
    .on("error", =>
        if @cfg.frameCover isnt @cfg.frameSrc[0]
          @cfg.frameCover = @cfg.frameSrc[0]
          @loadCover()
        return
      )
    return

  WBTRotator::loadSVG = ->
    # Avoid double initialization
    @$el.off("click.wbt-rotator").addClass "wbt-rotator__loading"

    # Decompose template string into href arrays
    for mask, index in @cfg.maskSrc
      @cfg.maskSrc[index].srcArray = @createSrcArray(mask.src)

    # Load all svg paths
    for i in [0..@frames.total-1]
      for maskSrc, index in @cfg.maskSrc

        # Closure to pass title and index in $.get callback
        getCallback = (title, index)=>
          (data)=>
            @loadedSVG(data, title, index)

        $.get maskSrc.srcArray[i], getCallback(@cfg.maskSrc[index].title, i)


  WBTRotator::loadedSVG = (documentSVG, title, index)->
    @masks.loaded++
    @updateLoader()

    @$masks[title] = {} if not @$masks[title]?
    @$masks[title].paths = [] if not @$masks[title].paths?
    @$masks[title].images = [] if not @$masks[title].images?

    # TODO refactor start
    imageNew = @maskSVG.image(@cfg.frameSrc[index], 0, 0)
    imageNew.attr("display", "none")

    pathGroup = @maskSVG.g().attr
      display: "none"
#      fill:"rgba(0,255,0,.5)"
      fill: "transparent"
      cursor: "pointer"

    $(documentSVG).find("path").each (index, el)=>
      pathNew = @maskSVG.path $(el).attr("d")
      pathNew.transform("s.25,.25,0,0")
      pathNew.click $.proxy(@onPathClick, @, pathNew)
      pathNew.mouseover $.proxy(@onPathOver, @, pathNew)
      pathNew.mouseout $.proxy(@onPathOut, @, pathNew)
      pathNew.touchstart $.proxy(@onPathClick, @, pathNew)
      pathNew.data("index", index)
      pathNew.data("title", title)
      pathGroup.add pathNew

    @$masks[title].paths[index] = pathGroup

    imageNew.attr("mask", pathGroup.clone().attr(fill: "#fff", display: ""))
    @$masks[title].images[index] = imageNew
    # TODO refactor end

    if @masks.loaded is @masks.total
      # Move all paths infront of images to make them clickable
      for mask in @cfg.maskSrc
        for path in @$masks[mask.title].paths
          path.appendTo @maskSVG
      if @frames.loaded is @frames.total
        @loadComplete()

  WBTRotator::loadImages = ->
    # Avoid double initialization
    @$el.off("click.wbt-rotator").addClass "wbt-rotator__loading"

    for i in [0..@frames.total]
      $("<img />").attr(
        class: "wbt-rotator-image"
        src: @cfg.frameSrc[i]
        alt: ""
      ).appendTo(@$el).on "load", (e) =>
        @frames.loaded++
        @updateLoader()
        if @frames.loaded is 1 and not @frameCover
          $this = $(e.target)
          @frames.size =
            width: $this.width()
            height: $this.height()
          @$el.width @frames.size.width
          @$el.height @frames.size.height
        if @frames.loaded is @frames.total and @masks.loaded is @masks.total
          @loadComplete()
        return
    return

  WBTRotator::loadComplete = ->
    @$el.on "click.wbt-rotator", "image", =>
      @masks.current = ""
      @$el.removeClass("wbt-rotator-mask__active")

    @$frames = @$el.children(".wbt-rotator-image")
    @changeFrame @frames.current
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
      @frames.current = @$el.children(".wbt-rotator-image").index(@$frameCurrent)
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
      delta = Math.floor(delta * @frames.total / ((if @invertAxes then @frames.size.height else @frames.size.width)))

      # Add current frame index
      if @cfg.invertMouse
        delta = @frames.current - delta
      else
        delta = @frames.current + delta

      @changeFrame delta
    return

  WBTRotator::onPathClick = (el, e)->
    # Title is either path.data or jQuery event's data attribute
    # This is to have single handler for legend and path clicks
    title = if el then el.data("title") else $(e.target).data("title")

    # If nothing is yet selected
    if not @masks.current
      @masks.current = title
      @$maskTitle.text(@masks.current)
      @$el.addClass("wbt-rotator-mask__active")
    # If something is selected
    else
      # Other mask
      if @masks.current isnt title
        @masks.current = title
        @$maskTitle.text(@masks.current)
      # This mask
      else
        @masks.current = ""
        @$el.removeClass("wbt-rotator-mask__active")

    # Hide other masks, show clicked
    for mask in @cfg.maskSrc
      if @masks.current and mask.title isnt @masks.current
        @$masks[mask.title].images[@frames.current].attr display: "none"
      else
        @$masks[mask.title].paths[@frames.current].attr display: ""
        @$masks[mask.title].images[@frames.current].attr display: ""

  WBTRotator::onPathOver = (el, e)->
    title = if el then el.data("title") else $(e.target).data("title")

    # For every mask
    for mask in @cfg.maskSrc
      # If mask is hovered
      if mask.title is title
        # Show filled path
        @$masks[mask.title].paths[@frames.current].attr display: "", fill: "rgba(255,255,255,.4)"
        # And show
#        if not @masks.current
#          @$masks[mask.title].images[@frames.current].attr display: ""
      else
        @$masks[mask.title].images[@frames.current].attr display: "none"

  WBTRotator::onPathOut = (el, e)->
    title = if el then el.data("title") else $(e.target).data("title")
    @$masks[title].paths[@frames.current].attr fill: "rgba(255,255,255,0)"

#    if not @masks.current





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

      if scrollUp then ++@frames.current else --@frames.current
      @frames.current += @frames.total
      @frames.current %= @frames.total
      @changeFrame @frames.current
    return

  WBTRotator::changeFrame = (newIndex) ->
    # Avoid negative values before rotation by adding base and Rotate around total frame count
    newIndex %= @frames.total
    newIndex += @frames.total
    newIndex %= @frames.total

    return if newIndex is @framePrevious

    # TODO: allow non-circular rotation, arc rotation
    @$frameCurrent.removeClass "wbt-rotator-image__active"
    @$frameCurrent = @$frames.eq(newIndex)
    @$frameCurrent.addClass "wbt-rotator-image__active"

    for mask in @cfg.maskSrc
      @$masks[mask.title].paths[@frames.previous].attr display: "none"
      @$masks[mask.title].images[@frames.previous].attr display: "none"
      @$masks[mask.title].paths[newIndex].attr display: ""
      if not @masks.current or mask.title is @masks.current
        @$masks[mask.title].images[newIndex].attr display: ""

    @frames.previous = newIndex
    return

  WBTRotator::startAutoRotate = ->
    setInterval (=>
      if @cfg.invertAutoRotate then ++@frames.current else --@frames.current
      unless @pointerPressed
        @changeFrame @frames.current
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