'use strict';
const fs = require('node:fs');
const path = require('node:path');

// Diagnostic failures must never prevent startup or modify recovery records.
function createStartupLog(directory) {
  const file = path.join(directory, 'startup.log');
  return {
    file,
    write(event, detail = '') {
      try {
        fs.mkdirSync(directory, { recursive: true });
        if (fs.existsSync(file) && fs.statSync(file).size > 256 * 1024) {
          fs.renameSync(file, file + '.previous');
        }
        fs.appendFileSync(file, JSON.stringify({ time: new Date().toISOString(), event, detail: String(detail).slice(0, 4000) }) + '\n');
        return true;
      } catch { return false; }
    }
  };
}
module.exports = { createStartupLog };
