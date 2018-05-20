import fs from 'fs';
import htom from '../lib/index.js';

test('htom cover html', () => {
  const html = fs.readFileSync('./input.html', { encoding: 'utf-8' });
  const output = fs.readFileSync('./output.md', { encoding: 'utf-8' });
  return htom(html).then((markdown) => {
    expect(markdown).toBe(output);
  });
});


