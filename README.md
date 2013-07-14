# EmberTestingUI

A JS and CSS file to be included with your QUnit test runner. It modifies the look of the the test runner to make integration tests using ember-testing very pleasant.

## Installation

Submodule the project or download the `ember_testing_ui.js` and `ember_testing_ui.css` files. Then include the js and css files in the test runner markup. The `ember_testing_ui.js` needs to be included before your test helper/tests js files, and after your Ember.js application.

## Usage

In your test helper file, initialize `EmberTestingUI`.

	// test_helper.js

	EmberTestingUI.init(App); // App is your Ember application

	function exists(selector, context) {
		return !!find(selector, context).length;
	}

The initialization process will build the needed markup and setup the Ember app for testing. It also sets the `rootElement` property on your app. If you need to use a specific root element, you can configure `EmberTestingUI` before initialization.

	EmberTestingUI.configure({ rootElement: '#my-apps-root-element' }).init(App);

or

	EmberTestingUI.configure(function() {
		return { rootElement: '#my-apps-root-element' };
	}).init(App);

In both cases, `EmberTestingUI` will create the dom element with the correct id for you, and assign that id as the `rootElement` for the app.

## Examples

To run the examples, clone the repository and open the `examples/*.html` files in the browser 

![Passing tests](http://imgur.com/Q67Hpdn.png)

![Failing tests](http://imgur.com/Cw40xkh.png)

![Mixed pass and fail tests](http://imgur.com/phzTFZ8.png)

