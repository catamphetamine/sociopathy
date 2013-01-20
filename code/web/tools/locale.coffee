class Locale
  @default: new Locale process.env.LANG or "en_US"

  constructor: (value) ->
    return unless match = value?.match /[a-z]+/gi

    [language, country] = match

    @language = do language.toLowerCase
    @country  = do country.toUpperCase if country

  serialize = ->
    value = [@language]
    value.push @country if @country

    value.join "_"

  toString: serialize
  toJSON: serialize

class Locales
  length: 0
  _index: null

  sort: Array::sort
  push: Array::push

  constructor: (accept_languages) ->
    return unless accept_languages

    for item in (String accept_languages).split ','
      [locale, weight] = item.split ';'

      locale = new Locale do locale.trim
      locale.score = if weight then +weight[2..] or 0 else 1

      @push locale

    @sort (a, b) -> a.score < b.score

  index: ->
    unless @_index
      @_index = {}
      @_index[locale] = yes for locale in @

    @_index

  best: (locales) ->
    locale = Locale.default

    unless locales
      return @[0] or locale

    index = do locales.index

    for item in @
      return item if index[item]

    locale

  serialize = ->
    [@...]

  toJSON: serialize
  
  toString: ->
    String do @toJSON

api =
	list: (request) ->
		new Locales(request.headers["accept-language"])
		
	middleware: (request, response, next) ->
		locales = api.list(request)
		
		request.locales = locales
		request.locale = locales.best()
		
		next()
		
module.exports = api