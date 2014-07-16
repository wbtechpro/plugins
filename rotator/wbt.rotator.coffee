###
wbt.rotator.js v3.0.0

Dependencies: jQuery 1.7+, Snap SVG 0.2+

Basic usage:
$(".any-non-empty-selector").wbtRotator({
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
# TODO when fogging false selected path is blinking
(($) ->
  WBTRotator = ($el, params) ->
    @cfg = $.extend({}, WBTRotator::defaults, params)
    @cfg.frameSrc = @createSrcArray(@cfg.src) # Decompose template string into href arrays
    @cfg.frameCover = @cfg.cover # Alias
    @cfg.frameFirst = @cfg.first # Alias
    @cfg.maskSrc = @cfg.masks # Alias
    for mask in @cfg.maskSrc
      mask.titleId = mask.id
    @cfg.masksCategories.unshift
      id: "none"
      title: ""
      masks: []
    @cfg.slider = @cfg.slider and not @cfg.circular
    @cfg.language = @cfg.language.toUpperCase()

    @$el = $el.addClass("wbt-rotator")
    @$elContent = $("<div></div>").attr("class": "wbt-rotator-content").prependTo(@$el)
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

    @$legendHeading = {}
    @$legendTitles = {}
    @$legendDescriptions = {}

    @pointerPressed = false
    @pointerMoved = false
    @pointerPosition =
      x: 0
      y: 0

    @sliderPressed = false
    @sliderPosition =
      x: 0
      y: 0
      max: 0
      current: 0

    return $.wbtError("Specify non empty rotator placeholder.") unless @$el.length
    return $.wbtError("Specify 'src' in $().wbtRotator() call.") if not @cfg.frameSrc

    # Create loading spinner
    @$loader = $("<span></span>").attr(class: "wbt-rotator-loader").prependTo(@$elContent)

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
      @$elContent.on "#{if $.wbtIsTouch() then "singleTap" else "click"}.wbt-rotator", $.proxy(@loadImages, this)

    # Load Masks
    @maskSVG = Snap()
    @$maskSVG = $(@maskSVG.node)
    @$maskSVG.appendTo(@$elContent).attr("class": "wbt-rotator-mask")
    if typeof @cfg.maskSrc is "object"
      if @cfg.autoLoad
        @loadSVG()
      else
        @$elContent.on "#{if $.wbtIsTouch() then "singleTap" else "click"}.wbt-rotator", $.proxy(@loadSVG, this)
    else
      # TODO load combined svg

    # Load Legend
    if @cfg.legend
      @$maskLegend = $("<div></div>").attr("class": "wbt-rotator-legend").appendTo(@$el) # TODO don't need these vars?
      @$legendHeading = $("<div><span class='wbt-rotator-heading_text'></span></div>").attr("class": "wbt-rotator-heading").appendTo(@$maskLegend)
      @$maskTitles = $("<div></div>").attr("class": "wbt-rotator-titles_list").appendTo(@$maskLegend)
      @$maskDescriptions = $("<ul></ul>").attr("class": "wbt-rotator-descriptions_list").appendTo(@$maskLegend)

      # Set categories for masks
      for category in @cfg.masksCategories
        for maskToShow in category.masks
          for mask in @cfg.maskSrc
            if maskToShow is mask.id
              mask.category = category.id

      # Not meitioned in maskCategories masks gets 'none' category
      for mask in @cfg.maskSrc
        if not mask.category
          mask.category = "none"

      # Create legend items in categories
      for category in @cfg.masksCategories
        if category.id isnt "none"
          $categoryTitle = $("<div></div>").attr("class", "wbt-rotator-category_title").appendTo(@$maskTitles).data("title", category.id)
        $categoryWrap = $("<div></div>").attr("class", "wbt-rotator-category_wrap").appendTo(@$maskTitles).data("title", category.id)

        for mask in @cfg.maskSrc
          if mask.category is category.id
            @$legendTitles[mask.titleId] = $("<div></div>").attr("class", "wbt-rotator-titles_item").appendTo($categoryWrap).data("title", mask.titleId)
            $("<span></span>").attr("class", "wbt-rotator-titles_text").appendTo(@$legendTitles[mask.titleId]).html(mask.titleId)
            $("<span></span>").attr("class", "wbt-rotator-titles_icon").appendTo(@$legendTitles[mask.titleId]).css("background-color": mask.color or @cfg.mask.color)
            @$legendDescriptions[mask.titleId] = $("<li></li>").attr("class", "wbt-rotator-descriptions_item").appendTo(@$maskDescriptions).data("title", mask.titleId).html(mask.titleId)

      @$maskLegend.on "#{if $.wbtIsTouch() then "singleTap" else "click"}", ".wbt-rotator-titles_item", $.proxy(@onPathClick, @, null) # Sending null to set proper arguments order for both click and hover events
      if not $.wbtIsTouch()
        @$maskLegend.on "mouseover", ".wbt-rotator-titles_item", $.proxy(@onPathOver, @, null)
        @$maskLegend.on "mouseout", ".wbt-rotator-titles_item",  $.proxy(@onPathOut, @, null)

      # Create language dropdown
      if $.wbtRotator.l10n?
        tplLanguages = ""
        for lang of $.wbtRotator.l10n
          tplLanguages += "<option #{"selected" if lang is @cfg.language} value='#{lang}'>#{lang}</option>"

        $("<select>#{tplLanguages}</select>").prependTo(@$legendHeading)
          .wbtFormStyler()
          .on("change", $.proxy(@changeLocale, this))
          .parent().find(".wbt-input-select_options").css("background-color": @$el.css("background-color"), "box-shadow": "0 0 1px 1px #{@$el.css("background-color")}")

        @updateLocalization(0)

    # Load Theme
    if @cfg.theme
      if @cfg.theme.background
        @$el.css
          "color": @cfg.theme.text
          "background-color": @cfg.theme.background

    cssText = "
      .wbt-rotator {color:#{@cfg.theme.text} !important;background-color:#{@cfg.theme.background} !important;}
      .wbt-rotator-titles_item:hover,
      .wbt-rotator-titles_item__hover,
      .wbt-rotator .wbt-input-select_item:hover {color:#{@cfg.theme.hover} !important;}
      .wbt-rotator-titles_item__active,
      .wbt-rotator-titles_item__active:hover,
      .wbt-rotator-legend a,
      .wbt-rotator .wbt-input-select__active .wbt-input-select_button,
      .wbt-rotator .wbt-input-select_item__active,
      .wbt-rotator .wbt-input-select_item__active:hover,
      .wbt-rotator .wbt-input-select_selected:hover {color:#{@cfg.theme.active} !important;}
      .wbt-rotator .wbt-input-select_selected,
      .wbt-rotator .wbt-input-select_list {border:1px solid #{@cfg.theme.text};}
      .wbt-rotator .wbt-input-select_selected:hover,
      .wbt-rotator .wbt-input-select_list:hover,
      .wbt-rotator .wbt-input-select__active .wbt-input-select_list {border:1px solid #{@cfg.theme.active};}
      .wbt-rotator-titles_item__active .wbt-rotator-titles_icon {border-color:#{@cfg.theme.active};}"

    $style = $("<style></style>").prependTo(@$el)
    if $style[0].styleSheet
      $style[0].styleSheet.cssText = cssText
    else
      $style.html cssText

    # Load Scroll Slider
    if @cfg.slider
      @$maskScroll = $('<div class="wbt-rotator-scroll"></div>').appendTo(@$elContent)
      @$maskScrollPath = $('<div class="wbt-rotator-scroll_path"></div>').appendTo(@$maskScroll)
      @$maskScrollTrack = $('<div class="wbt-rotator-scroll_track"></div>').appendTo(@$maskScrollPath)
      @$maskScrollSlider = $('<div class="wbt-rotator-scroll_slider"></div>').appendTo(@$maskScrollPath)
      @$maskScroll[0].addEventListener (if $.wbtIsTouch() then "touchstart" else "mousedown"), $.proxy(@onSliderPointerDown, this)
    return

  WBTRotator::defaults =
    language: "EN"
    frameCover: "" # if not present, first frame taken
    frameSrc: ""
    frameFirst: 0
    first: 0
    masksCategories: []
    leadingZero: true
    autoLoad: true
    rotateAuto: false
    rotateAutoSpeed: 100 # milliseconds per frame
    rotateManual: true # disable keyboard and mouse for rotation
    invertAxes: false # false: horizontal; true: vertical
    invertMouse: false # false: counter-clockwise; true: clockwise
    invertAutoRotate: false # false: counter-clockwise; true: clockwise
    enableMouseWheel: false
    circular: true
    fogging: true
    legend: true
    slider: true
    animationDuration: 500
    mask:
      color: "#fff"
      opacity: .4
    stroke:
      color: "#fff"
      width: 1
      opacity: .4
    cursor: "grab"

  WBTRotator::registerEvents = ->
    @$elContent[0].addEventListener (if $.wbtIsTouch() then "touchstart" else "mousedown"), $.proxy(@onPointerDown, this)
    document.addEventListener (if $.wbtIsTouch() then "touchend" else "mouseup"), $.proxy(@onPointerUp, this)
    document.addEventListener (if $.wbtIsTouch() then "touchmove" else "mousemove"), $.proxy(@onPointerMove, this)
    if @cfg.enableMouseWheel
      @$elContent.on "mousewheel DOMMouseScroll", $.proxy(@onScroll, this)
    if @cfg.rotateAuto
      @$elContent.on "mouseenter", $.proxy(@onPointerEnter, this)
      @$elContent.on "mouseleave", $.proxy(@onPointerLeave, this)
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
    .appendTo(@$elContent)
    .on("load", =>
        @frames.size =
          width: @$cover.width()
          height: @$cover.height()
        @$elContent.width @frames.size.width
        @$el.height @frames.size.height
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
    @$elContent.off("#{if $.wbtIsTouch() then "singleTap" else "click"}.wbt-rotator")
    @$el.addClass "wbt-rotator__loading"

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

        $.get maskSrc.srcArray[i], getCallback(@cfg.maskSrc[index].titleId, i)


  WBTRotator::loadedSVG = (documentSVG, title, index)->
    @masks.loaded++
    @updateLoader()

    @$masks[title] = {} if not @$masks[title]?
    @$masks[title].paths = [] if not @$masks[title].paths?
    @$masks[title].images = [] if not @$masks[title].images?

    # TODO refactor start
    imageNew = @maskSVG.image(@cfg.frameSrc[index], 0, 0)
    imageNew.attr("display", "none")
    imageGroup = @maskSVG.g().append imageNew

    pathGroup = @maskSVG.g().attr
      display: "none"
      fill: "transparent"
      style: "-webkit-transition:100ms;transition:100ms;"
      cursor: "pointer"

    $(documentSVG).find("path").each (index, el)=>
      pathNew = @maskSVG.path $(el).attr("d")
#      pathNew.transform("s.25,.25,0,0") #TODO automatically get proper sizes
      if $.wbtIsTouch()
        pathNew.touchstart =>
          @pointerMoved = false
        pathNew.touchmove =>
          @pointerMoved = true
        pathNew.touchend =>
          $.proxy(@onPathClick, @, pathNew)() if not @pointerMoved
      else
        pathNew.click $.proxy(@onPathClick, @, pathNew)
        pathNew.mouseover $.proxy(@onPathOver, @, pathNew)
        pathNew.mouseout $.proxy(@onPathOut, @, pathNew)
      pathNew.data("index", index)
      pathNew.data("title", title)
      pathGroup.add pathNew

    @$masks[title].paths[index] = pathGroup.attr("display", "none")
    @$masks[title].paths[index].data("id", index)

    imageNew.attr("mask", pathGroup.clone().attr(fill: @cfg.mask.color, display: ""))
    @$masks[title].images[index] = imageNew
    # TODO refactor end

    if @masks.loaded is @masks.total
      # Move all paths infront of images to make them clickable
      for mask in @cfg.maskSrc
        # Convert color to RGB
        mask.color = Snap.getRGB(mask.color)
        if not mask.opacity
          mask.opacity = @cfg.mask.opacity

        # Convert stroke color to RGB
        if mask.stroke
          if mask.stroke.color
            mask.stroke.color = Snap.getRGB(mask.stroke.color)

        # Combine stroke object of empty + default + mask set color + mask set stroke
        mask.stroke = $.extend({}, @cfg.stroke, {color: mask.color}, mask.stroke)

        for path in @$masks[mask.titleId].paths
          path.attr stroke: "rgba(#{mask.stroke.color.r},#{mask.stroke.color.g},#{mask.stroke.color.b},#{mask.stroke.opacity})"
          path.attr "stroke-width": 0
          path.appendTo @maskSVG
      if @frames.loaded is @frames.total
        @loadComplete()

  WBTRotator::loadImages = ->
    # Avoid double initialization
    @$elContent.off("#{if $.wbtIsTouch() then "singleTap" else "click"}.wbt-rotator")
    @$el.addClass "wbt-rotator__loading"

    for i in [0..@frames.total]
      $("<img />").attr(
        class: "wbt-rotator-image"
        src: @cfg.frameSrc[i]
        alt: ""
      ).appendTo(@$elContent).on "load", (e) =>
        @frames.loaded++
        @updateLoader()
        if @frames.loaded is 1 and not @frameCover
          $this = $(e.target)
          @frames.size =
            width: $this.width()
            height: $this.height()
          @$elContent.width @frames.size.width
          @$elContent.height @frames.size.height
        if @frames.loaded is @frames.total and @masks.loaded is @masks.total
          @loadComplete()
        return
    return

  WBTRotator::loadComplete = ->
    @$elContent.on "#{if $.wbtIsTouch() then "singleTap" else "click"}.wbt-rotator", "image", $.proxy(@onPathClick, @, null, null)
    @$frames = @$elContent.children(".wbt-rotator-image")
    @changeFrame @frames.current
    @$el.removeClass("wbt-rotator__loading").addClass "wbt-rotator__loaded"
    @registerEvents()
    @startAutoRotate()  if @cfg.rotateAuto
    return

  WBTRotator::onPointerDown = (e) ->
#    (if (e.preventDefault) then e.preventDefault() else e.returnValue = false)
    $target = $(e.target)
    if $target.closest(".wbt-rotator-scroll").length
      if $target.hasClass "wbt-rotator-scroll_slider"
        @sliderPressed = true
        @sliderPosition.x = e.pageX
        @sliderPosition.y = e.pageY
        @sliderPosition.max = if @cfg.invertAxes then @$maskScrollPath.height() else @$maskScrollPath.width()
        @sliderPosition.current = parseInt(@$maskScrollSlider.css "left")
    else
      @$el.addClass "wbt-rotator__active"
      @pointerPressed = @cfg.rotateManual and not (e.touches and e.touches.length > 1)
      if @pointerPressed
        @pointerPosition.x = e.pageX
        @pointerPosition.y = e.pageY
    return

  WBTRotator::onPointerUp = ->
    if @sliderPressed
      @sliderPressed = false

    if @pointerPressed
      @$el.removeClass "wbt-rotator__active"
      @pointerPressed = false
      @frames.current = @$elContent.children(".wbt-rotator-image").index(@$frameCurrent)
    return

  WBTRotator::onPointerMove = (e) ->
    if e.touches
      x = e.touches[0].pageX
      y = e.touches[0].pageY
    else
      x = e.pageX
      y = e.pageX

    if not e.touches or e.touches and e.touches.length == 1
      (if (e.preventDefault) then e.preventDefault() else e.returnValue = false)
    # TODO allow pinch zoom even after changeFrame (not working now)

    if @sliderPressed
      newPosition = @sliderPosition.current
      if @cfg.invertAxes
        newPosition += y - @sliderPosition.y
      else
        newPosition += x - @sliderPosition.x

      if newPosition < 0
        newPosition = 0
      if newPosition > @sliderPosition.max
        newPosition = @sliderPosition.max

      @frames.current = Math.floor(newPosition * (@frames.total-1) / @sliderPosition.max)
      @changeFrame @frames.current

    if @pointerPressed
      if @cfg.invertAxes
        delta = y - @pointerPosition.y
      else
        delta = x - @pointerPosition.x

      # Normalize
      delta = Math.floor(delta * @frames.total / ((if @invertAxes then @frames.size.height else @frames.size.width)))

      # Add current frame index
      if @cfg.invertMouse
        delta = @frames.current - delta
      else
        delta = @frames.current + delta

      @changeFrame delta
    return

  WBTRotator::pathSelect = (title, frame = @frames.current)->
    for mask in @cfg.maskSrc
      if mask.titleId is title
        @$masks[mask.titleId].paths[frame].attr "stroke-width": mask.stroke.width
        if @cfg.fogging
          @$masks[mask.titleId].paths[frame].attr fill: "rgba(255,255,255,0)"
        else
          @$masks[mask.titleId].paths[frame].attr fill: "rgba(#{mask.color.r},#{mask.color.g},#{mask.color.b},#{mask.opacity})"
        @$masks[mask.titleId].images[frame].attr display: ""
    if @cfg.fogging
      @$el.addClass("wbt-rotator-mask__active")

  WBTRotator::pathDeselect = (title = @masks.current, frame = @frames.current)->
    for mask in @cfg.maskSrc
      if mask.titleId is title
        @$masks[mask.titleId].paths[frame].attr "stroke-width": 0, fill: "rgba(255,255,255,0)"
        @$masks[mask.titleId].images[frame].attr display: "none"
    if @cfg.fogging
      @$el.removeClass("wbt-rotator-mask__active")

  WBTRotator::onPathClick = (el, e)->
    if el? or e?
      # Title is either path.data or jQuery event's data attribute
      # This is to have single handler for legend and path clicks
      title = if el then el.data("title") else $(e.target).data("title") or $(e.target).closest(".wbt-rotator-titles_item").data("title")
    else
      # Otherwise it's current selected mask to remove selection on empty region click
      title = @masks.current

    # When this path was clicked again
    if @masks.current and @masks.current is title
      @pathDeselect(@masks.current)
      @masks.current = ""

    # When other path was clicked or nothing was selected
    else
      if @masks.current and @masks.current isnt title
        @pathDeselect(@masks.current)
      @pathSelect(title)
      @masks.current = title

      # Search for closest frame with existing path if current has none
      # if not @$masks[@masks.current].paths[@frames.current].node.children.length
      @findFrame()

    # Update legend items visibility
    if @cfg.legend
      for mask in @cfg.maskSrc
        @$legendTitles[mask.titleId].toggleClass("wbt-rotator-titles_item__active", mask.titleId is @masks.current)
        @$legendDescriptions[mask.titleId].toggleClass("wbt-rotator-descriptions_item__active", mask.titleId is @masks.current)

  WBTRotator::onPathOver = (el, e)->
    title = if el then el.data("title") else $(e.target).data("title") or $(e.target).closest(".wbt-rotator-titles_item").data("title")
    # Hover mask it is the one that was hovered
    for mask in @cfg.maskSrc
      if mask.titleId is title and mask.titleId isnt @masks.current
        @$masks[mask.titleId].paths[@frames.current].attr fill: "rgba(#{mask.color.r},#{mask.color.g},#{mask.color.b},#{mask.opacity})"
        @$masks[mask.titleId].paths[@frames.current].attr "stroke-width": mask.stroke.width


    # Hover legend item
    if @cfg.legend
      for mask in @cfg.maskSrc
        @$legendTitles[mask.titleId].toggleClass("wbt-rotator-titles_item__hover", mask.titleId is title)
        @$legendDescriptions[mask.titleId].toggleClass("wbt-rotator-descriptions_item__hover", mask.titleId is title)


  WBTRotator::onPathOut = (el, e)->
    title = if el then el.data("title") else $(e.target).data("title") or $(e.target).closest(".wbt-rotator-titles_item").data("title")
    # Remove hover
    if title isnt @masks.current
      @$masks[title].paths[@frames.current].attr fill: "rgba(255,255,255,0)"
      @$masks[title].paths[@frames.current].attr "stroke-width": 0, fill: "rgba(255,255,255,0)"

    # Unhover legend item
    if @cfg.legend
      for mask in @cfg.maskSrc
        @$legendTitles[mask.titleId].removeClass("wbt-rotator-titles_item__hover")
        @$legendDescriptions[mask.titleId].removeClass("wbt-rotator-descriptions_item__hover")


  WBTRotator::onSliderPointerDown = (e)->
    return if $(e.target).hasClass("wbt-rotator-scroll_slider")

    pageX = parseInt @$maskScrollSlider.offset().left + @$maskScrollSlider.width() / 2
    pageY = parseInt @$maskScrollSlider.offset().top + @$maskScrollSlider.height() / 2

    @onPointerDown
      target: @$maskScrollSlider
      pageX: pageX
      pageY: pageY
      touches: [
        pageX: pageX
        pageY: pageY
      ]

    @onPointerMove
      pageX: e.pageX
      pageY: e.pageY
      touches: [
        pageX: e.pageX
        pageY: e.pageY
      ]


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

      if scrollUp then @frames.current++ else @frames.current--

      # Rotate avoiding negative values or restrict by min/max
      if @cfg.circular
        @frames.current += @frames.total
        @frames.current %= @frames.total
      else
        if @frames.current > @frames.total - 1
          @frames.current = @frames.total - 1
        if @frames.current < 0
          @frames.current = 0

      @changeFrame @frames.current
    return

  WBTRotator::findFrame = () ->
    # Copy paths array to temporary array and remove current item
    pathsRotated = @$masks[@masks.current].paths.slice(0)

    # Rotate one position and count steps to first path group with children
    stepsForward = 0
    pathsRotated.rotate(@frames.current)
    for path in pathsRotated
      if not path.node.childElementCount
        stepsForward++
      else
        break

    # Rotate to current item and count steps to first path group with children
    stepsBackward = 0
    pathsRotated.rotate(1)
    for path in pathsRotated by -1
      if not path.node.childElementCount
        stepsBackward++
      else
        break

    animateStep = (stepsRemaining, direction)=>
      @frames.current += direction
      @frames.current %= @frames.total

      @changeFrame @frames.current
      if stepsRemaining > 1
        setTimeout ->
          animateStep(stepsRemaining-1, direction)
        , 40

    # Do nothing when we have paths on current frame
    if stepsForward is 0 or stepsBackward is 0
      return false
    # Or start animation to rotate to first frame with paths
    else
      if stepsBackward > stepsForward
        animateStep(stepsForward, 1)
      if stepsBackward < stepsForward
        animateStep(stepsBackward, -1)

    return true

  WBTRotator::changeFrame = (frameCurrent) ->
    # Rotate avoiding negative values or restrict by min/max
    if @cfg.circular
#      frameCurrent %= @frames.total
      frameCurrent += @frames.total
      frameCurrent %= @frames.total
    else
      if frameCurrent > @frames.total - 1
        frameCurrent = @frames.total - 1
      if frameCurrent < 0
        frameCurrent = 0

    return if frameCurrent is @framePrevious

    # TODO: allow non-circular rotation, arc rotation
    @$frameCurrent.removeClass "wbt-rotator-image__active"
    @$frameCurrent = @$frames.eq(frameCurrent)
    @$frameCurrent.addClass "wbt-rotator-image__active"

    for mask in @cfg.maskSrc
      # Deselect and hide everything on previous frame
      @$masks[mask.titleId].paths[@frames.previous].attr display: "none", "stroke-width": 0, fill: "rgba(255,255,255,0)"
      @$masks[mask.titleId].images[@frames.previous].attr display: "none"
      @$masks[mask.titleId].paths[frameCurrent].attr display: ""

    # Change scroll slider position
    if @cfg.slider
      positionPercent = Math.floor (frameCurrent / (@frames.total-1) * 100)
      @$maskScrollSlider.css "left", "#{positionPercent}%"
      @$maskScrollTrack.css "width", "#{positionPercent}%"

    # Show selected path
    if @masks.current
      @pathSelect(@masks.current, frameCurrent)

    @frames.previous = frameCurrent
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

  WBTRotator::changeLocale = (e)->
    @cfg.language = $(e.target).val().toUpperCase()
    @updateLocalization()

  WBTRotator::updateLocalization = (duration = @cfg.animationDuration)->
    @$el.attr "lang", @cfg.language
    @localizeHeading(duration)
    @localizeCategories(duration)
    @localizeTitles(duration)
    @localizeDescriptions(duration)

  WBTRotator::localizeHeading = (duration)->
    $heading = $(".wbt-rotator-heading")
    $headingTextActive = $(".wbt-rotator-heading_text")
    $headingTextPrevious = $headingTextActive.clone().appendTo $heading
    $headingTextPrevious.css
      opacity: "0"
      position: "absolute"
      left: "0"
      top: "0"

    # Change heading text
    val = $.wbtRotator.l10n[@cfg.language].heading
    if val is "{{EN}}" or not val
      val = $.wbtRotator.l10n["EN"].heading
    $headingTextActive.text(val)

    # Animate
    $headingTextActive.css(opacity: 0).animate {opacity: "1"}, duration
    $headingTextPrevious.css(opacity: 1).animate {opacity: "0"}, duration, ->
      $headingTextPrevious.remove()


  WBTRotator::localizeCategories = (duration)->
    for category in $(".wbt-rotator-category_title")
      $category = $(category)
      $categoryPrevious = $category.clone().insertBefore $category
      $categoryPrevious.css
        opacity: "0"
        position: "absolute"
        left: "0"

      # Change heading text
      titleId = $category.data("title")
      if $.wbtRotator.l10n[@cfg.language].categories
        val = $.wbtRotator.l10n[@cfg.language].categories[titleId]
        if val is "{{EN}}" or not val
          val = $.wbtRotator.l10n["EN"].categories[titleId]
      else
        val = $.wbtRotator.l10n["EN"].categories[titleId]
      $category.text(val)

      # Animate
      animationCallback = ($itemsToRemove)->
        ->
          $itemsToRemove.remove()
      $category.css(opacity: 0).animate {opacity: "1"}, duration
      $categoryPrevious.css(opacity: 1).animate {opacity: "0"}, duration, animationCallback($categoryPrevious)


  WBTRotator::localizeTitles = (duration)->

    for titlesList in $(".wbt-rotator-category_wrap")
      $titlesList = $(titlesList)
      $titlesItems = $titlesList.find(".wbt-rotator-titles_item")
      $titlesItemsPrevious = $titlesItems.clone().appendTo $titlesList
      $titlesItemsPrevious.each (index, el)->
        $(el).css
          opacity: "0"
          position: "absolute"
          left: "0"
          right: "0"
          top: index * 30 + "px"

      # Change titles text
      $titlesItems.each (index, el)=>
        $el = $(el)
        titleId = $el.data("title")
        val = $.wbtRotator.l10n[@cfg.language].masks[titleId].title
        if val is "{{EN}}" or not val
          val = $.wbtRotator.l10n["en"].masks[titleId].title
        $el.attr("title", val).children("span").eq(0).text(val)

      # Sort titles
      $titlesItems.sort (a, b)->
        return 1 if $(a).text() > $(b).text()
        return -1 if $(a).text() < $(b).text()
        return 0
      $titlesItems.appendTo $titlesList

      # Animate
      animationCallback = ($itemsToRemove)->
        ->
          $itemsToRemove.remove()
      $titlesItems.css(opacity: 0).animate {opacity: "1"}, duration
      $titlesItemsPrevious.css(opacity: 1).animate {opacity: "0"}, duration, animationCallback($titlesItemsPrevious)

  WBTRotator::localizeDescriptions = (duration)->
    $descriptionsList = $(".wbt-rotator-descriptions_list")
    $descriptionsActive = $(".wbt-rotator-descriptions_item__active")
    $descriptionsPrevious = $descriptionsActive.clone().appendTo $descriptionsList
    $descriptionsPrevious.css
      opacity: "0"
      position: "absolute"
      left: "0"
      right: "0"
      top: "0"

    # Change descriptions text
    for titleId, $el of @$legendDescriptions
      val = $.wbtRotator.l10n[@cfg.language].masks[titleId].description
      if val is "{{EN}}" or not val
        val = $.wbtRotator.l10n["EN"].masks[titleId].description
      $el.html(val)

    # Animate
    $descriptionsActive.css(opacity: 0).animate {opacity: "1"}, duration
    $descriptionsPrevious.css(opacity: 1).animate {opacity: "0"}, duration, ->
      $descriptionsPrevious.remove()


  $.wbtError = (error) ->
    console.error error  if window.console and window.console.error
    return

  $.wbtIsTouch = ->
    (if ("ontouchstart" of window) or (window.DocumentTouch and document instanceof DocumentTouch) then true else false)

  $.fn.wbtRotator = (params) ->
    new WBTRotator(this, params)

  $.wbtRotator = {} || $.wbtRotator

  Array::rotate = (->
    push = Array::push
    splice = Array::splice
    (count) ->
      len = @length >>> 0
      count = count >> 0
      count = ((count % len) + len) % len
      push.apply this, splice.call(this, 0, count)
      this
  )()

  return
) jQuery