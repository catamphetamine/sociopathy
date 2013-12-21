function refresh_formulae(options, callback)
{
	if (typeof options === 'function')
	{
		callback = options
		options = {}
	}
	
	options = options || {}
	callback = callback || function() {}
	
	if (!window.MathJax)
	{
		//warning(text('math.temporarily unavailable'))
		return callback()
	}
	
	var queue
	
	if (options.what)
	{
		options.where = options.what
		options.what = null
	}
	
	// doesn't work
	if (options.what)
	{
		var math = MathJax.Hub.getAllJax(options.what.node())[0]
		//console.log(MathJax.Hub.getAllJax(options.what.node()))
		queue = ["Text", math, options.formula]
	}
	else
	{
		queue = ["Typeset", MathJax.Hub]
			
		if (options.where instanceof Array)
		{
			if (options.where.length > 0)
			{
				var countdown = options.where.length
				return options.where.for_each(function()
				{
					refresh_formulae({ where: this }, function()
					{
						countdown--
						if (countdown === 0)
							callback()
					})
				})
			}
			
			queue.push(options.where instanceof jQuery ? options.where.node() : options.where)
		}
	}
	
	callback = callback || function() {}
	var finished = callback
	
	if (options.wait_for_load)
	{
		var загрузка = loading_indicator.show()
		
		finished = function()
		{
			загрузка.hide()
			callback()
		}
	}
	
	MathJax.Hub.Queue(queue, finished)
	
	/*	
	try
	{
		MathJax.Hub.Queue(queue, finished)
	}
	catch (ошибка)
	{
		error(ошибка)
	}
	*/
}