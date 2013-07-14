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
    ok(exists('h2:contains(Altered heading)'), 'Application header exists');
  });
});

test('list of colors', function() {
  expect(3);
  visit('/').then(function() {
    ok(exists('li:contains(red)'), 'Red color exists');
    ok(exists('li:contains(yellow)'), 'Yellow color exists');
    ok(exists('li:contains(blue)'), 'Blue color exists');
  });
});
