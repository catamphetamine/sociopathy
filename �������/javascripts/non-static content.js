(function()
{
	/*
	<!-- стили этой страницы -->
	<link rel="stylesheet/less" href="/облик/страницы/${название}.css"/>
	*/
	
	 /*
	 стили обрабатываются less'ом по событию ready, поэтому,
	 если их подгружать потом, то они не будут обработаны в общем порядке
	 */
	 
	var название_страницы = parseUri(decodeURI(window.location)).path.substring(1)
	if (!название_страницы)
		название_страницы = 'обложка'
		
	var данные_для_страницы = {}
	
	var match = название_страницы.match(/люди\/(.+)/)
	if (match)
	{
		название_страницы = 'человек'
		получить_данные_человека(match[1], proceed)
	}
	else
	{
		proceed()
	}
	
	function proceed()
	{
		$(function()
		{	
			получить_общие_данные_для_страницы()
		})
	}
	
	function получить_данные_человека(address_name, callback)
	{
		Ajax.get('/приложение/человек', { address_name: address_name },
		{
			error: function()
			{
				page_loading_error('Что-то сломалось')
			},
			ok: function(данные) 
			{
				данные_для_страницы = Object.merge(данные_для_страницы, данные.данные)

				callback()
			}
		})
	}
	
	function получить_общие_данные_для_страницы()
	{
		Ajax.get('/приложение/общие_данные_для_страницы', 
		{
			error: function()
			{
				page_loading_error('Что-то сломалось')
			},
			ok: function(данные) 
			{
				данные_для_страницы = Object.merge(данные_для_страницы, данные.данные)
				данные_для_страницы.название = название_страницы

				получить_шаблон_страницы()
			}
		})
	}

	function получить_шаблон_страницы()
	{
		var адрес_шаблона = '/страницы/' + название_страницы + '.html'

		Ajax.get(адрес_шаблона, 
		{
			type: 'html',
			error: function()
			{
				page_loading_error('Что-то сломалось')
			},
			ok: function(template) 
			{
				$.template(адрес_шаблона, template)
				
				var данные = данные_для_страницы
				$('body').append($.tmpl(адрес_шаблона, данные))
				
				получить_шаблон_пользовательского_содержимого()
			}
		})
	}
	
	function получить_шаблон_пользовательского_содержимого()
	{
		Ajax.get('/лекала/user content.html', 
		{
			type: 'html',
			error: function()
			{
				page_loading_error('Что-то сломалось')
			},
			ok: function(template) 
			{
				$.template('user_aware_content', template)

				$('body').append($.tmpl('user_aware_content', данные_для_страницы))
				
				$(document).trigger('fully_loaded')
			}
		})
	}
	
	function page_loading_error(error)
	{
		var error = $('<div class="page_loading_error">' + error + '</div>')
		error.disableTextSelect()
		$('#loading_screen').attr('status', 'error').append(error)
	}
})()