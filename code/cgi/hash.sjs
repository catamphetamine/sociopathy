#!../v8cgi

var whirlpool = require('./whirlpool.hash')

var что = decodeURIComponent(request.get.value)
var чем = decodeURIComponent(request.get.method)

switch (чем)
{
	case 'whirlpool':
		response.write(whirlpool.hash(что))
		break
		
	default:
		throw 'Unsupported hashing method: ' + чем
}