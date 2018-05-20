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
    const md = common.data.reverse().join('').trim();
    common.reset();
    return md;
  }
};

export const table = {
  extra: [],
  data: [],
  append: (text) => {
    if (table.data[0] && table.data[0][0]) {
      table.data[0][0].unshift(text);
    } else {
      table.extra.unshift(text);
    }
  },
  pop: () => {
    if (table.data[0] && table.data[0][0]) {
      table.data[0][0].shift();
    } else {
      table.extra.shift();
    }
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
    if (table.extra.length) {
      md = `${table.extra.reverse().join('')}\n\n${md}`;
    }
    table.reset();
    return md;
  },
  reset: () => {
    table.extra = [];
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
    anchor.href = '';
  },
  markdown: () => {
    const md = `[${anchor.data.reverse().join('')}][${anchor.href}]`;
    anchor.reset();
    return md;
  }
};

export const header = {
  data: [],
  id: '',
  append: (text) => {
    header.data.unshift(text);
  },
  pop: () => {
    header.data.shift();
  },
  lastText: () => header.data[0],
  reset: () => {
    header.data = [];
    header.id = '';
  },
  markdown: () => {
    const md = header.data.reverse().join('');
    header.reset();
    return md;
  }
};
