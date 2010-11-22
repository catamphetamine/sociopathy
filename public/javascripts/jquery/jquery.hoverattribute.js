/**
 * HoverAttribute jQuery plugin v1.0.7
 * by Alexander Wallin (http://www.afekenholm.se).
 *
 * Licensed under MIT (http://www.afekenholm.se/license.txt)
 * 
 * parseUri() method by Steven Levithan (http://blog.stevenlevithan.com/).
 * 
 * This plugin allows you to make (link-)elements more dynamic by making an attribute
 * of that element show up on hovering. This is mainly intended for <a> tags residing
 * within full-width elements, such as headings or list entries.
 * 
 * For comments, discussion, propsals and/or development; please visit
 * http://www.afekenholm.se/hoverattribute-jquery-plugin or send a mail to
 * contact@afekenholm.se.
 * 
 * @author: Alexander Wallin (http://www.afekenholm.se)
 * @version: 1.0.7
 * @url: http://www.afekenholm.se/hoverattribute-jquery-plugin
 * 
 * *************************************************************************************************
 * 
 * modified by
 * @author Kuchumov NIkolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */
(function($)
{	
	$.label_slider = function(element, options)
	{	
		// Escape conflicts
		var base = this
		
		// indent label contents for glowing, otherwise the glowing would be cut at the left and the right sides
		var indention_style_name = options["indention style name"]
		
		// Set options
		base.options = $.extend({}, $.label_slider.defaults, options)
		
		// Compability
		if (base.options.highlightURLPart == "domain") base.options.highlightURLPart = "host"
		
		// Cache elements
		base.$element = $(element)
		base.element = element
		
		// Store initial variables in the jQuery object.
		base.$element.$parent = base.$element.parent() // Not in use a.t.m.
		base.$element.initWidth = base.$element.width()
		base.$element.initHeight = base.$element.height()
		
		// Get the content of the element and the attribute
		var title_text = base.$element.html()
		var hint_text = base.$element.attr(base.options.attribute)
		
		base.init = function()
		{	
			base.setupCSS();
			
			if ((base.options.attribute == "href" || base.options.parseAsURL == true)
					&& base.options.parseAsURL != false)
					
			base.decorate_link();
			base.prepare();
			
			if (base.options.hover)
				base.setupHovering();
		};
		
		base.setupCSS = function() 
		{
			base.spanCSSDefaults = 
			{
				'display'		: 'block',
				'position'		: 'absolute',
				'top'			: '0',
				'overflow'		: 'hidden',
				'width'			: 'auto',
				'white-space' 	: 'nowrap'
			};

			base.visible_style = 
			{
				'opacity'		: '1'
			};

			base.hidden_style = 
			{
				'opacity'		: '0'
			};
			
			var twif = base.options.tweenInFrom,
				valHidden = '0';
			
			if (twif == 'left')			valHidden = '-10px';
			else if (twif == 'top') 	valHidden = '-' + base.$element.initHeight + 'px';
			else if (twif == 'right')	valHidden = '10px';
			else if (twif == 'bottom') 	valHidden = base.$element.initHeight + 'px';
			
			if (twif == 'left' || twif == 'right') {
				base.visible_style.left = '0';
				base.hidden_style.left = valHidden;
			}
			else if (twif == 'top' || twif == 'bottom') {
				base.visible_style.top = '0';
				base.hidden_style.top = valHidden;
			}
		}
		
		// If the href attribute is chosen, 
		// build a nice href depening on the options
		base.decorate_link = function()
		{
			hint_text = decorate_link(title_text, hint_text)
		}
		
		base.refresh = function()
		{
			hint_text = base.$element.attr(base.options.attribute)
			base.hint.html(hint_text)
		}
		
		base.prepare = function()
		{
			var title_styling = ['hoverattribute-title']
			var hint_styling = ['hoverattribute-attr']
			
			// indent label contents for glowing, otherwise the glowing would be cut at the left and the right sides
			if (indention_style_name)
			{
				title_styling.push(indention_style_name)
				hint_styling.push(indention_style_name)
			}
			
			$.merge(hint_styling, base.options.styles)
		
			// Set position to relative
			base.$element.css
			({
				'display'			: 'block',
				'position'			: 'relative',
				'width'				: base.$element.initWidth + 'px',// Set the element's width to
																// a fixed width.
				'height'	 		: base.$element.height() + 'px',
				'overflow'			: 'hidden'
			})
				.html("<label class='" + title_styling.join(' ') + "'>" + title_text + "</label>")
				// The attribute container is initially empty, so that the height is not affected
				// before applying proper CSS.
				.append("<label class='" + hint_styling.join(' ') + "'></label>");
			
			// the static label
			base.title = $("." + title_styling[0], base.$element)
			// the dynamic label
			base.hint = $("." + hint_styling[0], base.$element)
			
			// Give the element text ("title") the css properties of a showing part.
			base.title.css($.extend({}, base.spanCSSDefaults, base.visible_style));

			// Give the attribute text the css properties of a hidden part and insert the
			// attribute value.
			base.hint
				.css($.extend({}, base.spanCSSDefaults, base.hidden_style))
				// No fixed width to avoid line breaks.
				.css({'width':'auto', 'height':base.$element.initHeight + 'px'})
				.html(hint_text);
		};
		
		var animation_duration = base.options.animationTime * 1000;
		var easing = base.options.animationEase;
		
		var hidden
	
		base.hidden = function() { return hidden }
		
		base.slide_in = function()
		{
			$.proxy(base.start_effect, base.element)()
		}
		
		base.slide_out = function(delay)
		{
			if (delay)
			{
				base.hint.stop(true)
				setTimeout(base.slide_out, delay)
				return
			}
			
			$.proxy(base.stop_effect, base.element)()
		}
				
		base.start_effect = function()
		{
			// indent label contents for glowing, otherwise the glowing would be cut at the left and the right sides
			if (indention_style_name)
				base.$element.removeClass(indention_style_name)
			
			// If allowed, expand the element to the maximum width so that the attribute 
			// container (which is probably a description or a URL, and therefore probably
			// also longer/wider) will be fully visible.
			if (base.options.cssSettings.canExpandToFullWidth) 
			{
				$(this).css('width', base.$element.$parent.width() + 'px');
			}

			// Hide default text
			base.title
				.stop().animate(base.hidden_style, animation_duration, easing);

			// on appear trigger
			var on_appear = $.noop
			
			if (base.options.on_appear)
				on_appear = $.proxy(base.options.on_appear, $(".hoverattribute-attr", this))

			// Show attribute text
			base.hint
				.stop().animate(base.visible_style, animation_duration, easing, function() { hidden = false; on_appear() });			
		}
				
		base.stop_effect = function()
		{	
			// Show default text
			base.title
				.stop().animate(base.visible_style, animation_duration, easing);

			// Hide attribute text
			base.hint
				.stop(true).animate(base.hidden_style, animation_duration, easing, function()
				{	
					hidden = true;
				
					// When the attribute text is hidden, set the element to its initial width.
					// We don't want the element to be hoverable at the full parent width.
					//$(this).css('width', base.$element.initWidth + 'px');
				});
		}

		base.setupHovering = function()
		{
			// Setup the hover tweenings
			base.$element.
				bind('mouseover', base.start_effect).
				bind('mouseout', base.stop_effect);
		};
		
		// And the Lord said:
		base.init();
	};
	
	$.label_slider.defaults = 
	{
		attribute: "href",
		animationTime: 0.3,
		animationEase: "swing", // "linear"
		hover: true,
		tweenInFrom: "left", // "top", "right", "bottom"
		parseAsURL: null,
		removeProtocol: false,
		removeWWW: false,
		wrapLink: "after", // "before", "middle", "none"
		wrapLength: 60, // "auto", "none"
		highlightURLPart: "host", // "path", "query", "lastURIPart", "none"
		cssSettings: {
			canExpandToFullWidth: true
		}
	};
	
	// for multiple labels
	$.fn.label_slider = function(options)
	{
		return this.each(function()
		{
			new $.label_slider(this, options)
		})
	}
	
	// for single label
	$.fn.slide_label = function(options)
	{
		return new $.label_slider(this.get(0), options)
	}
	
	// miscellaneous

	function decorate_link(title_text, hint_text)
	{
		// Remove protocol
		if (base.options.removeProtocol) 
			hint_text = hint_text.replace(/^(mailto:|(http|https|ftp):\/\/)/, "");
		
		// Remove www
		if (base.options.removeWWW) hint_text = hint_text.replace("www.", "");
		
		// Shorten link
		if (base.options.wrapLink != "none") {
			
			var doWrapping = true,
				wrapLength = base.options.wrapLength; // Alias
			
			if (wrapLength == "auto")
				wrapLength = title_text.length - 3; // Same num of chars, minus "..."
			else if (wrapLength == "none" || wrapLength <= 0)
				doWrapping = false; // No wrapping
			
			// If the wrap length is valid and wrapping is neccessary (3 is for "..."),
			// wrap the attribute text.
			if (doWrapping && hint_text.length > wrapLength + 3) {
				
				// Where the user wants to wrap the attribute
				var wrapLink = base.options.wrapLink;
	
				if (wrapLink == "after") {
					hint_text = hint_text.substr(0, wrapLength) + "...";
				}
				else if (wrapLink == "before") {
					var numChars = hint_text.length,
						wrapStart = numChars - wrapLength;
					hint_text = "..." + hint_text.substr(wrapStart, numChars - 1);
				}
				else if (wrapLink == "middle") {
					var hrefStart = hint_text.substr(0, Math.floor(hint_text.length / 2)),
						hrefEnd = hint_text.substr(hrefStart.length, hint_text.length);
	
					hrefStart = hrefStart.substr(0, Math.floor(wrapLength / 2));
					hrefEnd = hrefEnd.substr(
						hrefEnd.length - Math.ceil(wrapLength / 2), 
						hrefEnd.length);
	
					hint_text = hrefStart + "..." + hrefEnd;
				}
			}
		}
		
		// Hightlight some part of the URL
		if (base.options.highlightURLPart != "none") {
			
			var urlParts = parseUri(hint_text),
				partName = base.options.highlightURLPart;
			
			base.highlightPart = function(str){
				hint_text = hint_text.replace(
					str,
					"<span class='hoverattribute-highlight'>" + str + "</span>");
			};
			
			// Custom highlightning of the last part of the URI
			if (partName == "lastURIPart") {
				var path = urlParts.path,
					lastPart = path.match(/[a-zA-Z0-9-_]+\/?$/i);
				base.highlightPart(lastPart);
			}
			// From parseUri() (see below)
			else if (urlParts[partName] != undefined && urlParts[partName] != "") {
				base.highlightPart(urlParts[partName]);
			}
			else {
				// Quiet, now.
			}
		}
		
		// result
		return hint_text
	}
})(jQuery);

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};