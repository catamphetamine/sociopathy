/**
 * Text Button Fader
 * 
 * This script creates eye-candy buttons with smooth animated hover and click effects.
 * 
 * Usage:
 * 
 * In html:
 * 
 * <div class="float_centerer">
 *		<span class="button">
 *			<span class="button_label">Yes</span>
 *		</span>
 *			
 *		<span class="button">
 *			<span class="button_label">Cancel</span>
 *		</span>
 * 		
 * 		<hr class="float_centerer" />
 * 	</div>
 *
 * In javascript:
 * 
 *	$(document).ready(function()
 *	{
 *		text_button_fader.activate_buttons("images/button");
 *	});
 *
 * In stylesheet:
 * 
 *	div.float_centerer
 *	{
 *		margin-left: auto;
 *		margin-right: auto;
 *	
 *		display: table;
 *	}
 *
 *	hr.float_centerer
 *	{
 *		clear: left; 
 *		visibility: hidden;
 *	}
 * 
 * In filesystem:
 * 
 * graphics for generic buttons is described in the buttons.css file 
 * and is included in the distribution
 * 
 * Advanced usage example:
 * 
 * button_fader.activate_buttons("images/button", 
 *	{
 *		cancel: 
 *		{
 *			icon: "cross",
 *			"top offset": 13,
 *			spacing: 10,
 *			"text color": "#ad1c00",
 			action: function() { alert('cancel') },
			delay: "2x"
 *		},
 *		next: 
 *		{
 *			icon: "right arrows",
 *			floating: "right",
 *			"top offset": 14,
 *			spacing: 10
 *		}
 *	})
 * 
 * Requires jQuery. 
 * 
 * Distributed under GNU General Public License
 * http://www.gnu.org/licenses/gpl.html
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var text_button_fader = new (function()
{
	var ready_style_postfix = "_ready"
	var pushed_style_postfix = "_pushed"

	var ready_image_postfix = " ready"
	var pushed_image_postfix = " pushed"

	var image_format = "png"

	var button_style_name = "button"

	var default_icon_spacing = 10

	// style preset
	$(document).ready(function()
	{
		$("body").append
		(
			"<div id='style_preset' style='display: none'>" +
				"<span class='caution_button'></span>" +  
				"<span class='caution_button_ready'></span>" +  
				"<span class='caution_button_pushed'></span>" +  
			"</div>"
		)
	})
	
	// for all (text + background) buttons
	this.activate_all = function(images_path, _)
	{
		new generic_button_activator(images_path, _).activate()
	}
	
	// initialize each button
	this.for_each = function(action, _)
	{
		// parent container
		var parent
		
		if (_)
			parent = _.parent
			
		// for each button execute the action
		$("." + button_style_name).each(action)
	}
	
	// (text + background) button helper class
	function generic_button_activator(images_path, _)
	{
		// initialize member variables
		this.images_path = images_path
		this._ = _
		
		// main function
		this.activate = function()
		{
			var parent = this
			
			// initialize each button
			text_button_fader.for_each(function()
			{
				this.button_initializer = new button_initializer($(this), parent)
				this.button_initializer.initialize()
				
				// activate fading for this button
				button_fader.activate_fading
				(
					{
						button: this.button_initializer.button,
						"ready frame": this.button_initializer.button_ready,
						"pushed frame": this.button_initializer.button_pushed
					},
					this.button_initializer.additional_options
				)
			})
		}
		
		// creates button frames
		button_initializer = function(button, parent)
		{
			// initialize member variables
			this._ = parent._
			this.images_path = parent.images_path
			
			this.button = button
			this.button_ready
			this.button_pushed
			
			this.button_content
			this.button_ready_content
			this.button_pushed_content

			this.type = "generic"
		
			this.additional_options = {}
			
			// main function
			this.initialize = function()
			{
				this.initialize_member_variables()
				this.set_backgrounds()
				this.apply_standard_settings()
				this.customize()
			}
			
			this.initialize_member_variables = function()
			{
				this.create_button_frames()
				
				// initialize button type
				this.type = safely_get_attribute(button, "type", this.type)
			}
			
			this.create_button_frames = function()
			{
				this.create_other_buttons()
				this.clone_button_content()
			}
			
			// clone button content
			this.clone_button_content = function()
			{											
				this.button_content = $(":first-child", this.button)
				this.button_content.addClass("button_label")
			
				var message_node = this.button_content.contents().get(0)
				this.button_content.append("<span style='display: block; float: left'></span>")
				$(":first-child", this.button_content).append(message_node)
				
				this.button_ready_content = this.button_content.clone()
				this.button_pushed_content = this.button_content.clone()
				
				this.button_ready_content.appendTo(this.button_ready)
				this.button_pushed_content.appendTo(this.button_pushed)
			}
			
			// create other buttons				
			this.create_other_buttons = function()
			{
				this.button.append
				(
					"<span class='" + button_style_name + ready_style_postfix + "'></span>" +
					"<span class='" + button_style_name + pushed_style_postfix + "'></span>"
				);
						
				var inner_elements = $("> span", this.button)

				this.button_ready = $(inner_elements.get(1))
				this.button_pushed = $(inner_elements.get(2))
			}
			
			// set button frame backgrounds
			this.set_backgrounds = function()
			{		
				this.set_button_wrapper_background()			
				this.set_button_content_background()
			}

			// set button frame right-side backgrounds
			this.set_button_wrapper_background = function()
			{
				this.set_background(this.button, "right")
				this.set_background(this.button_ready, "right", ready_image_postfix)
				this.set_background(this.button_pushed, "right", pushed_image_postfix)
			}
			
			// set button frame left-side backgrounds
			this.set_button_content_background = function()
			{
				this.set_background($(this.button_content), "left")
				this.set_background($(this.button_ready_content), "left", ready_image_postfix)
				this.set_background($(this.button_pushed_content), "left", pushed_image_postfix)
			}
			
			// if there are any standard styles - apply them
			this.apply_standard_settings = function()
			{
				this.set_text_color(this.button_content)
				this.set_text_color(this.button_ready_content, ready_style_postfix)
				this.set_text_color(this.button_pushed_content, pushed_style_postfix)
			}
			
			// if there is standard text color for this button frame - apply it
			this.set_text_color = function(button_content, postfix)
			{
				// check postfix
				if (!postfix)
					postfix = ""
				
				// get style presets
				var preset = $("#style_preset > ." + this.type + "_button" + postfix)
				
				if (preset.length == 0)
					return
	
				// get preset text color
				var color = preset.css("color")
												
				if (!color)
					return
					
				// apply the text color
				button_content.css("color", color)
			}
			
			// user can customize button icon and text color
			this.customize = function()
			{
				for (var subtype in this._)
				{
					if (button.attr("subtype") !== subtype)
						continue
					
					this.customize_text_color(this._[subtype])
					this.customize_icon(this._[subtype])
					
					this.additional_options.action = this._[subtype].action
					this.additional_options.delay = this._[subtype].delay
					return
				}
			}
		
			this.customize_text_color = function(options)
			{
				// check text color
				var text_color = options["text color"]
				
				if (!text_color)
						return
					
				// set text color for ready button
				if (text_color.ready) 
					this.button_ready_content.css("color", text_color.ready)
	
				// set text color for pushed button
				if (text_color.pushed) 
					this.button_pushed_content.css("color", text_color.pushed)
			}
				
			this.customize_icon = function(options)
			{
				// check icon
				this.icon = options["icon"]
				
				if (!this.icon)
					return
					
				// apply options
				this.floating = safely_get(options["floating"], "left")
				this.top_offset = safely_get(options["top offset"], 0)
				this.spacing = safely_get(options["spacing"], default_icon_spacing)
				
				// add the icon to button
				this.add_icon(this.button_content)
				this.add_icon(this.button_ready_content, ready_image_postfix)
				this.add_icon(this.button_pushed_content, pushed_image_postfix)
			}
			
			this.add_icon = function(element, postfix)
			{
				// check postfix
				if (!postfix)
					postfix = ""
			
				// set icon margin type
				var margin_type
				
				if (this.floating == "right")
					margin_type = "left"
				else
					margin_type = "right"
			
				// generate icon code
				var code = 
				"<img " + 
					"style='" +
						"display: block; float: " + this.floating + "; " + 
						"padding-top: " + this.top_offset + "px; " + 
						"margin-" + margin_type + ": " + this.spacing + "px;' " + 
					"src='" + this.images_path + "/icon/" + this.icon + "/" + this.icon + postfix + "." + image_format + "'" + 
				"/>"
				
				// place the icon on the page
				if (this.floating == "right")
					element.append(code)
				else
					element.prepend(code)
			}
				
			// set element background image
			this.set_background = function(element, direction, postfix)
			{
				// check postfix
				if (!postfix) 
					postfix = ""
				
				// set background
				element.css("background-image", "url('" + this.images_path + "/" + this.type + "/" + direction + postfix + "." + image_format + "')")			
			}
		}
	}
})()
