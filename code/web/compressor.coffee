disk = require 'fs'

javascript_minifier = require 'uglify-js'

css_minifier = (value) ->
	value.replace(/\s/g, '')

html_minifier = (value) ->
	value.replace(/[\t\r\n]/g, '')

root = __dirname + '/../..'
statics = root + '/static resources'

version_path = statics + '/compressed/version.txt'

update_version = ->
	entry_point = statics + '/страницы/основа.html'
	
	begin_marker = '/* version → */'
	end_marker = '/* ← version */'
	
	content = disk.readFileSync(entry_point, 'utf8')
	
	content = content.before(begin_marker) + begin_marker + ' ' + 'Version = "' + Options.Version + '"' + ' ' + end_marker + content.after(end_marker)
	
	disk.writeFileSync(entry_point, content, 'utf8')

# not finished yet
generate_everything = ->
	$ = '<html>'
	
	$ += '<head>'
	
	##################
	
	javascripts_path = statics + '/javascripts'
	javascripts = disk_tools.list_files(javascripts_path, { type: 'js', exclude: ['codemirror/lib/util'] })
	
	for script in javascripts
		$ += '<script for="' + script + '">' + javascript_minifier(disk_tools.read(javascripts_path + '/' + script + '.js')) + '</script>'

	##################

	css_path = statics + '/облик'
	css = disk_tools.list_files(css_path, { type: 'css' })
	
	console.log(css)
	
	# ещё нужно будет подгружать файлы .less и заставлять Less использовать именно подгруженные, когда include()
	
	for style in css
		$ += '<style for="' + style + '">' + css_minifier(disk_tools.read(css_path + '/' + style + '.css')) + '</style>'
		
	##################
	
	$ += '</head>'
	
	$ += '<body>'
	
	##################
	
	templates_path = statics + '/страницы'
	templates = disk_tools.list_files(templates_path, { type: 'html' })
	
	for template in templates
		$ += '<div for="' + template + '">' + html_minifier(disk_tools.read(templates_path + '/' + template + '.html')) + '</div>'
	
	##################
	
	$ += '</body>'
	
	$ += '</html>'
	
	return $

write_everything = (everything) ->
	if not disk.existsSync(statics + '/compressed')
		disk.mkdirSync(statics + '/compressed')
		
	everything_path = statics + '/compressed/everything.html'
	
	disk.writeFileSync(everything_path, everything, 'utf8')
	disk.writeFileSync(version_path, Options.Version, 'utf8')
	
#if not Options.Optimize
#	return
	
if disk.existsSync(version_path)
	if disk.readFileSync(version_path, 'utf8') == Options.Version
		console.log('Up to date')
		return

console.log('Generating compressed "Everything" static file')
		
write_everything(generate_everything())
#update_version()