module.exports = function(date) {
	date = new Date(date);
	return date.getTime();
};