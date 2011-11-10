/*
 * Editor
 */
var Editor = new Class
({
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
		//this.container.find(this.content_selector).live(event, handler) //.bind(this))
		this.container.on(event, this.content_selector, handler) //.bind(this))
	},
	
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
		var element = this.content.find(this.get_marker_selector())
		
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
	
	insert: function(what)
	{
		if (typeof(what) === 'string')
		{
			if (this.time_machine.can_snapshot_typing())
				this.time_machine.snapshot()
				
			this.insert_text(what)
			this.content_changed()
			return
		}
			
		if (what instanceof jQuery)
		{
			this.time_machine.snapshot()
			
			this.mark(what)
			this.insert_html(what.outer_html())
			this.content_changed()
			return this.unmark()
		}
		
		throw 'Unexpected argument type'
	},
	
	insert_text: function(inserted_text)
	{
		var caret = this.caret.get()
		var caret_offset = this.caret.offset(caret)
		
		var text = this.caret.text_before_and_after()
		var container = this.caret.native_container()
		container.nodeValue = text.before + inserted_text + text.after
		
		this.caret.move_to(container)
		this.caret.offset(caret_offset + 1)
	},
	
	insert_html: function(html)
	{
		var container = this.caret.native_textual_container()
		var text = this.caret.text_before_and_after()
		var parent = container.parentNode
			
		var node_chain = [parent]
		var how_much_parent_tags_to_close = 0
		if (html.starts_with('</'))
			how_much_parent_tags_to_close = html.count('</')
		
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