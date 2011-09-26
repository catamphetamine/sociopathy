var express = require('express')
var приложение = express.createServer()

var mongo = require('mongoskin')
var хранилище = mongo.db('localhost:27017/sociopathy')

var выполнить = require('seq')
var http = require('./express')(приложение).http

http.put('/прописать', function(ввод, вывод)
{
	выполнить()
		.seq(function () {
			хранилище.collection('people').save(ввод.body, this)
		})
		.catch(function (ошибка) {
			вывод.send({ ошибка: ошибка })
		})
		.seq(function (пользователь) {
			вывод.send({ ключ: пользователь._id })
		})
})

http.get('/люди', function(ввод, вывод)
{
	выполнить()
		.seq(function () {
			хранилище.collection('people').find().toArray(this)
		})
		.catch(function (ошибка) {
			вывод.send({ ошибка: ошибка })
		})
		.seq(function (люди) {
			вывод.send(люди)
		})
})

http.get('/страница/люди', function(ввод, вывод)
{
	выполнить()
		.seq(function () {
			

			считать файл /ресурсы/лекала/основа.html
			подставить в jquery templates в переменную "содержимое" файл считать файл /ресурсы/страницы/люди.html
		})
		.catch(function (ошибка) {
			вывод.send({ ошибка: ошибка })
		})
		.seq(function (люди) {
			вывод.send(люди)
		})
})

приложение.listen(8080, '0.0.0.0')