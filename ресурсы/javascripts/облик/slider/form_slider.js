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
 *	$(function()
 *	{
 *		var the_slider = new form_slider
 *		({
 *			id: "the_slider",
 *			width: 560,
 *			height: 263,
 *			buttons:
 *			{
 *				previous: new text_button('previous'),
 *				next: new text_button('next'),
 *				done: new text_button('done')
 *			},
 *			fields:
 *			{
 *				song:
 *				{
 *					// validate: function(song) { if (song.length == 0) throw "sing a song" }
 *				},
 *				drink:
 *				{
 *					control: ... javascript object for the fancy "vodka" web 2.0 control, which sets the hidden field value ...
 *					// this control must have a reset() function - that's the purpose of passing it here as an argument
 *				}
 *			}
 *		})
 *
 *		the_slider.activate()
 *	})
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

function form_slider(options) 
{
	/**
	 * constructor
	 */
	this.initialize = function()
	{
		this.slider = new slider(options)
		this.parse_fields(options)
		
		var self = this
	}
	
	this.on = function(event, handler)
	{
		this.slider.on(event, handler)
	}
	
	this.set_container = function($container)
	{
		var self = this
		
		$container.keydown(function(event) 
		{
			// if Enter key pressed
			if (event.keyCode == Клавиши.Enter)
			{
				options.buttons.next.push()
				return false
			}
			
			// if Tab key pressed
			if (event.keyCode == Клавиши.Tab) 
				return false
		})
	}
	
	// determine which form fields do the slides contain
	this.parse_fields = function(options)
	{
		// the data fields
		this.fields = []
				
		var self = this
		
		// for all the slides
		var slide_index = 1
		$(options.selector + " .slide").each(function() 
		{
			var slide = $(this)
			var form = new Form(slide.find('form').eq(0))
			
			// create a field object for each form input on a slide
			$("input[name]", slide).each(function() 
			{
				var form_field = new field($(this))
				self.fields.push(form_field)
	
				form_field.label = $("label[for='" + form_field.name + "']", slide)
				form_field.slide_index = slide_index
				
				// any validator can be passed for this field
				form_field.form = form
		
				apply_options(form_field, options)
			})
			
			// slide No counter (1, 2, ...)
			slide_index++
		})
	}

	// apply specific options to a field, if there are any
	function apply_options(field, options)
	{
		// if there are no combined field options - exit
		if (!options.fields)
			return

		// this field options, passed upon form slider creation
		var field_options = options.fields[field.name]
		
		// if there are no this field options - exit
		if (!field_options)
			return
		
		// specific control, which controls the value of this field
		field.control = field_options.control
	}
	
	// go to the next slide
	this.next = function(ok, error)
	{
		// get the field for this slide
		// (currently there can be only one field per slide)
		var field = this.get_current_field()

		// if there is any validation - validate this field value
		if (field)
		{
			if (field.form)
				field.form.validate(function()
				{
					// go to the next slide
					this.slider.next(ok)
					return true
				},
				error)
			else
				ok()
		}
	}
	
	this.done = function()
	{
		var self = this
		this.next(function()
		{
			self.final_actions()
		},
		function()
		{
			options.buttons.done.unlock()
		})
	}
	
	this.when_done = function(actions)
	{
		this.final_actions = actions
	}
	
	// get the field for this slide
	// (currently there can be only one field per slide)
	this.get_current_field = function()
	{
		var slider = this.slider
		
		// the result will be placed here
		var current_field
		
		this.fields.each(function(field)
		{
			// search the slide by it's index (1, 2, ...)
			if (field.slide_index == slider.index)
				current_field = field
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
		this.fields.each(function(field)
		{
			field.reset()
		})
		
		// if there is any error message - hide it
		this.fields.each(function(field)
		{
			if (field.form)
				field.form.reset()
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
				this.control.reset.bind(this.control)()

			// set empty value
			this.element.val('')
		}
		
		// get the field value
		this.value = function()
		{
			return this.element.val()
		}
	}
	
	// call the constructor
	this.initialize()
}