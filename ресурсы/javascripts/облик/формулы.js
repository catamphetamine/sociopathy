function refresh_formulae(options, callback)
{
	if (typeof options === 'function')
	{
		callback = options
		options = {}
	}
	
	options = options || {}
	
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
		
		if (options.where)
			queue.push(options.where.node())
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
}