var Visual_editor = new Class
({
	initialize: function(editor)
	{
		if (typeof(editor) === 'string')
		{
			editor = new Editor($(editor))
		}
	
		this.editor = editor
		
		this.initialize_tools()
		
		this.capture_characters()
		this.remap_editing_hotkeys()
		this.insert_line_break_on_enter()
		this.disable_context_menu()
		this.disable_tab()
		
		if (!window.visual_editors)
			window.visual_editors = []
		window.visual_editors.push(this)
	}
})