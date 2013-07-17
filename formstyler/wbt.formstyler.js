/**
 * wbt.formstyler.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
// TODO: separate basic styles and custom styles
// TODO: add tabindex and hotkeys
// TODO: range sliders, input-file
// TODO: add custom templates
;(function($){
    function WBTFormStyler($el, params) {
        this.cfg = $.extend(this.cfg, this.defaults, params);

        /* IE 7 and less won't get styled forms :( */
		if (!$.support.boxModel) {
			return;
		}   

        this.$el = $el;
        if(!this.$el) {
            this.$el = $("*");
        }

        this.elSelects = this.$el.filter("select");
        this.elCheckboxes = this.$el.filter("input[type=checkbox]");
        this.elRadios = this.$el.filter("input[type=radio]");
        this.isInitialized = {"selects": false, "checkboxes": false, "radios": false};   

		if(this.elSelects) { this.styleSelects(); }
		if(this.elCheckboxes) { this.styleCheckboxes(); }
		if(this.elRadios) { this.styleRadios(); }
    }

    WBTFormStyler.prototype.styleSelects = function() {
        $.each(this.elSelects, function(index, el){
            el = $(el);
            elSelected = el.find("option:selected");
            el.wrap("<div class=\"wbt-input-select_wrap wbt-input-select_select\" />");
            elHTML = "<a href=\"#\" class=\"wbt-input-select_current\"><span class=\"h-t\">" + elSelected.text() + "</span><span class=\"h-l\"></span><span class=\"h-r\"></span><span class=\"h-i\"></span></a>";
            elHTML += "<a href=\"#\" class=\"wbt-input-select_button\"></a>"
            elHTML += "<ul class=\"wbt-input-select_options\">";
            el.find("option").each(function(key, el) {
                elHTML += "<li class=\"wbt-input-select_item" + (key == elSelected.index() ? " active" : "") + "\"><span class=\"wbt-input-select_link\">" + $(el).text() + "</span></li>";
            });
            elHTML += "</ul>";
            el.before(elHTML);
            el.hide();
        });

        if(!this.isInitialized.selects) {
            this.isInitialized.selects = true;
            var self = this;
            $("body").on("click", ".wbt-input-select_select .wbt-input-select_current, .wbt-input-select_select .wbt-input-select_button", function(e){
                e.stopPropagation();
                e.preventDefault();
                $this = $(this);
                if($this.parent(".wbt-input-select_wrap").hasClass("active")) {
                    self.elSelects.parent(".wbt-input-select_wrap").removeClass("active");
                } else {
                    self.elSelects.parent(".wbt-input-select_wrap").removeClass("active");
                    $this.parent().addClass("active");
                }
            });
            $("body").on("click", ".wbt-input-select_select .wbt-input-select_link", function(e){
                e.stopPropagation();
                $this = $(this);
                id = $this.parent("li").index();
                $this.parent("li").addClass("active").siblings().removeClass("active");
                var $parent = $this.closest(".wbt-input-select_wrap");
                $parent.removeClass("active");
                $parent.find(".h-t").text($this.text());
                $parent.find("option").prop("selected", false).eq(id).prop("selected", true);
            });
            $("body").on("click", function(e){
                self.elSelects.parent().removeClass("active");
            });
        }
    };

    WBTFormStyler.prototype.styleCheckboxes = function() {
        $.each(this.elCheckboxes, function(index, el){
            el = $(el);
            checked = el.prop("checked");
            if(checked) {
                el.parent("label").addClass("active");
                el.wrap("<div class=\"wbt-input-checkbox_wrap active\" />");
                el.wrap("<span class=\"wbt-input-checkbox_icon\" />");
            } else {
                el.wrap("<div class=\"wbt-input-checkbox_wrap\" />");
                el.wrap("<span class=\"wbt-input-checkbox_icon\" />");
            }

            el.attr("style", "font-size:0;width:0;height:0;margin:0;padding:0;position:absolute;z-index:-1;opacity:0.01;");
        });

        if(!this.isInitialized.checkboxes) {
            this.isInitialized.checkboxes = true;
            $("body").on("click", ".wbt-input-checkbox_wrap", function(e){
                e.preventDefault();
                $this = $(this);
                $this.toggleClass("active");
                if($this.hasClass("active")) {
                    $this.parent("label").addClass("active").
                        find("input").prop("checked", true);
                } else {
                    $this.parent("label").removeClass("active").
                        find("input").prop("checked", false);
                }
            });
            $("body").on("click", ".wbt-input-checkbox", function(e){
                e.stopPropagation();
                $this = $(this);
                if($this.prop("checked")) {
                    $this.closest(".wbt-input-checkbox_wrap").addClass("active").
                        parent("label").addClass("active");
                } else {
                    $this.closest(".wbt-input-checkbox_wrap").removeClass("active").
                        parent("label").removeClass("active");
                }

            });
        }
    };

    WBTFormStyler.prototype.styleRadios = function() {
        $.each(this.elRadios, function(index, el){
            el = $(el);
            checked = el.prop("checked");
            if(checked) {
                el.parent("label").addClass("active");
                el.wrap("<div class=\"wbt-input-radio_wrap active\" />");
                el.wrap("<span class=\"wbt-input-radio_icon\" />");
            } else {
                el.wrap("<div class=\"wbt-input-radio_wrap\" />");
                el.wrap("<span class=\"wbt-input-radio_icon\" />");
            }

            el.attr("style", "font-size:0;width:0;height:0;margin:0;padding:0;position:absolute;z-index:-1;opacity:0.01;");
        });

        if(!this.isInitialized.radios) {
            this.isInitialized.radios = true;
            $("body").on("click", ".wbt-input-radio", function(e){
                e.stopPropagation();
                $this = $(this);
                $this.prop("checked", true);
                $this.closest(".wbt-input-radio_wrap").addClass("active").parent("label").addClass("active");

                $other = $(".wbt-input-radio[name='" + $this.attr("name") + "']").not($this);
                $other.prop("checked", false);
                $other.closest(".wbt-input-radio_wrap").removeClass("active").parent("label").removeClass("active");
            });
        }
    };

    $.fn.wbtFormStyler = function(params){
        return new WBTFormStyler(this, params);
    };
})(jQuery);