import { rightPad } from './util';

export const common = {
  data: [],
  append: (text) => {
    common.data.unshift(text);
  },
  pop: () => {
    common.data.shift();
  },
  lastText: () => common.data[0],
  reset: () => {
    common.data = [];
  },
  markdown: () => {
    return common.data.reverse().join('').trim();
  }
};

export const table = {
  data: [],
  append: (text) => {
    table.data[0][0].unshift(text);
  },
  pop: () => {
    table.data[0][0].shift();
  },
  lastText: () => table.data[0] && table.data[0][0],
  markdown: () => {
    let md = '';
    let headLine = '';
    const result = [];
    const rows = table.data.map(tr => tr.reverse());
    const length = [];
    rows.forEach(tr => {
      result.unshift([]);
      tr.forEach((td, idx) => {
        const tdText = td.reverse().join('');
        result[0].push(tdText);
        if (length[idx] === undefined || length[idx] < tdText.length) {
          length[idx] = tdText.length;
        }
      });
    });
    length.forEach(len => {
      headLine += `| ${Array(len + 1).join('-')} `;
    });
    headLine += '|\n';
    result.forEach((tr, trIdx) => {
      tr.forEach((td, idx) => {
        md += `| ${rightPad(td, length[idx])} `;
      });
      md += '|\n';
      if (trIdx === 0) {
        md += headLine;
      }
    });
    return md;
  },
  reset: () => {
    table.data = [];
    table.isHasHead = false;
  }
};

export const anchor = {
  data: [],
  href: '',
  append: (text) => {
    anchor.data.unshift(text);
  },
  pop: () => {
    anchor.data.shift();
  },
  lastText: () => anchor.data[0],
  reset: () => {
    anchor.data = [];
    anchor.href = [];
  },
  markdown: () => {
    return `[${anchor.data.reverse().join('')}][${anchor.href}]`;
  }
};

