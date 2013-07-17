/**
 * wbt.priceformatter.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
;(function($){
    function wbtPriceFormatter($el, params) {
        this.cfg = $.extend(this.cfg, this.defaults, params);
        this.$el = $el;
        this.formatPrice();
    }

    wbtPriceFormatter.prototype.defaults = {
    };

    wbtPriceFormatter.prototype.formatPrice = function() {
		if(!this.$el) {
			return;
		}

		wrapProductPrice = $(this.$el).not(":contains(' ')");
		if(wrapProductPrice.length === 0) {
			return;
		}

		$.each(wrapProductPrice, function(index, value) {
			$this = $(value);
			// Get price
			var price = $this.text().split('.'),
				price_integer = price[0],
				price_decimal = price.length > 1 ? '.' + price[1] : '',
				rgx = /(\d+)(\d{3})/;
			
			// Add extra spaces
			while (rgx.test(price_integer)) {
				price_integer = price_integer.replace(rgx, '$1' + ' ' + '$2');
			}
			$this.text(price_integer + price_decimal);
		});
    };

    $.fn.wbtPriceFormatter = function(params){
        return new wbtPriceFormatter(this, params);
    };
})(jQuery);