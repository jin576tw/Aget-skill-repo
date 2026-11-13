import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import test from 'node:test';

test('README indexes every registered skill and agent', () => {
  const readme = fs.readFileSync('README.md','utf8');
  for (const dir of ['skills','agents']) {
    const entries = fs.readdirSync(dir).filter(n => dir === 'skills' ? fs.existsSync(path.join(dir,n,'SKILL.md')) : n.endsWith('.md'));
    for (const name of entries) {
      const target = dir === 'skills' ? `${dir}/${name}/SKILL.md` : `${dir}/${name}`;
      assert.ok(readme.includes(`](${target})`),target);
    }
    assert.ok(readme.includes(`${entries.length} ${dir === 'skills' ? '個 skills' : '個 Agents'}`));
  }
});
test('Python checker diagnoses missing executable and invalid options without Python dependency', () => {
  const missing=spawnSync(process.execPath,['scripts/check-python.mjs','--python','missing-python-executable-123'],{encoding:'utf8'});
  assert.equal(missing.status,1); assert.match(missing.stderr,/Python >=3.10 unavailable/);
  const bad=spawnSync(process.execPath,['scripts/check-python.mjs','--skill','invalid'],{encoding:'utf8'});
  assert.equal(bad.status,2);
});
