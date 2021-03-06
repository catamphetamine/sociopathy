less = require 'less'

root = Root_folder
statics = root + '/static resources'

css_minifier = (value) ->
	options =
		paths: [statics] # Specify search paths for @import directives
		#filename: 'style.less' # Specify a filename, for better error messages
		
	parser = new less.Parser(options)
	syntax_tree = parser.parse.fiberize(parser)(value)
	return syntax_tree.toCSS(compress: yes) # Minify CSS output
	
#console.log(css_minifier('.class { width: (1 + 1) }'))

html_encoder = (value) ->
	new Buffer(value, 'utf8').toString('base64')

javascript_minifier = (value) ->
#	return value
	require('uglify-js').minify(value, { fromString: yes }).code

version_path = statics + '/compressed/version.txt'

css_path = statics + '/облик'
	
global.read_css = (style) ->
	css_minifier(disk_tools.read(css_path + '/' + style + '.css'))

# not finished yet
generate_everything = ->
	$ = '<html>'
	
	$ += '<head>'
	
	##################
	
	javascripts_path = statics + '/javascripts'
	javascripts = disk_tools.list_files(javascripts_path, { type: 'js', exclude: ['codemirror/lib/util'] })
	
	#javascripts = javascripts.filter((javascript) -> !javascript.starts_with('на страницах/'))
	
	#console.log('Scripts:')
	#console.log(javascripts)

	for script in javascripts
		$ += '<script for="' + script + '">' + javascript_minifier(disk_tools.read(javascripts_path + '/' + script + '.js')) + '</script>'

	##################
	
	plugins_javascripts_path = statics + '/plugins'
	plugins_javascripts = disk_tools.list_files(plugins_javascripts_path, { type: 'js' })
	
	for script in plugins_javascripts
		$ += '<script type="plugin" for="' + script + '">' + javascript_minifier(disk_tools.read(plugins_javascripts_path + '/' + script + '.js')) + '</script>'
	
	##################

	css = disk_tools.list_files(css_path, { type: 'css' })
	
	#css = css.filter((css) -> !css.starts_with('страницы/'))
	
	#console.log('Styles:')
	#console.log(css)
	
	# ещё нужно будет подгружать файлы .less и заставлять Less использовать именно подгруженные, когда include()
	
	for style in css
		$ += '<style for="' + style + '">' + global.read_css(style) + '</style>'
		
	##################

	plugins_css_path = statics + '/plugins'
	plugins_css = disk_tools.list_files(plugins_css_path, { type: 'css' })
	
	for style in plugins_css
		$ += '<style type="plugin" for="' + style + '">' + css_minifier(disk_tools.read(plugins_css_path + '/' + style + '.css')) + '</style>'
		
	##################
	
	$ += '</head>'
	
	$ += '<body>'
	
	##################
	
	templates_path = statics + '/страницы/шаблоны'
	templates = disk_tools.list_files(templates_path, { type: 'html' })
	
	for template in templates
		$ += '<div class="template" for="' + template + '">' + html_encoder(disk_tools.read(templates_path + '/' + template + '.html')) + '</div>'
	
	##################
	
	templates_path = statics + '/страницы/кусочки'
	templates = disk_tools.list_files(templates_path, { type: 'html' })
	
	for template in templates
		$ += '<div class="piece" for="' + template + '">' + html_encoder(disk_tools.read(templates_path + '/' + template + '.html')) + '</div>'
	
	##################
	
	page_templates_path = statics + '/страницы'
	page_templates = disk_tools.list_files(page_templates_path, { type: 'html' })
	
	page_templates = page_templates.filter((template) -> !template.starts_with('шаблоны/') && !template.starts_with('кусочки/'))
	
	for template in page_templates
		$ += '<div class="page_template" for="' + template + '">' + html_encoder(disk_tools.read(page_templates_path + '/' + template + '.html')) + '</div>'
	
	##################
	
	plugins_templates_path = statics + '/plugins'
	
	for plugin in Options.Plugins
		plugin_templates_path = plugins_templates_path + '/' + plugin + '/templates'
		plugin_templates = disk_tools.list_files(plugin_templates_path, { type: 'html' })
		
		for template in plugin_templates
			$ += '<div type="plugin" class="template" for="' + template + '">' + html_encoder(disk_tools.read(plugin_templates_path + '/' + template + '.html')) + '</div>'
		
	##################
	
	plugins_pages_path = statics + '/plugins'
	
	for plugin in Options.Plugins
		plugin_pages_path = plugins_pages_path + '/' + plugin + '/pages'
		plugin_pages = disk_tools.list_files(plugin_pages_path, { type: 'html' })
		
		for page in plugin_pages
			$ += '<div type="plugin" class="page_template" for="' + '/plugins/' + plugin + '/pages/' + page + '">' + html_encoder(disk_tools.read(plugin_pages_path + '/' + page + '.html')) + '</div>'
		
	##################
	
	$ += '</body>'
	
	$ += '</html>'
	
	return $

write_everything = (everything) ->
	if not disk_tools.exists(statics + '/compressed')
		disk_tools.new_folder(statics + '/compressed')
		
	everything_path = statics + '/compressed/everything.html'
	disk_tools.write(everything_path, everything)
	disk_tools.write(version_path, Options.Version)
	
if disk_tools.exists(version_path)
	if disk_tools.read(version_path) == Options.Version
		console.log('Everything file has already been generated for this version')
		return

console.log('Generating compressed "Everything" static file')
		
write_everything(generate_everything())
