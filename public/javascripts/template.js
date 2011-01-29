/**
 * Template
 * 
 * This is a simple javascript template engine.
 * 
 * Usage:
 * 
 * in html:
 * 
 * 	<div id="table_container">
 *	</div>
 *
 * in javascript:
 * 
 * $(function() // for jQuery
 * // or for MooTools it will be: window.addEvent('domready', function() {
 *	{
 *		// you can do it this way
 *		template.load('/templates/table.html', function(template) 
 *		{
 *			template
 *				.apply({ vodka: 'like this' })
 *				.inject_into('table_container')
 *		})
 *
 *		// or this way
 *		new template("<div class='second_example'>or you can pass markup directly <property name='vodka'>here</property></div>")
 *			.apply({ vodka: 'like this' })
 *			.inject_into('table_container')
 * })
 * 
 * In filesystem:
 * 
 * 		/templates/table.html
 * 
 * 			<div class="table">
 * 				| blah | blah | <property name='vodka'>vodka here</property> | more #{vodka} |
 *			</div>
 * 
 * Requires MooTools (Core, More(Elements.From)), (and jQuery for Ajax). 
 * 
 * Copyright (c) 2011 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var template = new Class
({
	Binds: ['replace_property_inline', 'replace_property_tag'],
	 
	options:
	{
		tag: 'property',
		attribute: 'name'
	},
		
	markup: '',
	
	initialize: function(markup)
	{
		this.markup = markup
	},
	
	inject_into: function(element_id)
	{
		Elements.from(this.markup).inject(document.id(element_id))
	},
	
	inject_in_place_of: function(element_id)
	{
		Elements.from(this.markup).replaces(document.id(element_id))
	},

	// replaces '#{city}' with 'Moscow' (assuming data = { city: 'Moscow' })
	replace_property_inline: function(markup, property)
	{
		return markup.replace(new RegExp("#{" + property.name + "}".escapeRegExp(), 'g'), property.value)
	}
	.protect(),
	
	// replaces '<property name="city">[anything]</property>' with 'Moscow' (assuming data = { city: 'Moscow' })
	replace_property_tag: function(markup, property)
	{
		return markup.replace(new RegExp
		(
			("<" + this.options.tag + " " + this.options.attribute + "=").escapeRegExp() + 
			"['\"]" + 
			property.name + 
			"['\"]" + 
			">".escapeRegExp() + 
			"(.*?)" + 
			("</" + this.options.tag + ">").escapeRegExp(), 
			'g'
		), 
		property.value)
	}
	.protect(),
	
	apply: function(data)
	{
		var markup = this.markup
		
		var self = this
		
		Object.each(data, function(value, key)
		{
			var property = { name: key, value: value }
			
			// new template('I live in #{city}').apply({ city: 'Moscow' })
			markup = self.replace_property_inline(markup, property)
			
			// new template('I live in <property name="city">[somewhere]</property>').apply({ city: 'Moscow' })
			markup = self.replace_property_tag(markup, property)
		})
		
		return new template(markup)
	}
})

template.load = function(url, callback)
{
	$.get(url, function(markup) 
	{
		callback(new template(markup))
	})
}