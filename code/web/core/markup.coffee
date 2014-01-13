# Since generating markup is processor intensive, it should not be done in node.js
# It should be moved to the scala application, for example
# The code below is a temporary solution

jsdom = require('jsdom').jsdom

scripts = ['mootools/core', 'язык', 'dom tools', 'markup/markup', 'markup/markup syntax', 'markup/markup html syntax', 'youtube', 'vimeo']

scripts = scripts.map((path) -> global.disk_tools.read(client_code_path(path)))

# adds element.classList property
scripts.add(disk_tools.read(__dirname + '/../tools/jsdom/class list.js'))

#'начертания',
#, '../plugins/Library/styles/mobile/заметка'
styles = ['общее', 'markup/markup formatting', 'markup/mobile markup formatting']
styles = styles.map((style) -> read_css(style))

global.Markup_styles = styles

options =
	html: '<html><body></body></html>'
	src: scripts
	done: (errors, window) ->
		if errors?
			for error in errors
				console.error(error.message)
				if error.data? && error.data.exception?
					console.error(error.data.exception)	
			return
		
		global.Markup = window.Markup
		
jsdom.env(options)