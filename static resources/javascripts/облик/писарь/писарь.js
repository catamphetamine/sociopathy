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
	
	enabled: false,
	
	disable: function()
	{
		this.enabled = false
		this.disable_tools()
	},
	
	enable: function()
	{
		this.enabled = true
		this.enable_tools()
	},
	
	destroyables: [],
	
	unload: function()
	{
		this.destroyables.for_each(function()
		{
			this.destroy()
		})
		
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
			if (!current_paragraph.exists())
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
			
			// если низ не влез, но показ низа скроет верх - ничего не делать
			if (paragraph_bottom_needs_to_be_visible + paragraph_top_needs_to_be_visible > 0)
				return
				
			var left_to_scroll_down = $(document).height() - window_bottom_coordinate
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
			console.log('left_to_scroll_down')
			console.log(left_to_scroll_down)
			*/
			
			if (paragraph_bottom_needs_to_be_visible > 0
				&& paragraph_bottom_needs_to_be_visible < left_to_scroll_down)
			{
				return прокрутчик.scroll_by(paragraph_bottom_needs_to_be_visible)
			}
				
			//console.log(paragraph_top_needs_to_be_visible + paragraph_bottom_needs_to_be_visible)
			
			// hz
			if (paragraph_top_needs_to_be_visible <= -paragraph_bottom_needs_to_be_visible)
				if (how_much_can_scroll_top > 0)
					прокрутчик.scroll_by(paragraph_top_needs_to_be_visible)
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
			.addClass('should_be_invisible')
			.html('…')
	},
	
	dummy_content: function()
	{
		return this.create_paragraph()
	},
	
	is_dummy_content: function()
	{
		var is_dummy = true
		
		this.editor.content.find('p').each(function()
		{
		     if (!this.hasClass('hint'))
			     is_dummy = false
		})
		
		return is_dummy
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
	
	/*
	tagged_hint: function(element, text)
	{
		element.text(text).addClass('tagged_hint')
	},
	*/
	
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
		
		var move_to = this.editor.content.node().firstChild
		if (!move_to)
			move_to = this.editor.content.node()
		
		this.editor.caret.move_to(move_to)
	},
	
	html: function()
	{
		return this.editor.html()
	},
	
	load_content: function(html)
	{
		this.editor.load_content(html)
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
			
		var text_node = Dom.append_text_next_to(container_tag, ' ')
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
	
	new_paragraph: function(options)
	{
		options = options || {}
		
		var container = this.editor.caret.node()
		
		var new_paragraph = this.create_paragraph()
		
		var current_paragraph = Dom.find_parent_by_tag(container, 'p')
		
		if (!current_paragraph)
			current_paragraph = Dom.uppest_before(container, this.editor.content[0])
		
		if (current_paragraph)
		{
			if (options.before)
				$(current_paragraph).before(new_paragraph)
			else
				$(current_paragraph).after(new_paragraph)
		}
		else
		{
			this.editor.content.append(new_paragraph)
		}
		
		this.editor.caret.move_to(new_paragraph)
	},
	
	is_submission_key_combination: function(event)
	{
		return Клавиши.поймано('Ctrl', 'Enter', event) || Клавиши.поймано('Command', 'Enter', event)
	},
	
	deactivate: function()
	{
		this.inactive = true
	},
	
	activate: function()
	{
		delete this.inactive
	},
	
	empty: function()
	{
		this.editor.content.empty()
	}
})