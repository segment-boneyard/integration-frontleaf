
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Frontleaf`
 */

var Frontleaf = module.exports = integration('Frontleaf')
  .endpoint('https://api.frontleaf.com/api/track')
  .ensure('settings.stream')
  .ensure('settings.token')
  .ensure('message.userId')
  .channels(['server'])
  .mapper(mapper)
  .retries(2);

/**
 * Identify.
 *
 * http://docs.frontleaf.com/#/api-reference/data-collection-api/identify
 *
 * @param {Identify} identify
 * @param {Function} fn
 * @api public
 */

Frontleaf.prototype.identify = request('/identify');

/**
 * Group.
 *
 * http://docs.frontleaf.com/#/api-reference/data-collection-api/identify
 *
 * @param {Group} group
 * @param {Function} fn
 * @api public
 */

Frontleaf.prototype.group = request('/identify');

/**
 * Track.
 *
 * http://docs.frontleaf.com/#/api-reference/data-collection-api/event
 *
 * @param {Track} track
 * @param {Function} fn
 * @api public
 */

Frontleaf.prototype.track = request('/event');

/**
 * Generate request.
 *
 * @param {String} path
 * @return {Function}
 * @api private
 */

function request(path){
  return function(payload, fn){
    return this
      .post(path)
      .type('json')
      .send(payload)
      .end(this.handle(fn));
  };
}
