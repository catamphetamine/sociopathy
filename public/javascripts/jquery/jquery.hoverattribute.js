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
		var self = this
		
		// indent label contents for glowing, otherwise the glowing would be cut at the left and the right sides
		var indention_style_name = options["indention style name"]
		
		// Set options
		self.options = $.extend({}, $.label_slider.defaults, options)
		
		// Compability
		if (self.options.highlightURLPart == "domain") self.options.highlightURLPart = "host"
		
		// Cache elements
		self.$element = $(element)
		self.element = element
		
		// Store initial variables in the jQuery object.
		self.$element.$parent = self.$element.parent() // Not in use a.t.m.
		self.$element.initWidth = self.$element.width()
		self.$element.initHeight = self.$element.height()
		
		// Get the content of the element and the attribute
		var title_text = self.$element.html()
		var hint_text = self.$element.attr(self.options.attribute)
		
		self.init = function()
		{	
			self.setupCSS();
			
			if ((self.options.attribute == "href" || self.options.parseAsURL == true)
					&& self.options.parseAsURL != false)
					
			self.decorate_link();
			self.prepare();
			
			if (self.options.hover)
				self.setupHovering();
		}
		
		self.setupCSS = function() 
		{
			self.spanCSSDefaults = 
			{
				'display'		: 'block',
				'position'		: 'absolute',
				'top'			: '0',
				'overflow'		: 'hidden',
				'width'			: 'auto',
				'white-space' 	: 'nowrap'
			};

			self.visible_style = 
			{
				'opacity'		: '1'
			};

			self.hidden_style = 
			{
				'opacity'		: '0'
			};
			
			var twif = self.options.tweenInFrom,
				valHidden = '0';
			
			if (twif == 'left')			valHidden = '-10px';
			else if (twif == 'top') 	valHidden = '-' + self.$element.initHeight + 'px';
			else if (twif == 'right')	valHidden = '10px';
			else if (twif == 'bottom') 	valHidden = self.$element.initHeight + 'px';
			
			if (twif == 'left' || twif == 'right') {
				self.visible_style.left = '0';
				self.hidden_style.left = valHidden;
			}
			else if (twif == 'top' || twif == 'bottom') {
				self.visible_style.top = '0';
				self.hidden_style.top = valHidden;
			}
		}
		
		// If the href attribute is chosen, 
		// build a nice href depening on the options
		self.decorate_link = function()
		{
			hint_text = decorate_link(title_text, hint_text)
		}
		
		self.refresh = function()
		{
			hint_text = self.$element.attr(self.options.attribute)
			self.hint.html(hint_text)
		}
		
		self.prepare = function()
		{
			var title_styling = ['hoverattribute-title']
			var hint_styling = ['hoverattribute-attr']
			
			// indent label contents for glowing, otherwise the glowing would be cut at the left and the right sides
			if (indention_style_name)
			{
				title_styling.push(indention_style_name)
				hint_styling.push(indention_style_name)
			}
			
			$.merge(hint_styling, self.options.styles)
		
			// Set position to relative
			self.$element.css
			({
				'display'			: 'block',
				'position'			: 'relative',
				'width'				: self.$element.initWidth + 'px',// Set the element's width to
																// a fixed width.
				'height'	 		: self.$element.height() + 'px',
				'overflow'			: 'hidden'
			})
				.html("<label class='" + title_styling.join(' ') + "'>" + title_text + "</label>")
				// The attribute container is initially empty, so that the height is not affected
				// before applying proper CSS.
				.append("<label class='" + hint_styling.join(' ') + "'></label>");
			
			// the static label
			self.title = $("." + title_styling[0], self.$element)
			// the dynamic label
			self.hint = $("." + hint_styling[0], self.$element)
			
			// Give the element text ("title") the css properties of a showing part.
			self.title.css($.extend({}, self.spanCSSDefaults, self.visible_style));

			// Give the attribute text the css properties of a hidden part and insert the
			// attribute value.
			self.hint
				.css($.extend({}, self.spanCSSDefaults, self.hidden_style))
				// No fixed width to avoid line breaks.
				.css({'width':'auto', 'height':self.$element.initHeight + 'px'})
				.html(hint_text);
		};
		
		var animation_duration = self.options.animationTime * 1000;
		var easing = self.options.animationEase;
		
		var hidden
	
		self.hidden = function() { return hidden }
		
		self.slide_in = function()
		{
			$.proxy(self.start_effect, self.element)()
		}
		
		self.slide_out = function(delay)
		{
			if (delay)
			{
				self.hint.stop(true)
				setTimeout(self.slide_out, delay)
				return
			}
			
			$.proxy(self.stop_effect, self.element)()
		}
				
		self.start_effect = function()
		{
			// indent label contents for glowing, otherwise the glowing would be cut at the left and the right sides
			if (indention_style_name)
				self.$element.removeClass(indention_style_name)
			
			// If allowed, expand the element to the maximum width so that the attribute 
			// container (which is probably a description or a URL, and therefore probably
			// also longer/wider) will be fully visible.
			if (self.options.cssSettings.canExpandToFullWidth) 
			{
				$(this).css('width', self.$element.$parent.width() + 'px');
			}

			// Hide default text
			self.title
				.stop().animate(self.hidden_style, animation_duration, easing);

			// on appear trigger
			var on_appear = $.noop
			
			if (self.options['on appear'])
				on_appear = $.proxy(self.options['on appear'], $(".hoverattribute-attr", this))

			// Show attribute text
			self.hint
				.stop().animate(self.visible_style, animation_duration, easing, function() { hidden = false; on_appear() })			
		}
				
		self.stop_effect = function()
		{	
			// Show default text
			self.title
				.stop().animate(self.visible_style, animation_duration, easing);

			// Hide attribute text
			self.hint
				.stop(true).animate(self.hidden_style, animation_duration, easing, function()
				{	
					hidden = true;
				
					// When the attribute text is hidden, set the element to its initial width.
					// We don't want the element to be hoverable at the full parent width.
					//$(this).css('width', self.$element.initWidth + 'px');
				});
		}

		self.setupHovering = function()
		{
			// Setup the hover tweenings
			self.$element.
				bind('mouseover', self.start_effect).
				bind('mouseout', self.stop_effect);
		};
		
		// And the Lord said:
		self.init();
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
		if (self.options.removeProtocol) 
			hint_text = hint_text.replace(/^(mailto:|(http|https|ftp):\/\/)/, "");
		
		// Remove www
		if (self.options.removeWWW) hint_text = hint_text.replace("www.", "");
		
		// Shorten link
		if (self.options.wrapLink != "none") {
			
			var doWrapping = true,
				wrapLength = self.options.wrapLength; // Alias
			
			if (wrapLength == "auto")
				wrapLength = title_text.length - 3; // Same num of chars, minus "..."
			else if (wrapLength == "none" || wrapLength <= 0)
				doWrapping = false; // No wrapping
			
			// If the wrap length is valid and wrapping is neccessary (3 is for "..."),
			// wrap the attribute text.
			if (doWrapping && hint_text.length > wrapLength + 3) {
				
				// Where the user wants to wrap the attribute
				var wrapLink = self.options.wrapLink;
	
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
		if (self.options.highlightURLPart != "none") {
			
			var urlParts = parseUri(hint_text),
				partName = self.options.highlightURLPart;
			
			self.highlightPart = function(str){
				hint_text = hint_text.replace(
					str,
					"<span class='hoverattribute-highlight'>" + str + "</span>");
			};
			
			// Custom highlightning of the last part of the URI
			if (partName == "lastURIPart") {
				var path = urlParts.path,
					lastPart = path.match(/[a-zA-Z0-9-_]+\/?$/i);
				self.highlightPart(lastPart);
			}
			// From parseUri() (see below)
			else if (urlParts[partName] != undefined && urlParts[partName] != "") {
				self.highlightPart(urlParts[partName]);
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