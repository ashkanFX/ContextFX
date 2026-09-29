const LOG_LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

const DEFAULT_LEVEL = LOG_LEVELS.DEBUG;

function getLogger(namespace, level = DEFAULT_LEVEL) {
  const prefix = `[${namespace}]`;

  function log(message, extraData, currentLevel = level) {
    if (currentLevel < DEFAULT_LEVEL) return;

    const stamp = new Date().toISOString();
    const payload = extraData !== undefined ? extraData : null;

    if (payload !== null && typeof payload === 'object') {
      console.log(stamp, prefix, message, payload);
      return;
    }

    console.log(stamp, prefix, message);
  }

  return {
    debug: (message, data) => log(message, data, LOG_LEVELS.DEBUG),
    info: (message, data) => log(message, data, LOG_LEVELS.INFO),
    warn: (message, data) => log(message, data, LOG_LEVELS.WARN),
    error: (message, data) => log(message, data, LOG_LEVELS.ERROR),
  };
}

window.ContextFXLogger = getLogger;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getLogger, LOG_LEVELS };
}
