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

	exists: function()
	{
		return !this.get().collapsed
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
	}
})