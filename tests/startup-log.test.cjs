'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createStartupLog } = require('../src/startup-log.cjs');
test('startup diagnostics survive rotation without touching recovery data', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-log-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const log = createStartupLog(dir);
  const recovery = path.join(dir, 'recovery-v2.json');
  fs.writeFileSync(recovery, 'original');
  fs.writeFileSync(log.file, 'x'.repeat(262145));
  assert.equal(log.write('failure', 'line1\nline2'), true);
  assert.equal(JSON.parse(fs.readFileSync(log.file)).detail, 'line1\nline2');
  assert.equal(fs.statSync(log.file + '.previous').size, 262145);
  assert.equal(fs.readFileSync(recovery, 'utf8'), 'original');
});
test('unwritable diagnostic destination is nonfatal', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-log-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'file');
  fs.writeFileSync(file, 'not a directory');
  assert.equal(createStartupLog(file).write('start'), false);
});
