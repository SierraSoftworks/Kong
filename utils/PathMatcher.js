module.exports = PathMatcher;

function PathMatcher(query, path) {
  var queryParts = query.split('/');
  var pathParts = path.split('/');

  if(queryParts > pathParts) return false;
  for(var i = 0; i < queryParts.length; i++) {
  	if(queryParts[i] == '*') continue;
  	if(queryParts[i] != pathParts[i]) return false;
  }
  return true;
}