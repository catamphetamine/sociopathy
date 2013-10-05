var Step_by_step_dialog_window = new Class
({
	Implements: [Options],
	
	buttons: {},

	initialize: function(options)
	{
		this.options = $.extend(true, this.options, options)
		//this.setOptions(options) // doesn't work - mootools bug
		
		this.process_template()
		
		this.initialize_buttons()
		this.initialize_slider()
		this.initialize_dialog_window()
	},
	
	open: function()
	{
		this.dialog_window.open()
	},
	
	process_template: function()
	{
		var template = $.render('пошаговое окошко', {})
		
		template = $('<div/>').append(template)
		
		var wrapper = $(template.find('> [type=wrapper]').children()[0])
		var ending = template.find('> [type=ending]').children()
		
		var slides = this.options.dialog_window.children()
		slides.each(function()
		{
			$(this).addClass('slide')
		})
		
		wrapper.find('> .slider').append(slides)
		this.options.dialog_window.append(wrapper)
		
		this.options.dialog_window.append(ending)
	},
	
	initialize_dialog_window: function()
	{
		this.dialog_window = this.options.dialog_window.dialog_window
		({
			'close on escape': true,
			'on open': function()
			{
				this.options.dialog_window.find('input:first').focus()
			}
			.bind(this)
		})
		
		this.dialog_window.register_controls
		(
			this.buttons.cancel,
			this.buttons.next,
			this.buttons.done, 
			this.slider
		)
		
		this.dialog_window.on('open', function()
		{
		})
		
		this.dialog_window.on('close', function()
		{
		})
		
		this.slider.on('slide_out', function(event, data)
		{
			if (this.options.slide_out)
			{
				this.loading()
				this.options.slide_out(data, function()
				{
					this.loaded()
					this.slider.slide_out()
				}
				.bind(this))
			}
			else
				this.slider.slide_out()
		}
		.bind(this))
		
		this.slider.on('slide_in', function(event, data)
		{
			if (this.options.slide_in)
			{
				this.loading()
				this.options.slide_in(data, function()
				{
					this.loaded()
					this.slider.slide_in()
				}
				.bind(this))
			}
			else
				this.slider.slide_in()
		}
		.bind(this))
		
		this.slider.set_container(this.dialog_window.content)
		
		this.slider.when_done(function()
		{
			this.loading()
			this.options.done(this.slider.data(), function()
			{
				this.loaded()
			}.
			bind(this))
		}
		.bind(this))
	},
	
	loading: function()
	{
		this.dialog_window.lock()
	},
	
	loaded: function()
	{
		this.dialog_window.unlock()
	},
	
	initialize_buttons: function()
	{
		var buttons = this.options.dialog_window.find('.buttons')
		
		this.buttons.cancel = new text_button(buttons.find('.cancel'), { 'prevent double submission': true })
		.does(function()
		{
			this.dialog_window.close()
		}
		.bind(this))
		
		this.buttons.next = new text_button(buttons.find('.next'))
		.does(function()
		{
			this.slider.next()
		}
		.bind(this))
		
		this.buttons.done = new text_button(buttons.find('.done'), { 'prevent double submission': true })
		.does(function()
		{
			this.slider.done()
		}
		.bind(this))
	},
	
	initialize_slider: function()
	{
		this.slider = new form_slider
		({
			element: this.options.dialog_window.find('.slider'),
			buttons:
			{
				next: this.buttons.next,
				done: this.buttons.done
			},
			fields: this.options.fields,
			asynchronous: true
		})
	}
})