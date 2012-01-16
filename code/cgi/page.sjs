#!../v8cgi

var лекала = require('./jqtpl')

function get_data(url)
{
	url = encodeURI(url)
	var request = new ClientRequest(url)
	return request.send().data.toString("utf-8")
}
	
var название = decodeURIComponent(request.get.path)

var основа = get_data('http://127.0.0.1:8081/страницы/основа.html') //'<html><head><title>${название}</title></head><body>{{html содержимое}}</body></html>'
var guest_content_template = get_data('http://127.0.0.1:8081/страницы/кусочки/guest content.html') //'<html><head><title>${название}</title></head><body>{{html содержимое}}</body></html>'
var лекало_страницы = get_data('http://127.0.0.1:8081/страницы/' + название + '.html') // get_data('http://localhost:8081/страницы/' + path + '.html')  //'<span>test: ${title}</span>'

основа = основа.toString()
guest_content_template = guest_content_template.toString()
лекало_страницы = лекало_страницы.toString()

//system.stdout(123)
//system.stdout(system.env.PATH_TRANSLATE)

var данные = JSON.parse(request.get.data)

лекала.template(название, лекало_страницы)

данные.название_страницы = название
данные.содержимое = лекала.tmpl(название, данные)
			
лекала.template('guest_content', guest_content_template)
var guest_content = лекала.tmpl('guest_content', данные)

var data = ''

var replace_from = основа.indexOf('<!-- Non-static content starts -->')
var replace_to = основа.indexOf('<!-- Non-static content ends -->') + '<!-- Non-static content ends -->'.length

data = основа.substring(0, replace_from) + guest_content + основа.substring(replace_to)
		
delete лекала.template['основа']
delete лекала.template[название]

response.write(data)