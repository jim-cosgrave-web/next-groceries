export function titleCase(str) {
    if(!str) {
        return;
    }

    let separators = [ ' ', '-' ];
    var regex = new RegExp('(^|[' + separators.join('') + '])(\\w)', 'g');
    return str.toLowerCase().replace(regex, function(x) { return x.toUpperCase(); });
}