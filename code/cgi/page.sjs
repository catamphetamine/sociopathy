#!../v8cgi

var лекала = require('./jqtpl')

/*
var Socket = require("socket").Socket;
var лекала = require('jqtpl')

var address = "127.0.0.1";
var port = 8082;
var socket = new Socket(Socket.PF_INET, Socket.SOCK_STREAM, Socket.IPPROTO_TCP);
socket.setOption(Socket.SO_REUSEADDR, true);
socket.bind(address, port);
socket.listen(10);

while (1) {
	var connection = socket.accept();
	var data = "", buffer = "";
	while (1) {
		buffer = connection.receive(1000);
		if (!buffer) { break; }
		data += buffer.toString("ascii");
		if (data.indexOf("\n\n") == data.length-2) { break; }
		if (data.indexOf("\r\n\r\n") == data.length-4) { break; }
	}
*/
	
function get_data(url)
{
	url = encodeURI(url)
	var request = new ClientRequest(url)
	return request.send().data.toString("utf-8")
}
	
var название = decodeURIComponent(request.get.path)

//"/лекала/основа.html"	
//"/страницы/#{название}.html"

var лекало_основы = get_data('http://127.0.0.1:8081/лекала/основа.html') //'<html><head><title>${название}</title></head><body>{{html содержимое}}</body></html>'
var лекало_страницы = get_data('http://127.0.0.1:8081/страницы/' + название + '.html') // get_data('http://localhost:8081/страницы/' + path + '.html')  //'<span>test: ${title}</span>'

лекало_основы = лекало_основы.toString()
лекало_страницы = лекало_страницы.toString()

//system.stdout(123)
//system.stdout(system.env.PATH_TRANSLATE)

var данные = JSON.parse(request.get.data)

лекала.template(название, лекало_страницы)

данные = 
{
	название: название,
	содержимое: лекала.tmpl(название, данные)
}
			
лекала.template('основа', лекало_основы)
var data = лекала.tmpl('основа', данные)
		
delete лекала.template['основа']
delete лекала.template[название]

response.write(data)

/*
	connection.send("HTTP/1.0 200 OK\n\n" + data);
	
	connection.close();	
	if (data.match(/quit/i)) { break; }
}
socket.close();
*/