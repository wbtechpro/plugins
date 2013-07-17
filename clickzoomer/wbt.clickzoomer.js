/**
 * wbt.clickzoomer.js v1.0.0
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2012, WBTech
 * http://wbtech.pro/
 */
;(function($){
    function WBTClickZoomer($el, params) {
        this.cfg = $.extend({}, WBTClickZoomer.prototype.defaults, params);

        this.$image = $el.addClass("wbt-clickzoom-image");
        this.$wrap = this.$image.wrap('<div class="wbt-clickzoom-wrap">').parent().css({
            "width": this.$image.width(),
            "height": this.$image.height()
        });
        this.imageWidth = Math.round(this.$image.width() / 2);
        this.imageHeight = Math.round(this.$image.height() / 2);
        this.lensRadius = 30;

        this.createPoints(this.cfg.points.length);
        this.registerEvents();
    }

    WBTClickZoomer.prototype.defaults = {
        "points": [],
        "createPointDelay": 200,
        "animationSpeed": 400,
        "zoom": 4,
        "lensImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAADm5JREFUeNrkWwlslFUe/2Y6M51e0xN609LSk3KkCLU2XLYhATcUDd0ouCBCollAAgSXxDUGXHddYFlDdRVEC8YsZsXuuiwsWGlqoYJdwHBVSilHy9WDnjOd3rO//+d73dfnN2VaCtvEL/nnm+9+v/f7n++90el0OuXntOmVn9lmeMjv12mIIuwdwl4U8dqIBiwCcxP2XPQaWkXAeiC9bM9/c3EMJ3jDMIHk5sGB0XtN0p6Lm8QwgeoWpItJJzsWO8Fx5syZfuBTU1MfGWDOpF4A6c4AekDMdJySkjJq3rx5SZGRkWNNJpMlMDAwDHtvo9Fotlqt92w2W0NLS0ttQ0NDzbffflv21VdfVeO5Dogd0s5+d7BO6AFATeAuN3qIXpoD5ayZGUhPiFdWVtbYp59+OisqKmp6aGjo+MF8BMCrq6qqir/55pvCvXv3nsMpG5M2BryTs06gB8vwUADLjBJIH4jltddey5o5c+bSoKCgBPGBW7duKY2NjUpHR4fS1NSkdHZ2Kl1dXYqXl5cq3t7eqowaNUo95hvYrwWoz95888399fX193CqlQG3CyYwKBsfDGCuwgTUyIB6Q/zWrFkzMzs7e7Wfn18Ma6gK8tq1ay2QQgA9ClW+BMavrV69ulV0XF988QWpZ/zdu3cTent7p44dO3Z+dHR0SFhYmIKOU++x2+1NJSUlu1999dXPcdgIaWHAuZ33ugraVcCiChOrRINvRERE2NatW9cnJCTMo5vQaAKplJaW7jEYDJ99+OGHp3B6FHUK04qBNmpwEwFau3ZtKDQhJzExcWNycrIC+1dvqK2tvbBly5ZNhYWF5Qy4ldk5d26O4QAsgjUz9Q0Ao5PB7B/AahjddOrUKQUs/BWquTs3N/cmA/ogaVwzOrOnrKxsBRzfOrJVf39/pb293Z6fn/+7bdu2HSaTF9h2CfT9AItgPRjYwJdffnn20qVLf+/u7m6+ffs2AT1dV1e3fdeuXSdwPWSYM7h769at84fN/3rGjBnPx8XFKQ5sRUVF769fv34vrtdR5zDQXfdT7/sB1jN7JWYtkCCwOnfx4sWbobJuly9fVo4ePbpr1qxZf3juueeCH2LmRgCuLVu2bG1mZuYGMK6eRBjbs2rVqg9I2xlo2/1s2m0AwDrBZlVmly9fPmvJkiVvIY4aoGrKkSNHtu7evfvtCRMmjHHBRh80ufFfsGBB8TvvvHMX9p05btw4su3JY8aMscGmKwWV7h0KYJ4SmpgnDkxPTx+/YcOGHR4eHu7l5eVKQUHB63l5eXtwLfIBbXUwmzd8x7k9e/aUtra2LoiJiVEAPE2v11+FD7nNVHpIDHO7JW/s5+npGQZHtB2hJbiyslI5dOjQ2wD7CbPXR72Z58+fXwXNuoKYPSc4OFgXHx+fBsDH4MWtUqhyqTzk7LozdgM2bdq0CHFxHCUPxcXFuwE29/8Eto/pjz/++F/wH29TGPTB9sYbb6yntjLzMzPCdK4AFkOQJSMjIwHyK7rw3XffKRMnTtyMn9EjoLQNQsfvOHHixF7K4GJjYx9fsWLFDMoPWFJkYFh0AwHmYcjE1fmll15aZjabTeSRKyoqnofjCnqENnu/Laq7u/vP58+fVw9ycnJWkr9hmmnWcqR6J+qsJhiPPfZYLLKd6XQBLz3w0UcfFbHeGymb2/bt29uRB/yWsjzk4qEIm7NZCPUQWHYKmLNLoCwvvvjiMxRvwSyldX/EufAROGoTtHDhwg/IlmlDnF4oqLVJqr/7ARZDEd3sm5SUNIsuQJ2/37lzZyVLQkbc9tRTTwWcPXuWCFHCw8PHpaWlxTCTdJftWO/EO3shq5nq6+vrQ6njlStXduBc8AgemwuCJn5CfoZSRzCeyQCbGUlOAffVuLDfNDpJgJHKHWGOYMSOvr777rt1UOsbdIASc4rguIwiTr1G3kyAPVD6TWCALyJJdygjf/Otrq4mYhS0PQqFjTfD0i886TVGMlQbRvE9Wi1V7t07jjjnQyMUPT09Iw5lb2+vOnqCNvrabLZCGlGhXP+JJ54YwwBrMiyOZpiQnwYiZzZSQG9paTmDF3nSKIbValXFbrerH0GV9sgB0jcRe6kuVnibaN/W1ubu5uZ2uaGhQb0PZjiWkWcUPbVBI8MyIptSi/rmZqq4lCt4mVm9Qa/vEziJnwidf5ggRSFt40IsE6CpU6feJPCqF/txfMgkjIf3A6wTBsndvL291eSCWKQCG71o4YCp2EBP9onRaPwJcH7tQeatCAgHRntuUiJoAsqFNtTlHcePHye7c4OG+gjj4HothvtmDFAd9QHGTyt6zdKnBoxhDoqDJOBiB4idwjuK72X2qMF8LzIngnXGLj3HTQvvduvs7KShXE+kwz4CiTpnA/EqaDzUy8HBjnWkJsJL+7EsMuuMbdEU+Ds4WO546LcMlIszwLyThHb1UmZIx8DQpTGnpTkk40BxTSOBKgC82ALAeG+v3hWWRba1QPMO44B5o7nItspVmYPmnSGqstCmHnhosltyYjatMWuDNG6kzvUgntFwKR8UDwHgOrzczBvI1VPLluW9eA+3ay3AIrMiQJFdDl5DldX2HDt2zDM9PV19OUhr1ZiR7APsECa2aAqjFi91WCwWHQJ4InrrBo7NXPW0WHYGWAQtqrVsw1o2K+7FzuDsSp3fjRAai3RYfe/Vq1dr5Ik4mWE+XdkN/W+vr69vCw4O9kLJlYa4m4+PBTj5kFPQonoPxLDsqLQAO7NdIUxaIWmhoaHqtZMnT1bxCTgtwOK0pTpVWVVVVQ3AiZAZNNWBj0by3pVVSbbXgdRaBMwdFmdYVueB2JUdKL7VHBUV9QybAWm5detWkzTl6tCy4W52k72srOwsAnliZGRk2JdffumPhLwbHzSI9sM/OFAyMhBg2YZFpyQLv0e2Xf5eXGtAW9XBigoq4H+ccOsQBucVLZXu5nOz+/bt+8+iRYty0Gt61JjLEZ7y0Nthci9rJSMc5IM4LbkDRHOSTQrsWlEppUyePFnNF4qKik6yQfkOedhWZriL3dRWW1tbf+7cuetTpkyJQW694uLFi2/BtkPxcZ34cTnl1AItXnem0lpxWE4wtL5JZoPz1ZMmTdpL9gvfY4dGnmeA7a4w3M5m5VqOHDlylACD4VD02jyka9+jIeG8x7WSERk4P8fZdealOcsi2+JvrTBE78Q9Lcj5TdOnT/8FXYOzKmUTbLb7qTQH3ckmppr3799/5tlnn22MiYnxz8zM3F5cXBwHtQ4GYIOQtPdrhMy2FruySsvJh2g2sjZJnpnOX4cq58H0KNnozs3N/TebduWA+80oyjMP/cpEGjGA7XYiKU9FfPNDQqJHvXkUoP1llZMZkR2QGGL4CgC+l3+LIqeTEvh6tD8Ote8Wir+HDx8+cfDgwWKcv8OmUlsZgb0DTbXoxQG98vLydqg1TVpZkLXNqKys/BSdYMPHPUSQWgzxvZb3lUOP/Fu2Y9Fhsa0d7anMzs4+HB0dHVBXV9f+yiuvvI/nKf7WsAlzu7AswqXJNBX0pUuX6ubOnZsOp6BH6TgFx1vRCH80wiirnayKMvPisdwRWvFW9s4McA/afXHatGn7UlNT0+n6tm3bPr1w4cI5xm4980Od8hyTFmCxulDr44aGBkd7e3tHRkZGyujRo8PxgUkIA+9hHwQxiI0RbVKrA2SnpNUZ4nMSq2qBAPkhOTl5K0xtMdUKBw4cOLNz585/0voZxm6TFrsDMSwm3GpNid6zAmxYUlJSCFQoAQ4i9ubNmx+gMT4QswxYjrPOOkEGqdV5/F0A2oH2Xpg4ceLrWVlZa8hu0a6aDRs27MJ7SJVvM9u1abF7vwnxn7AOL12FmBxPXjs+Pn4CYuDjSNj3Wq3Wbj6MK4PV6oCBNEJ+Rgh7zaTG8CfvAexqWu8B/9K8cuXKHej8qwxsPQtJHc7We7gKmD+oKygoqADgWGwBCAWxYH3hnTt3ilGN/cDmdNy0BvcGAutsMJABdUBuwn/UzZkz5+CTTz75DA3IIPVtgpPKbWxspDTyprDsoU1LlV0F7BDSsr6lBF9//XUF1MkXdhQREBDgj8YshTPzuH79eh57zmsYFrY4oMJ1aF/5+PHjfwmwf09JSUmm+FtSUlK9Zs2av0C7rghgG11Z2OIqw71K/9WuPfho1Y0bNxrgJRMB2C0uLm4aQtcqqLkNlcrfmNPQsbFhncy2yKK8XAnnagCsIiIiYtr8+fP/gTi7JCQkxBOx2pGXl1eyefPmTxF+rjOwNcxu24RycMireMQQZWTMWdgaLJprCgsMDIzeuHHjwtmzZ8eyMTBahdcKOQSH8ifE7dMA6Mcm6NyFyXZFyN1JBdvQliZUPKHIi3+DsjQ7KCgonJYjsunaewg9n2N/iXljHn4aBSfV42ypw2AAy6A9GGh/yGgGPDgtLS3phRdemIt931IIGrBHbWpHUvA9MrQL6JB6ePYTyH3vsFtMiYmJtIrPw8/Pbwo6bzJ8gp/F0jdIqqDDrKjcCvLz809TqcuE1mbdYzZrdxXsYACLoDlDXmwe1p8xTgPfQVDtMTk5ORmwN5pM9xqK8cIJdp4+fbqqsLCwFEXLJcZkPQPawOKsVYi1LoEdLGBxwN4gsO0tMM6FOsIX6klrpScnJCTEwB59UUxQbU0Di30fhR/ohMrTwGErtKEGSUQpTOE2Cy9NTBqZNDOgbULocWmN5VAB9xuwF6ZXOePebBUNF292ni8YN0nLEMRRlg6hNOXSysQq1Ld8Memglw4PFbDMtrjk352Bk8VdcFgGodP6Bg4F0ByUXfnf2ugOwbmpIxh8RfyjWCDuDLhecGwmoQOMSv//PeglhnsE0F0C8E7hWFTdB/rTh24Y/6ilk8CLfxEwSOd1Us7eI7HdLRwP6z9bdA/pn2k6iX2dNBetlbY6JHDD+vedhw14xG7/FWAACIN7sTCsubIAAAAASUVORK5CYII="
    };

    WBTClickZoomer.prototype.createPoints = function(i) {
        var self = this;
        setTimeout(function() { 
            if (i--) {
                $("<a></a>", {
                    "class": "wbt-clickzoom-point wbt-clickzoom-point_animate",
                    "href": "#",
                    "data-zoom": self.cfg.zoom
                }).css({
                    "left": (self.cfg.points[i].x / self.cfg.zoom) - self.lensRadius,
                    "top": (self.cfg.points[i].y / self.cfg.zoom) - self.lensRadius
                }).append($("<img>", {
                    "class": "wbt-clickzoom-lens",
                    "src": self.cfg.lensImage
                })).appendTo(self.$wrap);

                $("<img>", {
                    "class": "wbt-clickzoom-image_zoomed",
                    "src": self.cfg.points[i].src
                }).appendTo(self.$wrap);

                self.createPoints(i);
            }
        }, self.cfg.createPointDelay);
    };

    WBTClickZoomer.prototype.registerEvents = function() {
        this.$wrap.on("click.wbt-clickzoom", ".wbt-clickzoom-point", $.proxy(this.pointZoomIn, this));
        this.$wrap.on("click.wbt-clickzoom", ".wbt-clickzoom-image_zoomed", $.proxy(this.pointZoomOut, this));
        this.$wrap.on("mouseover.wbt-clickzoom", ".wbt-clickzoom-point", function() { $(this).removeClass("wbt-clickzoom-point_animate"); });
    };

    WBTClickZoomer.prototype.pointZoomIn = function(e) {
        e.preventDefault();
        var $this = $(e.currentTarget);

        this.$image.animate({
            "opacity": .8,
            "margin-left": this.imageWidth - this.cfg.zoom * ($this.position().left + this.lensRadius),
            "margin-top": this.imageHeight - this.cfg.zoom * ($this.position().top + this.lensRadius),
            "width": this.imageWidth * this.cfg.zoom * 2,
            "height": this.imageHeight * this.cfg.zoom * 2
        }, this.cfg.animationSpeed, function() {
            $this.next(".wbt-clickzoom-image_zoomed").animate({opacity: "show"}, 200);
        });
        this.$wrap.find(".wbt-clickzoom-point").fadeOut(200);
    };

    WBTClickZoomer.prototype.pointZoomOut = function(e) {
        var $this = $(e.currentTarget),
            self = this;
        $this.animate({opacity: "hide"}, 200, function() {
            self.$image.animate({
                "opacity": 1,
                "margin-left": 0,
                "margin-top": 0,
                "width": self.imageWidth * 2,
                "height": self.imageHeight * 2
            }, self.cfg.animationSpeed, function() {
                self.$wrap.find(".wbt-clickzoom-point").fadeIn(200).addClass("wbt-clickzoom-point_animate");
            });
        });
    };

    $.fn.wbtClickZoomer = function(params){
        return new WBTClickZoomer(this, params);
    };
})(jQuery);