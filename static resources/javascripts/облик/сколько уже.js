var Progress = new Class
({
	Implements: [Options],
	
	options:
	{
		maximum_width: 0,
		maximum_height: 0,
		
		maximum: 100,
	},
	
	negative_compensation: 0,
	skipped: 0,
	
	initialize: function(options)
	{
		this.setOptions(options)

		if (typeof this.options.maximum === 'undefined')
			throw 'Overall count not set for progress'
		
		if (!this.options.event_namespace)
			this.options.event_namespace = 'progress:' + random_id()
	
		this.viewport = this.options.element.find('> .current_viewport')
		
		if (this.options.skipped)
			this.skipped = this.options.skipped
	
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
				
				$(window).on_page('scroll.progress_bar', function()
				{
					progress.update_current_viewport_position()
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
	
	update: function(count, options)
	{
		options = options || {}
		
		if (typeof count !== 'undefined')
			this.count = count
		else
			count = this.count
		
		if (count < 0)
		{
			if (this.negative_compensation > count)
				this.negative_compensation = count
		}
		
		if (typeof options.skipped !== 'undefined')
			this.skipped = options.skipped
		
		if (count <= this.skipped)
			this.skipped = count - 1
		
		if (this.skipped < 0)
			this.skipped = 0
		
		this.progress_ratio = (count - this.negative_compensation) / (this.options.maximum - this.negative_compensation)
		
		if (this.progress_ratio > 1)
		{
			this.options.maximum = count
			this.progress_ratio = 1
			//throw 'Progress ratio can\'t be > 1'
		}
		
		if (!this.options.vertical)
			return this.options.element.width(parseInt(this.progress_ratio * this.options.maximum_width))
			
		//console.log('this.height:')
		
		//console.log(this.progress_ratio)
		//console.log(this.options.maximum_height)
		
		this.height = parseInt(this.progress_ratio * this.options.maximum_height)
		
		var skipped_ratio = 0
		if (count - this.negative_compensation != 0)
			skipped_ratio = (this.skipped - this.negative_compensation) / (count - this.negative_compensation)
		
		this.skipped_ratio = skipped_ratio
		
		this.options.element.height(this.height * (1 - skipped_ratio))
		this.options.element.css({ top: (this.height * skipped_ratio) + 'px' })
		
		this.document_height = $(document).height()
		this.window_height_to_document_height_ratio = this.options.maximum_height / this.document_height
		
		if (this.window_height_to_document_height_ratio > 1)
			this.window_height_to_document_height_ratio = 1
		
		var displayed_progress_height = this.height * (1 - skipped_ratio)
		
		this.viewport.css({ height: parseInt(displayed_progress_height * this.window_height_to_document_height_ratio) + 'px' })
		
		this.update_current_viewport_position()
	},
	
	update_current_viewport_position: function()
	{
		//if (!this.options.vertical)
		//	throw "Horizontal progress current viewport isn't supported"
		
		// if not yet initialized - exit
		if (!this.height)
			return
		
		var max_document_height = this.document_height
		if (max_document_height < this.options.maximum_height)
			max_document_height = this.options.maximum_height
		
		this.viewport.css({ top: parseInt(($(window).scrollTop() / max_document_height) * this.height * (1 - this.skipped_ratio)) + 'px' })
	}
})