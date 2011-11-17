#!../v8cgi

var лекала = require('./jqtpl')

function get_data(url)
{
	url = encodeURI(url)
	var request = new ClientRequest(url)
	return request.send().data.toString("utf-8")
}
	
var название = decodeURIComponent(request.get.path)

var лекало_основы = get_data('http://127.0.0.1:8081/лекала/основа.html') //'<html><head><title>${название}</title></head><body>{{html содержимое}}</body></html>'
var лекало_страницы = get_data('http://127.0.0.1:8081/страницы/' + название + '.html') // get_data('http://localhost:8081/страницы/' + path + '.html')  //'<span>test: ${title}</span>'

лекало_основы = лекало_основы.toString()
лекало_страницы = лекало_страницы.toString()

//system.stdout(123)
//system.stdout(system.env.PATH_TRANSLATE)

var данные = JSON.parse(request.get.data)

лекала.template(название, лекало_страницы)

данные.название = название
данные.содержимое = лекала.tmpl(название, данные)
			
лекала.template('основа', лекало_основы)
var data = лекала.tmpl('основа', данные)
		
delete лекала.template['основа']
delete лекала.template[название]

response.write(data)