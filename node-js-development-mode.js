/*
 * Node.js development mode script.
 * Author: github.com/kuchumovn
 * Make sure you've read the readme: github.com/kuchumovn/node-js-development-mode
 * Everything is explained there.
 */
 
var child_process = require('child_process')
var fs = require("fs")
var sys = require("util")
var path = require("path")

var debug_mode = true
var separator = '/'

function parse_options()
{
	var index
	var options = 
	{
		watched_paths: ['*.js', '*.coffee'],
		ignored_paths: [],
		project_directory: '.'
	}
	
	index = process.argv.indexOf('--main-file')
	if (index >= 0)
		options.main_file_path = process.argv[index + 1]
	
	index = process.argv.indexOf('--coffee-script')
	if (index >= 0)
		options.coffee_script_path = process.argv[index + 1]
		
	index = process.argv.indexOf('--watch')
	if (index >= 0)
		options.watched_paths = eval(process.argv[index + 1])
		
	index = process.argv.indexOf('--ignore')
	if (index >= 0)
		options.ignored_paths = eval(process.argv[index + 1])
		
	index = process.argv.indexOf('--project_directory')
	if (index >= 0)
		options.project_directory = process.argv[index + 1]
		
	index = process.argv.indexOf('--debug')
	if (index >= 0)
		debug_mode = true
		
	index = process.argv.indexOf('--options')
	if (index >= 0)
		options.options = process.argv[index + 1]
		
	return options
}
		
dev_server = 
{
    process: null,

    files: [],

    restarting: false,

    restart: function() 
	{
		this.restarting = true
        this.process.kill()
    },

	to_relative_path: function(in_project_path)
	{
		// is absolute path
		if (in_project_path.indexOf(':') >= 0 || in_project_path.indexOf('/') === 0)
			return in_project_path
			
		return this.options.project_directory + '/' + in_project_path
	},
	
    start: function() 
	{
        var that = this
		
		this.options = parse_options()
		
		if (this.options.coffee_script_path)
			if (!path.existsSync(this.options.coffee_script_path))
				if (path.existsSync(this.to_relative_path(this.options.coffee_script_path)))
					this.options.coffee_script_path = this.to_relative_path(this.options.coffee_script_path)
				else
					throw 'Coffee-script not found: ' + this.options.coffee_script_path

		var arguments
		if (this.options.coffee_script_path)
			arguments = [this.options.coffee_script_path, this.to_relative_path(this.options.main_file_path)]
		else
			arguments = [this.to_relative_path(this.options.main_file_path)]

		if (this.options.options)
		{
			arguments.push('options')
			arguments.push(this.options.options)
		}
			
        debug('DEVSERVER: Starting server')

		this.watch_paths()
		
        this.process = child_process.spawn("node", arguments);

        this.process.stdout.addListener('data', function (data) 
		{
            process.stdout.write(data)
        })

        this.process.stderr.addListener('data', function (data) 
		{
            process.stderr.write(data)
        })

        this.process.addListener('exit', function (code) 
		{
			if (!that.restarting)
				debug('DEVSERVER: Child process exited: ' + code)
				
            that.process = null
			that.start()
        })
		
		if (this.restarting)
		{
			this.restarting = false
		
			if (this.needs_extra_restart)
			{
				debug('DEVSERVER: Files changed while restarting. Restarting again')
				this.needs_extra_restart = false
				this.restart()
			}
		}
    },
	
	watch_file: function(file)
	{
		debug("Watching file '" + file + "' for changes.")
	
		var that = this
	
		fs.watch(file, function(action, fileName) 
		{
			if (action !== 'change') 
				return
				
			if (that.restarting)
			{
				that.needs_extra_restart = true
				return
			}
				
			debug('DEVSERVER: Restarting because of changed file at ' + file)
			dev_server.restart()
		})
	},

	normalize_path: function(path)
	{
		return path.replace(this.options.project_directory, '').substring(1)
	},
	
    watch_paths: function() 
	{
        var that = this

		find_all_files(this.options.project_directory, function(file)  // process.cwd()
		{
			//file = that.normalize_path(file)
			
			// if already processed this file - return
			if (that.files.indexOf(file) >= 0)
				return
				
			that.files.push(file)
			
			// new file detected
			
			// if doesn't match pattern - return
			if (!Path_matcher.matches(that.normalize_path(file), that.options.watched_paths))
				return
				
			// if is ignored - return
			if (Path_matcher.matches(that.normalize_path(file), that.options.ignored_paths))
				return
			
			that.watch_file(file)
		})
   }
}

function debug(message)
{
	if (debug_mode)
		console.log(message)
}

function show_error(message)
{
	console.log('Error: ' + message)
}

function info(message)
{
	console.log(message)
}

function find_all_files(path, callback) 
{
	if (fs.statSync(path).isFile())
		return callback(path)
	
	fs.readdirSync(path).forEach(function(file_name) 
	{
		find_all_files(path + '/' + file_name, callback)
	})
}

var Path_matcher = 
{
	split: function(path)
	{
		return path.split(separator)
	},
	
	matches: function(path, patterns)
	{
		var i = 0
		while (i < patterns.length)
		{
			var pattern = patterns[i]
			
			if (this.matches_pattern(this.split(path), this.split(pattern)))
				return true
				
			i++
		}
		
		return false
	},

	matches_pattern: function(path_parts, pattern_parts)
	{
		if (path_parts.length === 0 && pattern_parts.length === 0)
			return true
	
		if (path_parts.length === 0 || pattern_parts.length === 0)
			return false
	
		//console.log('find unmatched result for ' + path_parts.join('/') + ' and ' + pattern_parts.join('/') + ' is:')
		var result = this.find_unmatched_parts(path_parts, pattern_parts)
		//console.dir(result)
		
		if (result.matches)
			return true
		
		if (result.nothing_matched)
			return false
			
		//console.log('rest_path_parts')
		//console.log(result.rest_path_parts)
			
		pattern_parts.shift()
		return this.matches_pattern(result.rest_path_parts, pattern_parts)
	},
	
	find_unmatched_parts: function(path_parts, pattern_parts, options)
	{
		var pattern = pattern_parts[0]
		
		if (pattern.indexOf('**') >= 0 && pattern !== '**')
			throw 'Illegal pattern: ' + pattern
		
		if (pattern === '**')
		{
			// clone
			var expanded_pattern_parts = pattern_parts.slice()
			// remove the '**'
			expanded_pattern_parts.shift()
			
			// add as many '*'s as we can, checking for match
			while (expanded_pattern_parts.length <= path_parts.length)
			{
				if (this.matches_pattern(path_parts, expanded_pattern_parts))
					return { matches: true }

				expanded_pattern_parts.unshift('*')				
			}
		
			return { nothing_matched: true }
		}

		if (!this.asterisks_match(path_parts[0], pattern))
			return { nothing_matched: true }
	
		path_parts.shift()
		
		return { rest_path_parts: path_parts }
	},
	
	assert: function(path, pattern)
	{
		if (!this.matches(path, pattern))
			throw 'Path_matcher broken: ' + path + ' didn\'t match ' + pattern
	},
	
	assert_not: function(path, pattern)
	{
		if (this.matches(path, pattern))
			throw 'Path_matcher broken: ' + path + ' shouldn\'t match ' + pattern
	},
	
	assert_error: function(path, pattern)
	{
		try
		{
			this.matches(path, pattern)
		}
		catch (error)
		{
			return
		}
		
		throw 'Path_matcher broken: ' + path + ' match with ' + pattern + ' should raise error'
	},
	
	asterisks_match: function(path, pattern, options)
	{
		options = options || {}
	
		var asterisk_index = pattern.indexOf('*')
		if (asterisk_index < 0)
		{
			if (!options.start_from_anywhere)
				return path === pattern
			else
				return path.indexOf(pattern) >= 0
		}

		var pattern_before_asterisk = pattern.substring(0, asterisk_index)
		var path_before_asterisk = path.substring(0, asterisk_index)
		
		var rest_path
		
		if (!options.start_from_anywhere)
		{
			if (path_before_asterisk !== pattern_before_asterisk)
				return false
				
			rest_path = path.substring(asterisk_index + 1)
		}
		else
		{
			var start_index = path_before_asterisk.indexOf(pattern_before_asterisk)
			if (start_index < 0)
				return false
				
			rest_path = path.substring(start_index + asterisk_index + 1)
		}
			
		var rest_pattern = pattern.substring(asterisk_index + 1)		
		return this.asterisks_match(rest_path, rest_pattern, { start_from_anywhere: true })
	}
}

RegExp.escape = function(string)
{
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g")
	return string.replace(specials, "\\$&")
}

String.prototype.replace_all = function(what, with_what)
{
	var regexp = new RegExp(RegExp.escape(what), "g")
	return this.replace(regexp, with_what)
}

Path_matcher.assert('test.js', ['*.js'])
Path_matcher.assert_not('test.js', ['*.coffee'])
Path_matcher.assert('test.js', ['*.js', '*.coffee'])
Path_matcher.assert('test.coffee', ['*.js', '*.coffee'])
Path_matcher.assert_not('test/test.js', ['*.js'])
Path_matcher.assert('test/test.js', ['test/*.js'])
Path_matcher.assert('test/test.js', ['*/*.js'])
Path_matcher.assert_not('test.js', ['*/*.js'])
Path_matcher.assert('test/test.js', ['test/te*.js'])
Path_matcher.assert('test/test.js', ['test/*e*.js'])
Path_matcher.assert_not('test/test.js', ['test/*est*.js'])
Path_matcher.assert_error('test.js', ['**.js'])
Path_matcher.assert('test.js', ['**/*.js'])
Path_matcher.assert('test/test.js', ['**/*.js'])
Path_matcher.assert('test/test.js', ['test/**/*.js'])
Path_matcher.assert_not('test/test.js', ['test/rest/**/*.js'])
Path_matcher.assert('test/test.js', ['**/**/*.js'])
Path_matcher.assert('test/another/test.js', ['**/another/*.js'])
Path_matcher.assert_not('test/another/test.js', ['**/another_path/*.js'])
Path_matcher.assert('test/another/test.js', ['**/*/*.js'])
Path_matcher.assert('public/javascript/client.js', ['public/**'])
Path_matcher.assert('public/javascript/client.js', ['public/**/*.js'])
Path_matcher.assert('public/javascript/client.js', ['public/javascript/**/*.js'])

dev_server.start()