function refresh_formulae(options, callback)
{
	if (typeof options === 'function')
	{
		callback = options
		options = {}
	}
	
	options = options || {}
	
	var queue = ["Typeset", MathJax.Hub]
	
	if (options.where)
		queue.push(options.where.node())
	
	if (options.wait_for_load)
	{
		var загрузка = loading_indicator.show()
		
		var ended = function()
		{
			загрузка.hide()
			
			if (callback)
				callback()
		}
		
		MathJax.Hub.Queue(queue, [ended])
		return
	}
	
	MathJax.Hub.Queue(queue, [callback])
}

/*
var edit_formula_window

$(function()
{
	edit_formula_window = Visual_editor.tool_windows.Formula
	({
		ok: function(formula)
		{
			element.attr('formula', formula).html(formula)
			refresh_formulae({ wait_for_load: true })
		}
	})
})
*/