!(function (root, factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(root.jQuery);
    }
} (this, function ($) {

    'use strict';

    var cssPrefixes = ['-webkit-', '-moz-', '-o-', ''],
        eventPrefixes = ['webkit', 'moz', 'MS', 'o', ''];

    function prefixedEvent(element, name, callback) {
        eventPrefixes.forEach(function (prefix) {
            if (!prefix) {
                name = name.toLowerCase();
            }

            element.on(prefix + name, callback);
        });
    }

    function SimpleMarquee(element, options) {
        this._element = $(element);
        this._options = $.extend({
            speed: 30,
            direction: 'left',
            cycles: 1,
            space: 40,
            delayBetweenCycles: 2000,
            handleHover: true,
            handleResize: true
        }, options);

        this._resizeDelay = parseInt(this._options.handleResize, 10) || 300;
        this._horizontal = this._options.direction === 'left' || this._options.direction === 'right';
        this._animationName = 'simplemarquee-' + Math.round((Math.random() * 10000000000000)).toString(18);
        this._cycles = -1;
        this._paused = false;

        // Binds
        this._onResize = this._onResize.bind(this);
        this._onCycle = this._onCycle.bind(this);

        // Events
        this._options.handleResize && $(window).on('resize', this._onResize);
        this._options.handleHover && this._element.on({
            'mouseenter.simplemarquee': this._onMouseEnter.bind(this),
            'mouseleave.simplemarquee': this._onMouseLeave.bind(this)
        });

        // Init!
        this.update();
        this._needsAnimation && this._onCycle();
    }

    // ----------------------------------

    SimpleMarquee.prototype.update = function () {
        this._reset();
        this._setup();

        // If no animation is needed, reset vars
        if (!this._needsAnimation) {
            this._paused = false;
            this._cycles = 0;
        // Pause it if the animation was paused
        } else if (this._paused) {
            this._pause();
        }

        return this;
    };

    SimpleMarquee.prototype.pause = function () {
        if (this._needsAnimation) {
            this._resetCycle();

            if (!this._paused) {
                this._pause();
                this._element.triggerHandler('pause');
                this._paused = true;
            }
        }

        return this;
    };

    SimpleMarquee.prototype.resume = function () {
        if (this._needsAnimation) {
            this._resetCycle();

            if (this._paused) {
                this._resume();
                this._element.triggerHandler('resume');
                this._paused = false;
            }
        }

        return this;
    };

    SimpleMarquee.prototype.toggle = function () {
        this._paused ? this.resume() : this.pause();

        return this;
    };

    SimpleMarquee.prototype.destroy = function () {
        this._reset();

        // Cancel timeouts
        this._resizeTimeout && clearTimeout(this._resizeTimeout);

        // Clear listeners
        $(window).off('resize', this._onResize);
        this._element.off('.simplemarquee');

        this._element.removeData('_simplemarquee');
        this._element = null;
    };

    // --------------------

    SimpleMarquee.prototype._reset = function () {
       var contents = this._element.children('simplemarquee-wrapper').eq(0).contents();

       // Reset styles
        this._element.css({
            'word-wrap': '',      // Deprecated in favor of overflow wrap
            'overflow-wrap': '',
            'white-space': '',
            'overflow': '',
        });

        // Reset contents
        if (this._originalContentsWrapper) {
            contents = this._originalContentsWrapper.contents();
            this._element.append(contents);
            this._wrappers.remove();
            this._element.children('style').remove();

            this._originalContentsWrapper = null;
        }

        this._wrappers = null;
        this._size = null;
        this._needsAnimation = false;

        // Reset cycle timer
        this._resetCycle();
    };

    SimpleMarquee.prototype._setup = function () {
        var contents,
            wrapper;

        // Set necessary wrap styles and decide if we need
        // the marquee based on the contents
        if (this._horizontal) {
            this._element.css({
                'word-wrap': 'normal',      // Deprecated in favor of overflow wrap
                'overflow-wrap': 'normal',
                'white-space': 'nowrap',
                'overflow': 'hidden',
            });

            // Check if marquee is necessary
            if (this._element[0].scrollWidth <= this._element.outerWidth()) {
                this._needsAnimation = false;
                return;
            }

            this._size = this._element.outerWidth();
        } else {
            this._element.css({
                'word-wrap': 'break-word',      // Deprecated in favor of overflow wrap
                'overflow-wrap': 'break-word',
                'white-space': 'normal',
                'overflow': 'hidden',
            });

            // Check if marquee is necessary
            if (this._element[0].scrollHeight <= this._element.outerHeight()) {
                this._needsAnimation = false;
                return;
            }

            this._size = this._element.outerHeight();
        }

        this._needsAnimation = true;

        // Wrap contents
        contents = this._element.contents();
        wrapper = $('<div class="simplemarquee-wrapper"></div>');
        wrapper.append(contents);
        this._element.append(wrapper);
        wrapper = $('<div class="simplemarquee-wrapper"></div>');
        wrapper.append(contents.clone());
        this._element.append(wrapper);

        this._wrappers = this._element.children();
        this._originalContentsWrapper = this._wrappers.eq(0);

        // Use display inline block for the wrappers
        this._horizontal && this._wrappers.css('display', 'inline-block');

        // Define space between wrappers
        this._wrappers.eq(1).css('margin-' + (this._horizontal ? 'left' : 'top'), this._options.space);
        this._size += this._options.space;

        // Build the animation
        this._setupAnimation();
    };

    SimpleMarquee.prototype._setupAnimation = function () {
        var styleStr;

        // Add the style element
        styleStr = '<style>\n';
        cssPrefixes.forEach(function (prefix) {
            styleStr += '@' + prefix + 'keyframes ' + this._animationName + ' {\n';

            switch (this._options.direction) {
            case 'left':
                styleStr += '    0% { ' + prefix + 'transform: translate(0, 0) } \n';
                styleStr += '   100% { ' + prefix + 'transform: translate(calc(-100% - ' + this._options.space + 'px), 0) }\n';
                break;
            case 'right':
                styleStr += '    0% { ' + prefix + 'transform: translate(calc(-100% - ' + this._options.space + 'px), 0) }\n';
                styleStr += '    100% { transform: translate(0, 0) } \n';
                break;
            case 'top':
                styleStr += '    0% { ' + prefix + 'transform: translate(0, 0) } \n';
                styleStr += '   100% { ' + prefix + 'transform: translate(0, calc(-100% - ' + this._options.space + 'px)) }\n';
                break;
            case 'bottom':
                styleStr += '   0% { ' + prefix + 'transform: translate(0, calc(-100% - ' + this._options.space + 'px)) }\n';
                styleStr += '    100% { ' + prefix + 'transform: translate(0, 0) } \n';
                break;
            default:
                throw new Error('Invalid direction: ' + this._options.direction);
            }

            styleStr += '}\n';
        }, this);

        styleStr += '</style>\n';

        // Append the style and associate the animation to the wrappers
        this._element.append(styleStr);
        this._wrappers.css('animation', this._animationName + ' ' + (this._size / this._options.speed) + 's linear infinite');

        // Setup animation listeners
        prefixedEvent(this._originalContentsWrapper, 'AnimationIteration', this._onCycle);
    };

    SimpleMarquee.prototype._pause = function () {
        this._wrappers.css('animation-play-state', 'paused');
    };

    SimpleMarquee.prototype._resume = function () {
        this._wrappers.css('animation-play-state', '');
    };

    SimpleMarquee.prototype._resetCycle = function () {
        if (this._cycleTimeout) {
            clearTimeout(this._cycleTimeout);
            this._cycleTimeout = null;
        }
    };

    SimpleMarquee.prototype._onCycle = function () {
        this._resetCycle();

        this._cycles += 1;

        // Pause if reached the end
        if (this._cycles >= this._options.cycles) {
            this.pause();
            this._element.triggerHandler('finish');
        // Otherwise pause it and schedule the resume
        } else {
            this._pause();
            this._element.triggerHandler('cycle');

            this._cycleTimeout = setTimeout(function () {
                this._cycleTimeout = null;
                this._resume();
            }.bind(this), this._options.delayBetweenCycles);
        }
    };

    SimpleMarquee.prototype._onMouseEnter = function () {
        // Restart if already finished
        if (this._paused) {
            this._cycles = 0;
            this.resume();
        } else {
            this.pause();
        }
    };

    SimpleMarquee.prototype._onMouseLeave = function () {
        this.resume();
    };

    SimpleMarquee.prototype._onResize = function () {
        if (this._resizeTimeout) {
            return;
        }

        this._resizeTimeout = setTimeout(function () {
            this._resizeTimeout = null;
            this.update();
        }.bind(this), this._resizeDelay);
    };

    // -----------------------------------------------

    $.fn.simplemarquee = function (options) {
        var instance;

        instance = this.data('_simplemarquee');

        // .simplemarquee('method')
        if (typeof options === 'string') {
            if (!instance) {
                throw new Error('simplemarquee was not initialized');
            }

            instance[options]();
        // .simplemarquee({})
        } else {
            // Small validation
            if (this.length > 1) {
                throw new Error('simplemarquee only works on one element');
            }

            if (!instance) {
                instance = new SimpleMarquee(this, options);
                this.data('_simplemarquee', instance);
            }
        }

        return this;
    };

    return $;
}));
