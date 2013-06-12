var less = require('less');

var parser = new(less.Parser)({ paths: ['.'] });

var statics = 'static resources'

var stylesheet = '' + require('fs').readFileSync(statics + '/облик/either way loading.css')

console.log(stylesheet)

parser.parse(stylesheet, function (err, tree) {
    if (err) { return console.error(err) }
    console.log(tree.toCSS());
});