window.EmberTestingUI = (function() {
  var EmberTestingUI, UITestRunner, BaseSuite, QUnitSuite, MochaSuite, NullSuite;

  EmberTestingUI = function(config) {
    this.runner = new UITestRunner(config);
  };

  EmberTestingUI.configure = function(conf) {
    var config;
    if (typeof conf === 'function') {
      config = conf.call(null, config);
    } else {
      config = conf;
    }
    return new EmberTestingUI(config);
  };

  EmberTestingUI.init = function(App) {
    return new EmberTestingUI().init(App);
  };

  EmberTestingUI.prototype.init = function(App) {
    this.runner.init(App);
  };

  // UITestRunner responsible for setting up the dom elements, updating
  // their classes and content and offering an api for the test suite
  // to inform about passes/failures/pending
  UITestRunner = function(config) {
    if (!config) { config = {}; }

    this.tally = { total: 0, passed: 0, failed: 0, pending: 0 };
    this.config = $.extend({}, { rootElement: '#ember-testing-ui-app' }, config);
    this.resultsId = 'ember-testing-ui';
    this.testsId = 'ember-testing-ui-tests';
    this.summaryId = 'ember-testing-ui-summary';
    this.appContainerId = 'ember-testing-ui-container';
    this.registerMarkup();
  };

  UITestRunner.prototype.suite = function() {
    var ret;
    if (window.QUnit) {
      ret = new QUnitSuite(this);
    } else if (window.mocha) {
      ret = new MochaSuite(this);
    } else {
      ret = new NullSuite(this);
    }
    return ret;
  };

  UITestRunner.prototype.init = function(App) {
    App.setupForTesting();
    App.injectTestHelpers();
    App.rootElement = this.config.rootElement;
    this.suite().integrate();
  };

  UITestRunner.prototype.start = function() {
    this.results.removeClass().addClass('running');
  };

  UITestRunner.prototype.finish = function(pre) {
    var result = this.tally.failed === 0 ? 'passed' : 'failed', msg;

    if (!pre) { pre = ''; }

    msg  = [
      this.span(this.tally.total), 'tests:',
      this.span(this.tally.passed, 'pass'), 'passed,',
      this.span(this.tally.failed, 'fail'), ' failed'
    ].join(' ');

    this.message(pre + ' ' + msg, function() {
      this.results.removeClass().addClass(result);
    }.bind(this));
  };

  UITestRunner.prototype.pass = function(msg) {
    this.tally.total += 1;
    this.tally.passed += 1;
    this.report(this.span('.', 'pass', msg));
  };

  UITestRunner.prototype.fail = function(msg) {
    this.tally.total += 1;
    this.tally.failed += 1;
    this.report(this.span('F', 'fail', msg));
  };

  UITestRunner.prototype.pending = function(msg) {
    this.tally.total += 1;
    this.tally.pending += 1;
    this.report(this.span('?', 'pending', msg));
  };

  UITestRunner.prototype.span = function(content, klass, title) {
    var span = $('<span>').text('' + content),
        w = $('<div>');
    if (klass) { span.addClass(klass); }
    if (title) { span.attr('title', title); }
    return w.append(span).html();
  };

  UITestRunner.prototype.report = function(msg) {
    this.tests.append($(msg));
  };

  UITestRunner.prototype.message = function(msg, callback) {
    this.summary.removeClass().html(msg);
    if (typeof callback === 'function') { callback.call(this); }
    // setTimeout(function() {
    // }.bind(this), 500);
  };

  UITestRunner.prototype.registerMarkup = function() {
    if (!$('#' + this.resultsId).length) {
      this.addMarkup();
    }
    this.results = $('#' + this.resultsId);
    this.tests   = $('#' + this.testsId);
    this.summary = $('#' + this.summaryId);

    this.results.on('click', function(e) {
      e.preventDefault();
      return false;
    });
  };

  UITestRunner.prototype.addMarkup = function() {
    var results = $('<div>').attr('id', this.resultsId),
        tests = $('<div>').attr('id', this.testsId),
        summary = $('<div>').attr('id', this.summaryId),
        appContainer = $('<div>').attr('id', this.appContainerId),
        app = $('<div>').attr('id', this.config.rootElement.slice(1));

    
    $('body').prepend(results.append(tests, summary), appContainer.append(app));
  };

  // NullSuite used when no known test suite is found in
  // global scope
  NullSuite = function(runner) {
    this.runner = runner;
  };

  NullSuite.prototype.integrate = function() {};

  BaseSuite = function(runner) {
    this.runner = runner;
  };

  BaseSuite.prototype.addToggle = function(selector, text) {
    this.runner.results.append($('<a>').attr({'id': 'suite-toggle', 'href': '#'}).text(text));
    $('#suite-toggle').on('click', function(e) {
      e.preventDefault();
      $(selector).toggle();
      return false;
    });
    if (/autoshow=true/.test(window.location)) {
      $('#suite-toggle').click();
    }
  }

  // QUnitSuite used when window.QUnit exists and is used
  // to integrate into QUnit callbacks.
  QUnitSuite = function(runner) {
    BaseSuite.call(this, runner);
  };
  QUnitSuite.prototype = Object.create(BaseSuite.prototype);
  QUnitSuite.prototype.constructor = QUnitSuite;

  QUnitSuite.prototype.integrate = function() {
    this.addToggle('#qunit', 'QUnit');

    QUnit.config.hidepassed = true;

    QUnit.begin(function(details) {
      this.runner.start();
    }.bind(this));

    QUnit.testStart(function(details) {
      this.runner.message(details.module + ': ' + details.name);
    }.bind(this));

    QUnit.testDone(function(details) {
      var title = details.module + ': ' + details.name;
      if (details.failed === 0) {
        this.runner.pass(title);
      } else {
        this.runner.fail(title);
      }
    }.bind(this));

    QUnit.done(function(details) {
      var pre = ["Tests completed in",  details.runtime / 1000, "seconds."].join(' ');
      this.runner.finish(pre);
    }.bind(this));
  };

  MochaSuite = function(runner) {
    BaseSuite.call(this, runner);
  };
  MochaSuite.prototype = Object.create(BaseSuite.prototype);
  MochaSuite.prototype.constructor = MochaSuite;

  MochaSuite.prototype.integrate = function() {
    var runner = this.runner,
        start  = new Date().valueOf();

    function buildName(base, suite) {
      if (suite.root) return base;
      return buildName(suite.title.trim() + ' ' + base.trim(), suite.parent);
    }

    this.addToggle('#mocha', 'Mocha');

    mocha.suite.beforeAll(function() {
      runner.start();
    });

    mocha.suite.beforeEach(function() {
      runner.message(buildName('', this.currentTest));
    });

    mocha.suite.afterEach(function() {
      var title = buildName('', this.currentTest);
      switch (this.currentTest.state) {
        case 'passed':
          runner.pass(title);
          break;
        case 'failed':
          runner.fail(title);
          break;
        case 'pending':
          runner.pending(title);
          break;
      }
    });

    mocha.suite.afterAll(function() {
      var end = new Date().valueOf(),
          pre = ["Tests completed in", (end - start) / 1000, "seconds."].join(' ');
      runner.finish(pre);
    });
  };

  // Returning the EmberTestingUI class to be the public api
  return EmberTestingUI;
})();
