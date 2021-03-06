import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { FakeI18nService } from "i18n-utils";
import { render, clearRender } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import sinon from "sinon";

import { helper as HoursFromNowHelper } from "ui/components/helper/hours-from-now";


module( "ui/components/helper/hours-from-now", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			HoursFromNowHelper,
			I18nService: FakeI18nService
		})
	});

	hooks.beforeEach(function() {
		this.fakeTimer = sinon.useFakeTimers({
			toFake: [ "Date", "setTimeout", "clearTimeout" ],
			target: window
		});
	});
	hooks.afterEach(function() {
		this.fakeTimer.restore();
	});


	test( "Unit test", function( assert ) {
		const Helper = this.owner.factoryFor( "helper:hours-from-now" );
		const helper = Helper.create();

		const time = new Date();
		const minute = 60 * 1000;
		const hour = 60 * minute;
		const day = 24 * hour;

		function compute() {
			return helper.compute( [ time ], {} );
		}

		assert.strictEqual( compute(), "helpers.hours-from-now.now", "Initial content" );

		this.fakeTimer.setSystemTime( ( minute / 2 ) - 1 );
		assert.strictEqual( compute(), "helpers.hours-from-now.now", "Almost half a minute" );

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.minutes{\"minutes\":\"01\"}",
			"Half a minute"
		);

		this.fakeTimer.setSystemTime( minute );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.minutes{\"minutes\":\"01\"}",
			"One minute"
		);

		this.fakeTimer.setSystemTime( 10 * minute - 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.minutes{\"minutes\":\"09\"}",
			"Almost ten minutes"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.minutes{\"minutes\":\"10\"}",
			"Ten minutes"
		);

		this.fakeTimer.setSystemTime( hour - 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.minutes{\"minutes\":\"59\"}",
			"Almost an hour"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.hours.simple{\"hours\":\"1\"}",
			"One hour"
		);

		this.fakeTimer.setSystemTime( 10 * hour - 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.hours.extended{\"hours\":\"9\",\"minutes\":\"59\"}",
			"Almost ten hours"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.hours.simple{\"hours\":\"10\"}",
			"Ten hours"
		);

		this.fakeTimer.setSystemTime( day - 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.hours.extended{\"hours\":\"23\",\"minutes\":\"59\"}",
			"Almost a day"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.days.simple{\"days\":\"1\"}",
			"One day"
		);

		this.fakeTimer.setSystemTime( 10 * day - 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.days.extended{\"days\":\"9\",\"hours\":\"23\"}",
			"Almost ten days"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			compute(),
			"helpers.hours-from-now.days.simple{\"days\":\"10\"}",
			"Ten days"
		);
	});


	test( "Interval", async function( assert ) {
		this.set( "time", new Date() );
		await render( hbs`{{hours-from-now time interval=60000}}` );

		assert.strictEqual(
			this.element.innerText,
			"helpers.hours-from-now.now",
			"Initial content"
		);

		this.fakeTimer.tick( 59999 );
		assert.strictEqual(
			this.element.innerText,
			"helpers.hours-from-now.now",
			"Interval not yet completed"
		);

		this.fakeTimer.tick( 1 );
		assert.strictEqual(
			this.element.innerText,
			"helpers.hours-from-now.minutes{\"minutes\":\"01\"}",
			"Updated content"
		);

		await clearRender();
		this.fakeTimer.tick( 60000 );
	});

});
