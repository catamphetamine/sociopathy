/*
 * Selection
 */
Editor.Selection = new Class
({
	initialize: function(editor)
	{
		this.editor = editor
	},

	get: function()
	{
		return this.editor.range()
	},
	
	container: function()
	{
		return this.get().commonAncestorContainer
	},
	
	root: function()
	{
		if (this.container() === this.editor.content.node())
			return true
		
		return false
	},
	
	paragraph: function()
	{
		if ($(this.container().parentNode).is('p'))
			return true
		
		return false
	},
	
	text: function()
	{
		return this.get().toString()
	},
	
	is_textual: function()
	{
		//return this.get().toString()
	},

	exists: function()
	{
		return !this.get().collapsed
	},
	
	is_valid: function()
	{
		return this.text() != ''
	},

	'delete': function()
	{
		this.get().deleteContents()
	},
	
	wrap: function(element)
	{
		if (element instanceof jQuery)
			element = element[0]
			
		this.get().surroundContents(element)
		return element
	},
	
	cut: function()
	{
		this.editor.time_machine.snapshot()
		return this.get().extractContents()
	},
	
	store: function()
	{
		this.editor.data.selection = this.get().cloneRange()
		return this.editor.data.selection
	},
	
	restore: function()
	{
		var selection = this.editor.data.selection
		if (!selection)
			return// console.error('Nothing to restore')
		
		this.editor.apply_range(selection)
		delete this.editor.data.selection
		return selection
	}
})