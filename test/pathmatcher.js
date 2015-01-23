var match = require('../utils/PathMatcher.js');

describe("path matcher", function() {
	it("should correctly handle non-path value and queries", function() {
		match('gitlab', 'gitlab').should.be.true;
		match('gitlab', 'gitlabci').should.be.false;
		match('gitlab', 'gitlab_core').should.be.false;
	});

	it("should correctly handle paths", function() {
		match('gitlab', 'gitlab/core').should.be.true;
		match('gitlab', 'gitlab/core/kong').should.be.true;
		match('gitlab/core', 'gitlab').should.be.false;
		match('gitlab/core', 'gitlab/core/kong').should.be.true;
	});

	it("should correctly handle terminating wildcards", function() {
		match('*', 'something').should.be.true;
		match('*', 'gitlab').should.be.true;
		match('gitlab/*', 'gitlab').should.be.false;
		match('gitlab/*', 'gitlab/core').should.be.true;
		match('gitlab/*', 'gitlab/core/kong').should.be.true;
	});

	it("should correctly handle non-terminating wildcards", function() {
		match('*/frontier', 'something').should.be.false;
		match('*/frontier', 'gitlab/frontier').should.be.true;
		match('*/frontier', 'gitlab/frontier/core').should.be.true;
		match('gitlab/*/core', 'gitlab/frontier').should.be.false;
		match('gitlab/*/core', 'gitlab/core').should.be.false;
		match('gitlab/*/core', 'gitlab/frontier/core').should.be.true;
	});
});