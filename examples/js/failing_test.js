EmberTestingUI.init(App);

function exists(selector, scope) {
  return !!find(selector, scope).length;
};

module('Home page', {
  setup: function() {
    Ember.run(App, App.advanceReadiness);
  },
  teardown: function() {
    App.reset();
  }
});

test('header', function() {
  expect(1);
  visit('/').then(function() {
    ok(exists("h2:contains('Modified header text')"), 'Application header exists');
  });
});

test('list of colors', function() {
  expect(3);
  visit('/').then(function() {
    ok(exists("li:contains('orange')"), 'Red color exists');
    ok(exists("li:contains('green')"), 'Yellow color exists');
    ok(exists("li:contains('purple')"), 'Blue color exists');
  });
});
