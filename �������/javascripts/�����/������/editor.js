/*
 * Editor
 */
var Editor = new Class
({
	/*
	initialize: function(container, content_selector)
	{
		this.container = container
		this.content_selector = content_selector
		
		this.content = this.get_content()
		
		this.caret = new Editor.Caret(this)
		this.selection = new Editor.Selection(this)
		this.time_machine = new Editor.Time_machine(this)
	},
	
	get_content: function()
	{
		return this.container.find(this.content_selector)
	},

	bind: function(event, handler)
	{
		this.container.on(event, this.content_selector, handler)
	},
	*/
	
	initialize: function(content_selector)
	{
		this.content_selector = content_selector
		this.content = this.get_content()
		
		this.caret = new Editor.Caret(this)
		this.selection = new Editor.Selection(this)
		this.time_machine = new Editor.Time_machine(this)
	},
	
	get_content: function()
	{
		return $(this.content_selector)
	},

	bind: function(event, handler)
	{
		this.content.on(event, handler)
	},

	/*	
	reload_content: function()
	{
		this.load_content(this.content.outer_html())
	},
	
	load_content: function(html)
	{
		var parent = this.content.parent()
		this.content.remove()
		this.content = $(html).appendTo(parent)
		
		this.content.attr('contenteditable', true)
		this.focus()
	},
	*/
	
	reload_content: function()
	{
		this.load_content(this.content.html())
	},
	
	load_content: function(html)
	{
		//alert(html)
		this.content.html(html)
		//alert(this.content.html())
	},
	
	refresh_content: function()
	{
		this.content = this.get_content()
	},
	
	marker_attribute: 'mark',
	marker_attribute_value: 'temporary',
	get_marker_selector: function() { return '[' + this.marker_attribute + '=' + this.marker_attribute_value + ']' },
	get_marker_html: function() { return this.marker_attribute + '="' + this.marker_attribute_value + '"' },
	
	mark: function(element)
	{
		if (this.content.find(this.get_marker_selector()).length > 0)
			throw 'Some element is already marked'
			
		element.attr(this.marker_attribute, this.marker_attribute_value)
		return element
	},
	
	unmark: function()
	{
		this.reload_content()
		var element = this.content.find(this.get_marker_selector())
		
		if (element.length == 0)
			throw 'No marked element found'
			
		if (element.length > 1)
			throw 'More than one element was marked'
		
		element.removeAttr(this.marker_attribute)
		return element
	},
	
	focus: function()
	{
		this.content.focus()
	},
	
	content_changed: function(options)
	{
		this.content_changed_on = now().getTime()
		this.content.trigger('content_changed.editor', options || {})		
	},
	
	checkpoint: function()
	{
		this.continuous_typing = false
		this.content_changed()
	},
	
	was_content_changed: function()
	{
		if (this.content_changed_on)
			return true
		
		return false
	},
	
	insert: function(what, options)
	{
		options = options || {}
		
		if (typeof(what) === 'string')
		{
			if (what.contains('<'))
				throw 'Insert html with .insert_html() function'
			
			if (this.time_machine.can_snapshot_typing())
				this.time_machine.snapshot()
				
			this.insert_text(what, options)
			this.content_changed()
			
			if (!this.continuous_typing)
				this.continuous_typing = true
		
			return
		}
			
		if (what instanceof jQuery)
		{
			this.time_machine.snapshot()
			
			this.mark(what)
			this.insert_html(what.outer_html())
			this.checkpoint()
			return this.unmark()
		}
		
		throw 'Unexpected argument type'
	},
	
	insert_text: function(inserted_text, options)
	{
		var caret = this.caret.get()
		var caret_offset = this.caret.offset(caret)
		if (options.replace)
			caret_offset = 0
		
		var container = this.caret.native_container()
		
		if (!Dom_tools.is_text_node(container))
		{
			var offset = this.caret.offset()
			
			if ($.browser.webkit)
				offset--
			
			container = Dom_tools.find_text_node(container.childNodes[offset], this.content)
			
			if (!options.replace)
				container.nodeValue = inserted_text + container.nodeValue
			else
				container.nodeValue = inserted_text
			
			this.caret.create(container, inserted_text.length)
		}
		else
		{
			if (!options.replace)
			{
				var text = this.caret.text_before_and_after()
				container.nodeValue = text.before + inserted_text + text.after
			}
			else
				container.nodeValue = inserted_text
				
			caret = this.caret.get()
			if (!caret)
				caret = this.caret.create(container, caret_offset + inserted_text.length)
			else
				this.caret.offset(caret_offset + inserted_text.length)
		}
	},
	
	insert_html: function(html)
	{
		var container = this.caret.native_textual_container()
		var text = this.caret.text_before_and_after()
		var parent = container.parentNode
			
		var node_chain = [parent]
		var how_much_parent_tags_to_close = html.count('</') - html.count(/<[^\/]+/g)
		
		while (how_much_parent_tags_to_close > 0)
		{
			parent = parent.parentNode
			node_chain.push(parent)
			how_much_parent_tags_to_close--
		}
		
		node_chain.reverse()
		
		var before_and_after = Dom_tools.html_before_and_after(container)
		
		html = before_and_after.before +
			text.before +
			html +
			text.after + 
			before_and_after.after
		
		Dom_tools.inject_html(html, node_chain)
		
		if (how_much_parent_tags_to_close > 0)
			this.refresh_content()
	},
	
	range: function()
	{
		if (window.getSelection().rangeCount === 0)
			return
			
		return window.getSelection().getRangeAt(0)
	},
	
	create_range: function()
	{
		return document.createRange()
	},
	
	collapse: function(range)
	{
		range.collapse(true)
	},
	
	apply_range: function(range)
	{
		var selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)
	},
	
	paste: function(what)
	{
		this.insert(what)
	},
	
	deselect: function()
	{
		Editor.deselect()
	}
})

Editor.deselect = function()
{
	window.getSelection().removeAllRanges()
}