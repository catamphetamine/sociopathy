var Progress = new Class
({
	Implements: [Options],
	
	options:
	{
		maximum_width: 0,
		maximum_height: 0,
		
		maximum: 100,
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
	
		if (!this.options.event_namespace)
			this.options.event_namespace = 'progress:' + random_id()
	
		var progress = this
		page.when_loaded(function()
		{
			if (!progress.options.vertical && !options.maximum_width)
			{
				progress.set_maximum_width()
				
				$(window).on_page('resize.progress_bar', function()
				{
					progress.set_maximum_width()
					progress.update()
				})
			}
			else if (progress.options.vertical && !options.maximum_height)
			{
				progress.set_maximum_height()
				
				$(window).on_page('resize.progress_bar', function()
				{
					progress.set_maximum_height()
					progress.update()
				})
			}
		})
	},
	
	set_maximum_width: function()
	{
		this.options.maximum_width = $(window).width()
	},
	
	set_maximum_height: function()
	{
		this.options.maximum_height = $(window).height()
	},
	
	update: function(count)
	{
		if (count)
			this.count = count
		else
			count = this.count
		
		if (!this.options.vertical)
			return this.options.element.width(parseInt(count * this.options.maximum_width / this.options.maximum))
			
		this.options.element.height(parseInt(count * this.options.maximum_height / this.options.maximum))
	}
})