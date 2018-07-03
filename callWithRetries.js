'use strict';

async function delay(timeoutMS) {
    return new Promise(resolve => setTimeout(resolve, timeoutMS));
}

module.exports = function (opts) {
    var MAX_RETRIES = Number(opts.MAX_RETRIES) || 1;
    var RETRY_DELAY_MS = Number(opts.RETRY_DELAY_MS) || 1000;
    var callCounter = 0;
    var lastEx = null;
    return async function (fn, ...args) {
        while(callCounter <= MAX_RETRIES) {
            try {
                return await fn(...args);
            }
            catch (ex) {
                lastEx = ex;
                callCounter += 1;
                await delay(RETRY_DELAY_MS);
            }
        }
        throw lastEx;
    };
};
