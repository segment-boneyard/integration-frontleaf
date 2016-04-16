'use strict';

var Test = require('segmentio-integration-tester');
var helpers = require('./helpers');
var Frontleaf = require('..');

describe('Frontleaf', function() {
  var frontleaf;
  var settings;
  var test;
  var payload;

  beforeEach(function() {
    settings = {
      token: 'FTWe9sfDz6DyZA8xxtAIGwRUMOMX6mgL',
      stream: 'test'
    };
    frontleaf = new Frontleaf(settings);
    test = Test(frontleaf, __dirname);
    payload = {};
  });

  it('should have the correct settings', function() {
    test
      .name('Frontleaf')
      .endpoint('https://api.frontleaf.com/api/track')
      .ensure('settings.stream')
      .ensure('settings.token')
      .ensure('message.userId')
      .channels(['server']);
  });

  describe('.validate()', function() {
    var msg;

    beforeEach(function() {
      msg = { userId: 'user-id' };
    });

    it('should be invalid if token is missing', function() {
      delete settings.token;
      test.invalid(msg, settings);
    });

    it('should be invalid if stream is missing', function() {
      delete settings.stream;
      test.invalid(msg, settings);
    });

    it('should be valid when stream and token are given', function() {
      test.valid(msg, settings);
    });
  });

  describe('mapper', function() {
    describe('identify', function() {
      it('should map basic identify', function() {
        test.maps('identify-basic');
      });
    });

    describe('track', function() {
      it('should map basic track', function() {
        test.maps('track-basic');
      });
    });

    describe('group', function() {
      it('should map basic group', function() {
        test.maps('group-basic');
      });
    });
  });

  describe('.track()', function() {
    it('should be able to track correctly', function(done) {
      var msg = helpers.track();

      payload.token = settings.token;
      payload.stream = settings.stream;
      payload.timestamp = msg.timestamp().getTime();
      payload.userId = msg.userId();
      payload.userData = frontleaf.mapper._clean(msg.traits());
      payload.eventData = frontleaf.mapper._clean(msg.properties());
      payload.event = msg.event();

      test
        .set(settings)
        .track(msg)
        .sends(payload)
        .expects(200, done);
    });

    it('should error on invalid creds', function(done) {
      test
        .set({ token: 'tok' })
        .track({})
        .error('cannot POST /api/track/event (400)', done);
    });
  });

  describe('.group()', function() {
    it('should be able to group properly', function(done) {
      var msg = helpers.group();

      payload.token = settings.token;
      payload.stream = settings.stream;
      payload.timestamp = msg.timestamp().getTime();
      payload.userId = msg.userId();
      payload.accountId = msg.groupId();
      payload.accountName = msg.proxy('traits.name');
      payload.accountData = frontleaf.mapper._clean(msg.traits());

      test
        .set(settings)
        .group(msg)
        .sends(payload)
        .expects(200, done);
    });

    it('should error on invalid creds', function(done) {
      test
        .set({ token: 'tok' })
        .group({})
        .error('cannot POST /api/track/identify (400)', done);
    });
  });

  describe('.identify()', function() {
    it('should be able to identify correctly', function(done) {
      var msg = helpers.identify();

      payload.token = settings.token;
      payload.stream = settings.stream;
      payload.timestamp = msg.timestamp().getTime();
      payload.userId = msg.userId();
      payload.userName = msg.name() || msg.username();
      payload.userData = frontleaf.mapper._clean(msg.traits());

      test
        .set(settings)
        .identify(msg)
        .sends(payload)
        .expects(200, done);
    });

    it('should error on invalid creds', function(done) {
      test
        .set({ token: 'tok' })
        .identify({})
        .error('cannot POST /api/track/identify (400)', done);
    });
  });

  describe('._clean()', function() {
    it('should properly clean and flatten the source data', function(done) {
      var result = frontleaf.mapper._clean({
        id : 123456,
        name : 'Delete Me',
        layers  : ['chocolate', 'strawberry', 'fudge'],
        revenue : 19.95,
        numLayers : 10,
        whoCares: null,
        fat : 0.02,
        bacon : '1',
        date : (new Date()).toISOString(),
        address : {
          state : 'CA',
          zip  : 94107,
          city : 'San Francisco'
        }
      });

      result.should.not.have.property('id');
      result.should.not.have.property('name');
      result.should.not.have.property('whoCares');
      result.should.have.property('address state', 'CA');
      result.should.have.property('layers', 'chocolate,strawberry,fudge');

      done();
    });
  });
});
