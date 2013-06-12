clean_css = require './tools/clean-css.js'

css_minifier = (value) ->
	clean_css.process(value)

html_encoder = (value) ->
	new Buffer(value, 'utf8').toString('base64')

javascript_minifier = (value) ->
	require('uglify-js').minify(value, { fromString: yes }).code

root = __dirname + '/../..'
statics = root + '/static resources'

version_path = statics + '/compressed/version.txt'

# not finished yet
generate_everything = ->
	$ = '<html>'
	
	$ += '<head>'
	
	##################
	
	javascripts_path = statics + '/javascripts'
	javascripts = disk_tools.list_files(javascripts_path, { type: 'js', exclude: ['codemirror/lib/util'] })
	
	javascripts = javascripts.filter((javascript) -> !javascript.starts_with('на страницах/'))
	
	console.log('Scripts:')
	console.log(javascripts)

	for script in javascripts
		$ += '<script for="' + script + '">' + javascript_minifier(disk_tools.read(javascripts_path + '/' + script + '.js')) + '</script>'

	##################

	css_path = statics + '/облик'
	css = disk_tools.list_files(css_path, { type: 'css' })
	
	css = css.filter((css) -> !css.starts_with('страницы/'))
	
	console.log('Styles:')
	console.log(css)
	
	# ещё нужно будет подгружать файлы .less и заставлять Less использовать именно подгруженные, когда include()
	
	for style in css
		$ += '<style for="' + style + '">' + css_minifier(disk_tools.read(css_path + '/' + style + '.css')) + '</style>'
		
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
		console.log('Up to date')
		return

console.log('Generating compressed "Everything" static file')
		
write_everything(generate_everything())