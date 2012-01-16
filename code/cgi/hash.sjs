#!../v8cgi

var whirlpool = require('./whirlpool.hash')

var что = decodeURIComponent(request.get.value)
var чем = decodeURIComponent(request.get.method)

var случайность = decodeURIComponent(request.get.random)
if (случайность == true)
	случайность = Math.random()
else if (!случайность)
	случайность = ''

switch (чем)
{
	case 'whirlpool':
		response.write(whirlpool.hash(что + случайность))
		break
		
	default:
		throw 'Unsupported hashing method: ' + чем
}