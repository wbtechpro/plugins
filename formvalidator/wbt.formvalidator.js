/**
 * wbt.validator.js v1.0.2
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
;(function($){
    var wbtFormValidator = {
        errors: [],

        tests: {
            "required": {
                "selector": "[required]",
                "handler": function($el, index){
                    if(!$el.data("wbt-formvalidator-errormessage-" + index)) {
                        $el.data("wbt-formvalidator-errormessage-" + index, "Заполните обязательное поле " + $el.attr("name"))
                    }

                    if(!$el.val()){
                        wbtFormValidator.raiseError($el, index);
                    }
                }

            },
            "email": {
                "selector": "[type=email]",
                "handler": function($el, index){
                    if(!$el.data("wbt-formvalidator-errormessage-" + index)) {
                        $el.data("wbt-formvalidator-errormessage-" + index, "Введите корректный e-mail")
                    }

                    var val = $el.val(),
                        regexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA	-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if(val && !regexp.test(val)){
                        wbtFormValidator.raiseError($el, index);
                    }
                }

            },
            "equalpasswords": {
                "selector": "[type=password]",
                "group": true,
                "handler": function($el, index){
                    if(!$el.data("wbt-formvalidator-errormessage-" + index)) {
                        $el.data("wbt-formvalidator-errormessage-" + index, "Пароли не совпадают")
                    }

                    if($el.length == 2 && $el.eq(0).val() != $el.eq(1).val()) {
                        wbtFormValidator.raiseError($el, index);
                    }
                }
            }
        },

        raiseError: function($el, index){
            var messageText = $el.data("wbt-formvalidator-errormessage-" + index);

            // If element is styled, find wrapper
            if($el.hasClass(".wbt-input__styled")){
                $el = $el.closest("[class^=wbt-input]");
            }
            $el.addClass(wbtFormValidator.cfg.classError);

            wbtFormValidator.errors.push( messageText );

            if($el.next().hasClass("wbt-formvalidator-message")) {
                $el.next().text( messageText );
            } else {
                $el.after(
                    $('<span></span>')
                        .addClass("wbt-formvalidator-message")
                        .text( messageText )
                );
            }

//            wbtFormValidator.errors.push( $el.data("validation-message") || "Указан неправильный e-mail");
//            wbtFormValidator.errors.push( "Введенные пароли не совпадают");
        },

        validate: function($form) {
            // Remove error messages
            wbtFormValidator.errors = [];
            $form.find("." + wbtFormValidator.cfg.classErrorsList).remove();
            $form.find("." + wbtFormValidator.cfg.classError).removeClass(wbtFormValidator.cfg.classError);

            // Run tests
            for(var index in wbtFormValidator.tests){
                var currentTest = wbtFormValidator.tests[index];
                if(currentTest.group) {
                    currentTest.handler($form.find(currentTest.selector), index);
                } else {
                    $form.find(currentTest.selector).each(function(){
                        currentTest.handler($(this), index);
                    });
                }
            }

            // Update error messages
            if(wbtFormValidator.errors.length && wbtFormValidator.cfg.showErrorsList) {
                wbtFormValidator.showErrorsList($form);
                return false;
            }

            if(window.debug) {
                return false;
            }

            return false;
        },

        showErrorsList: function($form){
            var htmlErrors = '';
            htmlErrors += '<ul class="' + wbtFormValidator.cfg.classErrorsList + '">';
            for(var i in wbtFormValidator.errors) {
                htmlErrors += "<li>" + wbtFormValidator.errors[i] + "</li>" ;
            }
            htmlErrors += "</ul>";
            $form.prepend(htmlErrors);
        },

        defaults: {
            watchDOMChanges: true,
            showErrorsList: true,
            classErrorsList: "wbt-formvalidator-errors",
            classError: "wbt-formvalidator-error"
        }
    };

    $.fn.wbtFormValidator = function(params){
        // Init plugin on first run
        if(!wbtFormValidator.cfg) {
            wbtFormValidator.cfg = {};
             $.extend(wbtFormValidator.cfg, wbtFormValidator.defaults, params);

            // Register event handlers
            if(wbtFormValidator.cfg.watchDOMChanges) {
                var query = this;
                $(document).on("wbtDOMChange", function(){
                    $(query.selector).wbtFormValidator();
                });
            }

            $(document).on("submit.wbtFormValidator", ".wbt-form__validated", function(){
                return wbtFormValidator.validate($(this));
            });
        }

        // Initialize uninitialized forms
        this
            .filter("form:not(.wbt-form__validated)")
            .addClass("wbt-form__validated")
            .attr("novalidate", "novalidate");

        return this;
    };
})(jQuery);