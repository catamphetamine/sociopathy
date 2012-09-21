// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License
function parseUri (str)
{
	if (!str)
		str = window.location
		
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || ""

	uri[o.q.name] = {}
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	})

	return uri
}

parseUri.options =
{
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:
	{
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser:
	{
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
}

var Uri =
{
	parse: function(uri)
	{
		var parsed = parseUri(uri)
		
		var result =
		{
			protocol: parsed.protocol || 'http',
			host: parsed.host,
			port: parsed.port,
			path: decodeURI(parsed.path),
			parameters_raw: parsed.query,
			parameters: parsed.queryKey
		}
		
		return result
	},
	
	assemble: function(parts)
	{
		var uri = ''
		if (parts.host)
			uri += parts.protocol + '://' + parts.host + (parts.port ? ':' + parts.port : '')
			
		uri += encodeURI(parts.path)

		var first_parameter = true
		Object.for_each(parts.parameters, function(key)
		{
			uri += (first_parameter ? '?' : '&')
			uri += key
			uri += '='
			uri += encodeURIComponent(this)
			
			first_parameter = false
		})

		return uri
	},
	
	correct: function(uri)
	{
		return this.assemble(this.parse(uri))
	}
};

// testing
(function()
{
	function test(uri)
	{
		alert(Uri.correct(uri))
	}
	
	test('http://google.ru')
	test('google.ru')
})//()