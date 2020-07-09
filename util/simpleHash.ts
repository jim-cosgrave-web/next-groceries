export function simpleHash(str) {
    var hash = 0;
    var j;
    var chr;
    
    for (j = 0; j < str.length; j++) {
      chr   = str.charCodeAt(j);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }

    return hash.toString();
}