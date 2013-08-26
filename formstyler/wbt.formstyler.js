/**
 * wbt.formstyler.js v1.0.2
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
// TODO: separate basic styles and custom styles
// TODO: add tabindex and hotkeys
// TODO: input-file
// TODO: add custom templates
;(function($){
    var wbtFormStyler = {
        // Selects
        selectsRegisterEvents: function() {
            $("body")
                .on("click", ".wbt-input-select", function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    var $this = $(this);

                    if($this.hasClass("wbt-input-select__active")) {
                        $(".wbt-input-select").removeClass("wbt-input-select__active");
                    } else {
                        $(".wbt-input-select").removeClass("wbt-input-select__active");
                        $this.addClass("wbt-input-select__active");
                    }
                })
                .on("click", ".wbt-input-select_link", function(e){
                    e.stopPropagation();
                    var $this = $(this),
                        $item = $this.closest(".wbt-input-select_item"),
                        $select = $this.closest(".wbt-input-select"),
                        $text = $select.find(".wbt-input-select_text");

                    $item.siblings().removeClass("wbt-input-select_item__active").end().addClass("wbt-input-select_item__active");
                    $select.find("option").prop("selected", false).eq($item.index()).prop("selected", true);
                    $text.text($this.text());
                    $select.removeClass("wbt-input-select__active");
                    //$select.find('select').trigger('change');
                })
                .on("click", function(e){
                    $(".wbt-input-select").removeClass("wbt-input-select__active");
                });
        },
        selectsStyle: function($el) {
            $.each($el, function(index, el){
                var $el = $(el),
                    $elSelected = $el.find("option:selected"),
                    tempHTML = "";

                $el.wrap('<div class="wbt-input-select" />');

                tempHTML =
                    '<div class="wbt-input-select_selected">' +
                        '<span class="wbt-input-select_text">' + $elSelected.text() + '</span>' +
                        '<span class="wbt-input-select_button"></span>' +
                    '</div>';
                tempHTML += '<ul class="wbt-input-select_options">';
                $.each($el.find("option"), function(key, el) {
                    tempHTML += '<li class="wbt-input-select_item' + (key == $elSelected.index() ? " wbt-input-select_item__active" : "") + '"><div class="wbt-input-select_link">' + $(el).text() + '</div></li>';
                });
                tempHTML += '</ul>';
                $el.before(tempHTML);

                $el.addClass("wbt-input__styled wbt-input-select__styled");
            });
        },



        // Checkboxes
        checkboxesRegisterEvents: function() {
            //var _active_class = "wbt-input-checkbox__active";
            $("body")
                .on("click", ".wbt-input-checkbox", function(e){
                    e.preventDefault();
                    $(this).find(".wbt-input-checkbox__styled").click();
                })
                .on("click", ".wbt-input-checkbox__styled", function(e){
                    e.stopPropagation();
                    $(this).closest(".wbt-input-checkbox").toggleClass("wbt-input-checkbox__active");
                    //var wbt_input = $(this).closest(".wbt-input-checkbox");
                    //$(this).closest('.my-manager').find('.wbt-input-checkbox')
                        //.not(wbt_input[0]).removeClass(_active_class).find('input[type=checkbox]').attr('checked', false)
                    //wbt_input.toggleClass(_active_class);
                    //wbt_input.find('input[type=checkbox]').attr('checked', wbt_input.hasClass(_active_class));
                });
        },
        checkboxesStyle: function($el) {
            $.each($el, function(index, el){
                var $el = $(el);
                $el
                    .wrap('<div class="wbt-input-checkbox' + ($el.prop("checked") ? ' wbt-input-checkbox__active' : '') + '" />')
                    .before('<span class="wbt-input-checkbox_icon" />')
                    .addClass("wbt-input__styled wbt-input-checkbox__styled");
            });
        },

        // Radios
        radiosRegisterEvents: function() {
            $("body")
                .on("click", ".wbt-input-radio", function(e){
                    e.preventDefault();
                    $(this).find(".wbt-input-radio__styled").click();
                })
                .on("click", ".wbt-input-radio__styled", function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this
                        .prop("checked", true)
                        .closest(".wbt-input-radio").addClass("wbt-input-radio__active");

                    $(".wbt-input-radio__styled").filter("[name='" + $this.prop("name") + "']").not($this)
                        .prop("checked", false)
                        .closest(".wbt-input-radio").removeClass("wbt-input-radio__active");
                });
        },
        radiosStyle: function($el) {
            $.each($el, function(index, el){
                var $el = $(el);
                $el
                    .wrap('<div class="wbt-input-radio' + ($el.prop("checked") ? ' wbt-input-radio__active' : '') + '" />')
                    .before('<span class="wbt-input-radio_icon" />')
                    .addClass("wbt-input__styled wbt-input-radio__styled");
            });
        },


        // Ranges
        rangesRegisterEvents: function() {
            $("body")
                .on("mousedown", ".wbt-input-range_handle", function(e){
                    e.preventDefault();
                    var $this = $(this);
                    wbtFormStyler.ranges.pointerPressed = true;
                    wbtFormStyler.ranges.currentInstance = $this.closest(".wbt-input-range").data("wbtFormStyler.rangeInstance");
                    wbtFormStyler.ranges.currentInstance.activeHandle = wbtFormStyler.ranges.currentInstance.$handles.index($(this));
                })
                .on("mouseup mouseleave", function(e){
                    wbtFormStyler.ranges.pointerPressed = false;
                })
                .on("mousemove", function(e){
                    if(wbtFormStyler.ranges.pointerPressed) {
                        var a = Math.round(((e.pageX - wbtFormStyler.ranges.currentInstance.offset) + wbtFormStyler.ranges.currentInstance.min * wbtFormStyler.ranges.currentInstance.ticksWidth / wbtFormStyler.ranges.currentInstance.step) / wbtFormStyler.ranges.currentInstance.ticksWidth) * wbtFormStyler.ranges.currentInstance.step;
                        wbtFormStyler.rangesSetHandle(a);
                    }
                }).on("change", ".wbt-input-range__styled", function(){
                    var index = wbtFormStyler.ranges.currentInstance.activeHandle,
                        newVal = wbtFormStyler.ranges.currentInstance.$inputs.eq(index).val();
                    wbtFormStyler.ranges.currentInstance.$texts.eq(index).val(newVal);
                }).on("change", ".wbt-input-range_text", function(){
                    var index = wbtFormStyler.ranges.currentInstance.activeHandle = wbtFormStyler.ranges.currentInstance.$texts.index($(this)),
                        newVal = wbtFormStyler.ranges.currentInstance.$texts.eq(index).val();
                    wbtFormStyler.rangesSetHandle(newVal.replace(/[^\d.]/g, ""));
                });
        },
        rangesSetHandle: function(newTick) {
            if(newTick < wbtFormStyler.ranges.currentInstance.min) {
                newTick = wbtFormStyler.ranges.currentInstance.min
            }
            if(newTick > wbtFormStyler.ranges.currentInstance.max) {
                newTick = wbtFormStyler.ranges.currentInstance.max
            }

            var index = wbtFormStyler.ranges.currentInstance.activeHandle;
            wbtFormStyler.ranges.currentInstance.$inputs.eq(index).prop("value", newTick);
            wbtFormStyler.ranges.currentInstance.$inputs.eq(index).change();

            // Transform ticks to pixels
            newTick = (newTick - wbtFormStyler.ranges.currentInstance.min) * wbtFormStyler.ranges.currentInstance.ticksWidth;
            newTick = newTick / wbtFormStyler.ranges.currentInstance.step;

            // Set handle position
            wbtFormStyler.ranges.currentInstance.$handles.eq(wbtFormStyler.ranges.currentInstance.activeHandle).css("left", newTick);

            // Set selection position
            if(wbtFormStyler.ranges.currentInstance.$handles.length == 1) {
                wbtFormStyler.ranges.currentInstance.$selection.css("right", wbtFormStyler.ranges.currentInstance.width - newTick);
            } else {
                if(wbtFormStyler.ranges.currentInstance.$handles.eq(wbtFormStyler.ranges.currentInstance.activeHandle).hasClass("wbt-input-range_handle-second")) {
                    wbtFormStyler.ranges.currentInstance.$selection.css("right", wbtFormStyler.ranges.currentInstance.width - newTick);
                } else {
                    wbtFormStyler.ranges.currentInstance.$selection.css("left", newTick);
                }
            }
        },
        rangesInitInstance: function($el) {
            var newInstance = {};

            // Cache instance state
            newInstance.$el = $el;
            newInstance.$track = $el.find(".wbt-input-range_track");
            newInstance.$selection = $el.find(".wbt-input-range_selection");
            newInstance.$handles = $el.find(".wbt-input-range_handle");
            newInstance.$texts = $el.find(".wbt-input-range_text");
            newInstance.$inputs = $el.find(".wbt-input-range__styled");
            newInstance.min = parseInt(newInstance.$inputs.eq(0).prop("min")) || 0;
            newInstance.max = parseInt(newInstance.$inputs.eq(0).prop("max")) || 100;
            newInstance.step = parseInt(newInstance.$inputs.eq(0).prop("step")) || 1;
            newInstance.offset = newInstance.$el.offset().left;
            newInstance.width = newInstance.$track.width();
            newInstance.ticks = (newInstance.max - newInstance.min + newInstance.step) / newInstance.step;
            newInstance.ticksWidth = newInstance.width / (newInstance.ticks - 1);

            // Set initial state
            wbtFormStyler.ranges.currentInstance = newInstance;
            $.each(newInstance.$handles, function(index, el) {
                wbtFormStyler.ranges.currentInstance.activeHandle = index;
                wbtFormStyler.rangesSetHandle(newInstance.$inputs.eq(index).val());
            });

            newInstance.$el.data("wbtFormStyler.rangeInstance", newInstance);
        },
        rangesStyle: function($el) {
            // Sort inputs in groups according to name attribute
            var groups = {};
            $.each($el, function(index, el){
                var $el = $(el),
                    name = $el.prop("name");
                if(!groups[name]) {
                    groups[name] = $();
                }
                groups[name] = groups[name].add($el);
            });

            $.each(groups, function(index, $el){
                // Hide unstyled inputs
                $el.addClass("wbt-input__styled wbt-input-range__styled");

                // Add markup
                $el.eq(0)
                    .wrap('<div class="wbt-input-range" />')
                    .before(
                        '<div class="wbt-input-range_track">' +
                        '<div class="wbt-input-range_selection"></div>' +
                        '<span class="wbt-input-range_handle wbt-input-range_handle-first"></span>' +
                        ($el.length > 1 ? '<span class="wbt-input-range_handle wbt-input-range_handle-second"></span>' : '') +
                        '</div>' +
                        '<div class="wbt-input-range_text-wrap wbt-input-range_text-wrap-first"><input class="wbt-input-range_text wbt-input-range_text-first" type="text"></div>' +
                        ($el.length > 1 ? '<div class="wbt-input-range_text-wrap wbt-input-range_text-wrap-second"><input class="wbt-input-range_text wbt-input-range_text-second" type="text"></div>' : ''));

                // Move second input (if any) near first
                if($el.length > 1) {
                    $el.eq(1).insertAfter($el.eq(0));
                }

                // Initialize and store object in data attribute of wrapper
                wbtFormStyler.rangesInitInstance($el.parent(".wbt-input-range"));
            });
        },
        defaults: {
            watchDOMChanges: true
        }
    };

    $.fn.wbtFormStyler = function(params){
        // Init plugin on first run
        if(!wbtFormStyler.cfg) {
            wbtFormStyler.cfg = {};
            $.extend(wbtFormStyler.cfg, wbtFormStyler.defaults, params);

            wbtFormStyler.ranges = {};

            if(wbtFormStyler.cfg.watchDOMChanges) {
                var query = this;
                $(document).on("wbtDOMChange", function(){
                    $(query.selector).wbtFormStyler();
                });
            }
            // Register event handlers
            wbtFormStyler.selectsRegisterEvents();
            wbtFormStyler.checkboxesRegisterEvents();
            wbtFormStyler.radiosRegisterEvents();
            wbtFormStyler.rangesRegisterEvents();
        }

        // Style uninitialized inputs
        var filtered = this.filter(":not(.wbt-input__styled)");

        // Style them
        wbtFormStyler.selectsStyle(filtered.filter("select"));
        wbtFormStyler.checkboxesStyle(filtered.filter("input[type=checkbox]"));
        wbtFormStyler.radiosStyle(filtered.filter("input[type=radio]"));
        wbtFormStyler.rangesStyle(filtered.filter("input[type=range]"));

        return this;
    };
})(jQuery);