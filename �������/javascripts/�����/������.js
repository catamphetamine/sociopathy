var Modifier = new Class //(command, editDoc)
({
	apply: function(value)
	{
		editDoc.execCommand(command, false, value)
	},
	
	getValue: function()
	{
		return editDoc.queryCommandValue(command)
	},
	
	isApplied: function()
	{
		var value = this.getValue()
		return value !== null && typeof(value) !== 'undefined'
	}
})

var Editor = new Class
({
	window: window,

	initialize: function()
	{
	},
	
	move_caret_to: function(element)
	{
		var range = document.createRange()
		range.setStart(element.get(0).firstChild, 0)
		range.collapse(true)
		
		var selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)
	},
	
	insert: function(element)
	{
		this.cursor().insertNode(element.get(0))
	},
	
	'delete': function()
	{
		this.selection().deleteContents()
	},
	
	wrap: function(element)
	{
		this.selection().surroundContents(element.get(0))
	},
	
	get_containing_element: function(tagName)
	{
		var filter = function(element)
		{
			return element.tagName.toLowerCase() === tagName
		}
	
		var container = this.range().commonAncestorContainer
		return getAncestor(container, filter)
	},
	
	range: function()
	{
		return this.window.getSelection().getRangeAt(0)
	},
	
	selection: function()
	{
		return this.range()
	},
	
	cursor: function()
	{
		return this.range()
	}
})