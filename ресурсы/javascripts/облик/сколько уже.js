var Progress = new Class
({
	Implements: [Options],
	
	options:
	{
		maximum_width: 0,
		maximum: 100
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
	
		if (!this.options.event_namespace)
			this.options.event_namespace = 'progress:' + random_id()
	
		var progress = this
		page.when_loaded(function()
		{
			if (!options.maximum_width)
			{
				progress.set_maximum_width()
				
				$(window).on_page('resize.', function()
				{
					progress.set_maximum_width()
				})
			}
		})
	},
	
	set_maximum_width: function()
	{
		this.options.maximum_width = $(window).width()
	},
	
	update: function(count)
	{
		this.options.element.width(parseInt(count * this.options.maximum_width / this.options.maximum))
	}
})