/**
 * Form Slider
 * 
 * This script creates a form slider from predefined div frames.
 * 
 * Usage:
 * 
 * In html:
 * 
 * <div id="the_slider" class="slider">
 *		<div class="slide">
 *			<label for="song">La la la</label>
 *			<input type="text" name="song"/>
 *		</div>
 *			
 *		<div class="slide">
 *			<label for="drink">Vodka?</label>
 *			... markup for some fancy "vodka" web 2.0 control, which sets the hidden field value ...
 *			<input type="hidden" name="drink"/>
 *		</div>
 * 	</div>
 *
 * In javascript:
 * 
 *	$(document).ready(function()
 *	{
 *		var the_slider = new form_slider
 *		({
 *			id: "the_slider",
 *			width: 560,
 *			height: 263,
 *			"previous button": $("#previous"),
 *			"next button": $("#next"),
 *			"done button": $("#done"),
 *			fader: button_fader, // if you have it included
 *			fields:
 *			{
 *				song:
 *				{
 *					validate: function(song) { if (song.length == 0) throw "sing a song" }
 *				},
 *				drink:
 *				{
 *					control: ... javascript object for the fancy "vodka" web 2.0 control, which sets the hidden field value ...
 *					// this control must have a reset() function - that's the purpose of passing it here as an argument
 *				}
 *			}
 *		});
 *
 *		the_slider.activate();
 *	});
 *
 * Requires the original Slider
 * 
 * Requires jQuery. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

function form_slider(_) 
{
	this.slider = new slider(_)
	
	this.activate = function()
	{
		this.slider.activate()
		this.parse_fields(_)
	}
	
	// determine which form fields do the slides contain
	this.parse_fields = function(_)
	{
		// the data fields
		this.fields = []
				
		var form_slider = this;
		
		// for all the slides
		var slide_index = 1
		$("#" + _["id"] + " .slide").each(function() 
		{
			var slide = $(this);
			
			// create a field object for each form input on a slide
			$("input[name]", slide).each(function() 
			{
				var form_field = new field($(this))
				form_slider.fields.push(form_field)
	
				form_field.label = $("label[for='" + form_field.name + "']", slide)
				form_field.slide_index = slide_index
				
				apply_options(form_field, _)
			})
			
			// slide No counter (1, 2, ...)
			slide_index++
		})
	}

	// apply specific options to a field, if there are any
	function apply_options(field, _)
	{
		// if there are no combined field options - exit
		if (!_["fields"])
			return

		// this field options, passed upon form slider creation
		var field_options = _["fields"][field.name];
		
		// if there are no this field options - exit
		if (!field_options)
			return
		
		// specific control, which controls the value of this field
		field.control = field_options['control']
		// any validator can be passed for this field
		field.validate = field_options['validate']
	}
	
	// go to the next slide
	this.next = function()
	{
		// get the field for this slide
		// (currently there can be only one field per slide)
		var field = this.get_current_field()

		try
		{
			if (field)
			{
				// if there is any validation - validate this field value
				if (field.validate)
					field.validate(field.value())
					
					// mark field as valid
					field.valid()
			}
			
			// go to the next slide
			this.slider.next() 
		}
		// if there were any errors
		catch (error)
		{
			// if that's not our custom error - throw it further
			if (!(error instanceof custom_error))
				throw error

			// if that's our custom error - focus on the field and display the error message
			field.focus()
			field.error(error)
		}
	}
	
	// get the field for this slide
	// (currently there can be only one field per slide)
	this.get_current_field = function()
	{
		var slider = this.slider
		
		// the result will be placed here
		var current_field
		
		$.each(this.fields, function()
		{
			// search the slide by it's index (1, 2, ...)
			if (this.slide_index == slider.index)
				current_field = this
		})
		
		// result
		return current_field
	}
	
	// reset the form slider
	this.reset = function()
	{
		// reset the slider
		this.slider.reset()
		
		// reset each field
		$.each(this.fields, function()
		{
			this.reset()
		})
	}
	
	// gather the form data
	this.data = function()
	{
		var data = {}
		
		// gather the data from every field
		$.each(this.fields, function()
		{
			data[this.name] = this.value()
		})
		
		return data
	}
	
	// form field object
	function field(element)
	{
		if (!element)
			debug('element is undefined for a field')
		
		// the corresponding <input> element
		this.element = element
		// field name
		this.name = element.attr("name")
		
		// resets field value
		this.reset = function()
		{
			// if there is any custom fancy control, controlling this field value - reset this control too
			if (this.control)
				$.bind(this.control, this.control.reset)()

			// set empty value
			this.element.val('')
			
			// if there is any error message - hide it
			if (this.error_label)
				this.error_label.slide_out()
		}
		
		// get the field value
		this.value = function()
		{
			return this.element.val()
		}
		
		// mark the field as valid
		this.valid = function()
		{
			if (this.error_label)
				this.error_label.slide_out(1000)
		}
		
		// if this field has an error
		this.error = function(error)
		{
			// prepare the error label
			this.label.attr("error", new String(error.message).escape_html())

			// if the error label hasn't been created - create it
			if (!this.error_label)
			{
				this.error_label = this.label.slide_label
				({
				   attribute: "error",
				   tweenInFrom: "bottom",
				   wrapLength: "auto",
				   styles: ['error'],
				   hover: false,
				   on_appear: this.label.glow,
				   "indention style name": "glowable"
				})
				
				// and show it
				this.error_label.slide_in()
			}
			// else - refresh the label
			else
			{
				this.error_label.refresh()
				
				// and show it again, if it's hidden
				if (this.error_label.hidden())
					this.error_label.slide_in()
			}
		}
		
		// focus on the field
		this.focus = function()
		{
			this.element.focus()
		}
	}
}
