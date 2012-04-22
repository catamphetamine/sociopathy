/*
	Отсутствующие методы определяются, например, в файлах "клавиши.js" и "снасти.js"
*/
var Visual_editor = new Class
({
	initialize: function(editor)
	{
		if (typeof(editor) === 'string')
			editor = new Editor(editor)
	
		this.editor = editor
		
		var visual_editor
		/*
		editor.rebind_events = function()
		{
			visual_editor.activate_tools_inside_content()
		}
		*/
		
		this.initialize_line_break_handlers()
		this.initialize_tools()
		
		this.activate_tools_inside_content()
		
		this.capture_characters()
		this.capture_special_hotkeys()
		//this.remap_editing_hotkeys()
		this.insert_line_break_on_enter()
		//this.disable_context_menu()
		this.disable_tab()
		
		if (!page.data.visual_editors)
			page.data.visual_editors = []
		page.data.visual_editors.push(this)		
	},
	
	unload: function()
	{
		this.unload_tools()
	},
	
	activate_tools_inside_content: function()
	{
		Object.each(this.Tools, function(tool)
		{
			tool.activate_all()
		})
	},
	
	unbind: function()
	{
		this.editor.content.find('*').unbind('.visual_editor')
	},
	
	hint: function(element, text)
	{
		element.text(text).addClass('hint')
	},
	
	tagged_hint: function(element, text)
	{
		element.text(text).addClass('tagged_hint')
	},

	can_edit: function()
	{
		return true
	},
	
	enter_pressed: function(result)
	{
		if (result.prohibited)
			info(result.prohibited)
	},
	
	enter_pressed_in_container: function()
	{
	},
	
	on_break: function()
	{
	},
	
	on_breaking_space: function(container_tag)
	{
		if (container_tag === this.editor.content[0])
			return this.editor.insert(' ')
		
		if (container_tag.tagName.toLowerCase() === 'li')
			return this.on_breaking_space(container_tag.parentNode)
			
		var text_node = Dom_tools.append_text_next_to(container_tag, ' ')
		this.editor.caret.position(text_node, 1)
	},
	
	new_paragraph: function()
	{
		var container = this.editor.caret.node()

		var new_paragraph = $('<p/>')
		new_paragraph.addClass('hint')
		new_paragraph.text('Введите текст абзаца')
		
		var current_paragraph = Dom_tools.find_parent_by_tag(container, 'p')
		if (!current_paragraph)
			current_paragraph = Dom_tools.uppest_before(container, this.editor.content[0])
			
		$(current_paragraph).after(new_paragraph)
		
		this.editor.caret.move_to(new_paragraph)
	}
})

Validation.наглядный_писарь = {}