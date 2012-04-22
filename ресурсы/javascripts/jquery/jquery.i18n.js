// internationalization
//$.i18n.setLocale("ru")

//if (!$.fn.prop)
//	$.fn.prop = $.fn.attr
	
/**
 * jQuery i18n, 
 * Copyright under the MIT license http://www.opensource.org/licenses/mit-license.php
 * by Bryan W Berry, 2009
 * modified by Kuchumov Nikolay, 2010
 * 
 * this library is heavily influenced by the GNU LIBC library
 * http://www.gnu.org/software/libc/manual/html_node/Locales.html
 *
 * Usage:
 * 
 * in html:
 * 
 * <span class="translated" label="page 'welcome', dialog 'join', name"></span>
 * 
 * in javascript:
 * 
 * $.i18n.setLocale("en")
 * alert($._("page 'welcome', dialog 'join', title"))
 *
 * in json:
 * 
 * $.i18n.ru.strings =
 * {
 *		page:
 *		{
 *			welcome: 
 *			{
 *				dialog:
 *				{
 *					join:
 *					{
 *						title: "Join",
 *						content: "This is the user registration dialog"
 *					}
 *				}
 * 			}
 *		}
 *	}
 * 
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

(function($)
{
	var single_quote = "'";
	
     $.i18n = function(string, locale)
	 {
		var locale = locale || $.i18n.locale;
		
		if (!this.i18n[locale] || !this.i18n[locale].strings)
		{
			return string;
		}

		var path = string.split(", ");
		var depth = this.i18n[locale].strings;
	
		var step;
	
		// preprocessing
	
		var steps = [];
		while (step = path.shift())
		{
			if (!step.ends_with(single_quote))
			{
				// normal execution
				steps.push(step);
				continue;
			}

			if (step.count_occurences(single_quote) == 2)
			{
				var two_levels = step.split(single_quote); 

				// to remove single quotes use this code
				// string.replace(/'/g,'')
				
				steps.push(two_levels[0].trim());
				steps.push(two_levels[1]);
				
				// finished
				continue;
			}
			
			// error: invalid path
			return string;
		}

		// processing

		while (step = steps.shift())
		{
			depth = depth[step];

			if (depth === undefined)
				return string;
		}
		
		return depth;
	};

	$._ = $.i18n;

	$.i18n.translate_page = function()
	{
		// translate labels
		$(".translated").each(function() 
		{
			$(this).append($.i18n($(this).attr("label")));
		})
		
		// translate titles
		$(".translated_title").each(function() 
		{
			$(this).attr("title", $.i18n($(this).attr("label")));
		})
	}

     $.i18n.setLocale = function (locale)
	 {
		$.i18n.locale = locale;
     };

     $.i18n.getLocale = function ()
	 {
		return $.i18n.locale;
     };


     /**
      * Converts a number to numerals in the specified locale. Currently only
      * supports devanagari numerals for Indic languages like Nepali and Hindi
      * @param {Number} Number to be converted
      * @param {locale} locale that number should be converted to
      * @returns {String} Unicode string for localized numeral 
      */
     $.i18n._n = function(num, locale)
	 {
		 locale = locale || $.i18n.locale;
	
		 if (!this.i18n[locale] || !this.i18n[locale].numBase ){
		     return num;
	 }

	 //48 is the base for western numerals
	 var numBase = $.i18n[$.i18n.locale].numeralBase || 48;
	 var prefix =  $.i18n[$.i18n.locale].numeralPrefix || "u00";
     
	 var convertDigit = function(digit){	     
	     return '\\' + prefix + 
		 (numBase + parseInt(digit)).toString(16);
	 };
	 
	 var charArray = num.toString().split("").map(convertDigit);
	 return eval('"' + charArray.join('') + '"');
     };

     $._n = $.i18n._n;

     /* ToDo
      * implement sprintf
      * conversion functions for monetary and numeric 
      * sorting functions (collation) for different locales
      */
})(jQuery)

jQuery(document).ready(function()
{
	$.i18n.translate_page()
})
