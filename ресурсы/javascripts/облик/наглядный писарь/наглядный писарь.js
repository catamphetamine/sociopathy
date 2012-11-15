/*
	Отсутствующие методы определяются, например, в файлах "клавиши.js" и "снасти.js"
*/
var Visual_editor = new Class
({
	initialize: function(editor)
	{
		if (typeof(editor) === 'string')
			editor = new Editor(editor)
		//else if (editor instanceof jQuery)
		//	editor = new Editor(editor)
			
		this.editor = editor
		
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
		
		this.add_global_hotkey()
		
		this.paragraphed()
		
		if (!page.data.visual_editors)
			page.data.visual_editors = []
			
		page.data.visual_editors.push(this)
		
		//visual_editor.editor.on('blur', function() { console.log(visual_editor.editor.caret.get()) })
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
	
	keep_cursor_on_screen: function()
	{
		var visual_editor = this
		
		this.editor.on('content_changed.editor', function()
		{
			var current_paragraph = visual_editor.editor.caret.container('p')
			if (!current_paragraph)
				return
			
			var top_bar_height = 0
			$('.fixed_on_the_top').each(function()
			{
				var $this = $(this)
				
				if (!$this.displayed())
					return
				
				var height = $this.height()
				
				if (top_bar_height < height)
					top_bar_height = height
			})
				
			var bottom_bar_height = 0
			$('.fixed_on_the_bottom').each(function()
			{
				var $this = $(this)
				
				if (!$this.displayed())
					return
				
				var height = $this.height()
				
				if (bottom_bar_height < height)
					bottom_bar_height = height
			})
			
			var paragraph_top_coordinate = current_paragraph.offset().top
			
			var paragraph_bottom_coordinate = paragraph_top_coordinate +
					//parseInt(current_paragraph.css('margin-top')) +
					//parseInt(current_paragraph.css('padding-top')) +
					current_paragraph.height()

			var window_top_coordinate = $(window).scrollTop()
			var window_bottom_coordinate = window_top_coordinate + $(window).height()

			var paragraph_bottom_needs_to_be_visible = paragraph_bottom_coordinate - (window_bottom_coordinate - bottom_bar_height)
			var paragraph_top_needs_to_be_visible = (window_top_coordinate + top_bar_height) - paragraph_top_coordinate
			
			// if bottom is visible - return
			if (paragraph_bottom_needs_to_be_visible <= 0 && paragraph_top_needs_to_be_visible <= 0)
				return
					
			var left_to_scroll = $(document).height() - window_bottom_coordinate
			var how_much_can_scroll_top = window_top_coordinate
			
			/*
			console.log('current_paragraph')
			console.log(current_paragraph)
			console.log('paragraph_bottom_coordinate')
			console.log(paragraph_bottom_coordinate)
			console.log('window_bottom_coordinate')
			console.log(window_bottom_coordinate)
			
			console.log('paragraph_bottom_needs_to_be_visible')
			console.log(paragraph_bottom_needs_to_be_visible)
			console.log('paragraph_top_needs_to_be_visible')
			console.log(paragraph_top_needs_to_be_visible)
			console.log('left_to_scroll')
			console.log(left_to_scroll)
			*/
			
			if (left_to_scroll > 0 && paragraph_bottom_needs_to_be_visible)
			{
				return $(window).scrollTop($(window).scrollTop() + paragraph_bottom_needs_to_be_visible)
			}
				
			//console.log(paragraph_top_needs_to_be_visible + paragraph_bottom_needs_to_be_visible)
			
			if (paragraph_top_needs_to_be_visible <= -paragraph_bottom_needs_to_be_visible)
				if (how_much_can_scroll_top > 0)
					$(window).scrollTop($(window).scrollTop() - paragraph_top_needs_to_be_visible)
		})
	},
	
	unbind: function()
	{
		this.editor.content.find('*').unbind('.visual_editor')
	},
	
	create_paragraph: function()
	{
		return $('<p/>')
			.addClass('hint')
			.text('Введите текст абзаца')
	},
	
	insert_paragraph: function()
	{
		var new_paragraph = this.create_paragraph()
		this.editor.insert(new_paragraph)
		this.editor.caret.move_to(new_paragraph)
		
		this.editor.sanitize()
	},
	
	hint: function(element, text)
	{
		element.text(text).addClass('hint')
	},
	
	tagged_hint: function(element, text)
	{
		element.text(text).addClass('tagged_hint')
	},
	
	store_content: function()
	{
		this.editor.data('content', this.editor.content.html())
	},
	
	restore_content: function()
	{
		this.editor.load_content(this.editor.data('content'))
	},
	
	focus: function()
	{
		this.editor.focus()
		this.editor.caret.move_to(this.editor.content[0].firstChild)
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
	
	paragraphed: function()
	{
		var visual_editor = this
		
		var default_on_breaking_space = visual_editor.on_breaking_space
		visual_editor.on_breaking_space = function(container_tag)
		{
			if (container_tag.tagName.toLowerCase() === 'p')
				return visual_editor.editor.insert(' ')
			
			default_on_breaking_space.bind(this)(container_tag)
		}
		
		visual_editor.enter_pressed_in_container = function()
		{
			visual_editor.insert_paragraph()
		}
		
		visual_editor.on_break = function()
		{
			visual_editor.new_paragraph()
		}
	},
	
	new_paragraph: function()
	{
		var container = this.editor.caret.node()

		var new_paragraph = this.create_paragraph()
		
		var current_paragraph = Dom_tools.find_parent_by_tag(container, 'p')
		if (!current_paragraph)
			current_paragraph = Dom_tools.uppest_before(container, this.editor.content[0])
			
		$(current_paragraph).after(new_paragraph)
		
		this.editor.caret.move_to(new_paragraph)
	}
})