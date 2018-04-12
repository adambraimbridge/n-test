/*globals beforeAll, expect */

const server = require('../server/app');
const SmokeTest = require('../../lib/smoke/smoke-test');
const { spawn } = require('child_process');

describe('Smoke Tests of the Smoke', () => {

	beforeAll(() => {
		//Start the server
		server.listen(3004);
	});

	describe('status checks', () => {
		test('tests should pass if all the urls return the correct status', (done) => {
			const smoke = new SmokeTest({
				host: 'http://localhost:3004',
				config: 'test/fixtures/smoke-pass.js'
			});
			return smoke.run()
			.then((results) => {
				expect(results.passed.length).toEqual(11);
				expect(results.failed.length).toEqual(0);
				done();
			});
		});

		test('tests should fail if some tests fail', (done) => {

			const smoke = new SmokeTest({
				host: 'http://localhost:3004',
				config: 'test/fixtures/smoke-fail.js'
			});
			return smoke.run()
			.catch((results) => {
				expect(results.passed.length).toEqual(1);
				expect(results.failed.length).toEqual(3);
				done();
			});
		});
	});

	describe('tests that error', () => {

		test('should handle non-assertion errors gracefully beyond a threshold', (done) => {
			const smoke = new SmokeTest({
				host: 'http://localhost:3004',
				config: 'test/fixtures/smoke-error-pass.js'
			});

			return smoke.run()
				.then((results) => {
					expect(results.errors.length).toEqual(2);
					expect(results.failed.length).toEqual(0);
					expect(results.passed.length).toEqual(2);
					done();
				});
		});

		test('should fail if more than 2 tests error', (done) => {
			const smoke = new SmokeTest({
				host: 'http://localhost:3004',
				config: 'test/fixtures/smoke-error-fail.js'
			});

			return smoke.run()
				.catch((results) => {
					expect(results.errors.length).toEqual(3);
					expect(results.failed.length).toEqual(0);
					done();
				});

		});


	});

	describe('Adding custom checks', () => {
		test('should allow adding custom assertions',(done) => {

			const smoke = new SmokeTest({
				host: 'http://localhost:3004',
				config: 'test/fixtures/smoke-custom-check.js'
			});

			smoke.addCheck('custom', async (testPage) => {
				const metrics = await testPage.page.metrics();

				return {
					expected: `no more than ${testPage.check.custom} DOM nodes`,
					actual: `${metrics.Nodes} nodes`,
					result: testPage.check.custom >= metrics.Nodes
				};
			});
			return smoke.run()
			.then((results) => {
				expect(results.passed.length).toEqual(1);
				expect(results.failed.length).toEqual(0);
				done();
			});
		});
	});

	//TODO: figure out how to test the www.ft.com bit!
	describe('Session tokens', () => {
		test('should not run user-based tests on localhost', () => {

			const smoke = new SmokeTest({
				host: 'http://localhost:3004',
				config: 'test/fixtures/smoke-session-token.js'
			});
			return smoke.run()
				.then((results) => {
					expect(results.urlsTested).toEqual(1);
					expect(results.passed.length).toEqual(1);
				});
		});

	});

	describe('CLI task', () => {
		test('should exit with the correct code for a passing test', (done) => {
			const proc = spawn('./bin/n-test.js', ['smoke', '--host', 'http://localhost:3004', '--config', 'test/fixtures/smoke-pass.js']);
			proc.on('close', (code) => {
				expect(code).toEqual(0);
				done();
			});
		});

		test('should exit with a bad code if the test fails', (done) => {
			const proc = spawn('./bin/n-test.js', ['smoke', '--host', 'http://localhost:3004', '--config', 'test/fixtures/smoke-fail.js']);
			proc.on('close', (code) => {
				expect(code).toEqual(2);
				done();
			});
		});
	});
});
