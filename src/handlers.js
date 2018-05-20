/*
 * parse html to markdown
 */

import { trim } from './util';
import { common, table, anchor } from './types';

const NEW_LINE = '\n';
const BLANK_LINE = '\n\n';
const BLOCK_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div',
  'blockquote', 'ul', 'ol', 'dl', 'pre', 'br', 'hr'
];

// tag tokens
let tokens = [];

// common table anchor
let currentType = [];

// li indent
let listIndent = '';

// anchor reference
let anchors = {};

/**
 * data reset
 *
 * @returns {undefined}
 */
const reset = () => {
  tokens = [];
  currentType = [];
  listIndent = '';
  anchors = {};
  common.reset();
  table.reset();
  anchor.reset();
};

/**
 * get anchors reference
 *
 * @returns {string}
 */
const getAnchorsReference = () =>
  Object.keys(anchors).reduce(
    (res, href) => `${res}\n[${anchors[href]}]: ${href}`,
    '\n'
  );

/**
 * current item
 *
 * @returns {object}
 */
const getCurrentType = () => {
  switch(currentType[0]) {
    case 'anchor':
      return anchor;
    case 'table':
      return table;
    default:
      return common;
  }
};

/**
 * get last append text
 *
 * @returns {string}
 */
const lastText = () => getCurrentType().lastText();

/**
 * pop text
 *
 * @returns {undefined}
 */
const pop = () => getCurrentType().pop();

/**
 * append text to markdown
 *
 * @param {string} text
 * @returns {undefined}
 */
const append = (text) => getCurrentType().append(text);

/**
 * push token
 *
 * @returns {undefined}
 */
const pushToken = (name) => {
  tokens.unshift(name);
};

/**
 * pop token
 *
 * @returns {undefined}
 */
const popToken = (name) => {
  if (tokens[0] === name) {
    tokens.shift();
  }
};

/**
 * resolve text
 *
 * @param {string} text
 * @returns {undefined}
 */
const takeText = (text) => {
  // all tags to ignore spaces and \n in addition to code and pre
  if (tokens[0] === 'code' && tokens[1] !== 'pre') {
    if (text !== NEW_LINE) {
      append(text);
    }
  } else if (tokens[0] === 'pre' || tokens[0] === 'code' && tokens[1] === 'pre') {
    append(text);
  } else if (text !== NEW_LINE && text.trim() !== '') {
    append(trim(text));
  }
};

/**
 * append new line to markdown
 *
 * @returns {undefined}
 */
const newLine = () => {
  const text = lastText();
  if (text !== NEW_LINE && text !== BLANK_LINE) {
    append(NEW_LINE);
  }
};

/**
 * append blank line to markdown
 *
 * @returns {undefined}
 */
const blankLine = () => {
  const text = lastText();
  if (text !== NEW_LINE && text !== BLANK_LINE) {
    append(BLANK_LINE);
  } else if (text === NEW_LINE) {
    pop();
    append(BLANK_LINE);
  }
};

/**
 * close tag and append endSymbol to markdown
 *
 * @param {string} endSymbol
 * @returns {function}
 */
const closeTag = (endSymbol = '') => (name) => {
  const text = lastText();
  popToken(name);
  if (endSymbol === NEW_LINE || endSymbol === BLANK_LINE) {
    if (text === NEW_LINE) {
      pop();
      append(BLANK_LINE);
    } else if (text !== BLANK_LINE) {
      append(endSymbol);
    }
  } else {
    append(endSymbol);
  }
};

/**
 * return handler for h1-h6 tag open
 *
 * @param {number} level
 * @returns {function}
 */
const headOpen = (level) => (name) => {
  pushToken(name);
  blankLine();
  append(`${Array(level + 1).join('#')} `);
};

/**
 * return handlers for h1-h6 tag
 *
 * @param {string} tag
 * @param {number} level
 * @returns {object}
 */
const headTag = (tag, level) => ({
  [`${tag}open`]: headOpen(level),
  [`${tag}text`]: takeText,
  [`${tag}close`]: closeTag(BLANK_LINE)
});

/**
 * return inline tag handlers
 *
 * @param {string} tag
 * @param {string} symbol
 * @returns {object}
 */
const decorationTag = (tag, symbol) => ({
  [`${tag}open`]: (name) => {
    pushToken(name);
    append(symbol);
  },
  [`${tag}text`]: takeText,
  [`${tag}close`]: closeTag(symbol)
});

/**
 * get block tags handlers
 *
 * @param {string} tag
 * @returns {object}
 */
const blockTag = (tag) => ({
  [`${tag}open`]: (name) => {
    pushToken(name);
    blankLine();
    if (tokens[1] === 'blockquote') {
      append('> ');
    }
  },
  [`${tag}text`]: takeText,
  [`${tag}close`]: closeTag(BLANK_LINE)
});

/**
 * get ul ol handlers
 *
 * @param {string} tag
 * @returns {object}
 */
const listTag = (tag) => ({
  [`${tag}open`]: (name) => {
    // inside list
    if (tokens[0] !== 'li') {
      blankLine();
    } else {
      newLine();
      if (tokens[1] === 'ul') {
        listIndent += '  ';
      } else if (tokens[1] === 'ol') {
        listIndent += '   ';
      }
    }
    pushToken(name);
  },
  [`${tag}text`]: () => {},
  [`${tag}close`]: (name) => {
    popToken(name);
    if (tokens[0] !== 'li') {
      blankLine();
    } else {
      if (tokens[1] === 'ul') {
        listIndent = listIndent.slice(0, -2);
      } else if (tokens[1] === 'ol') {
        listIndent = listIndent.slice(0, -3);
      }
    }
  }
});

/**
 * pre tag handlers
 *
 * @returns {object}
 */
const preTag = () => ({
  preopen: (name) => {
    pushToken(name);
    blankLine();
    append('```');
    newLine();
  },
  pretext: takeText,
  preclose: (name) => {
    popToken(name);
    newLine();
    append('```');
    blankLine();
  }
});

/**
 * code tag handlers
 *
 * @returns {object}
 */
const codeTag = () => ({
  codeopen: (name) => {
    if (!tokens[0] || tokens[0] !== 'pre') {
      append('`');
    }
    pushToken(name);
  },
  codetext: takeText,
  codeclose: (name) => {
    popToken(name);
    if (!tokens[0] || tokens[0] !== 'pre') {
      append('`');
    }
  }
});

/**
 * blockquote tag handlers
 *
 * @returns {object}
 */
const blockquoteTag = () => ({
  blockquoteopen: (name) => {
    pushToken(name);
    blankLine();
  },
  blockquotetext: takeText,
  blockquoteclose: closeTag(BLANK_LINE)
});

/**
 * li tag handlers
 *
 * @returns {object}
 */
const liTag = () => ({
  liopen: (name) => {
    if (tokens[0] === 'ul') {
      append(`${listIndent}- `);
    } else if (tokens[0] === 'ol') {
      append(`${listIndent}1. `);
    }
    pushToken(name);
  },
  litext: takeText,
  liclose: (name) => {
    popToken(name);
    if (lastText() !== NEW_LINE) {
      append(NEW_LINE);
    }
  }
});

/**
 * dl dt dd list tag
 *
 * @returns {object}
 */
const dlTags = () => ({
  dlopen: (name) => {
    pushToken(name);
    newLine();
  },
  dlclose: closeTag(BLANK_LINE),
  dtopen: (name) => {
    pushToken(name);
    append(`${listIndent}- `);
  },
  dttext: takeText,
  dtclose: closeTag(NEW_LINE),
  ddopen: (name) => {
    pushToken(name);
    append(`${listIndent}  - `);
  },
  ddtext: takeText,
  ddclose: closeTag(NEW_LINE)
});

/**
 * table handlers
 *
 * @returns {object}
 */
const tableTags = () => ({
  tableopen: (name) => {
    blankLine();
    pushToken(name);
    currentType.unshift('table');
  },
  tableclose: (name) => {
    currentType.shift();
    popToken(name);
    append(table.markdown());
    blankLine();
  },
  tropen: () => {
    table.data.unshift([]);
  },
  ...(['th', 'td'].reduce((res, tag) => ({
    ...res,
    [`${tag}open`]: (name) => {
      table.data[0].unshift([]);
      pushToken(name);
    },
    [`${tag}text`]: takeText,
    [`${tag}close`]: (name) => {
      popToken(name);
    }
  }), {}))
});

/**
 * a tag handlers
 *
 * @returns {object}
 */
const aTag = () => ({
  aopen: (name, attribute) => {
    pushToken(name);
    const href = attribute.href;
    if (!anchors[href]) {
      anchors[href] = Object.keys(anchors).length + 1;
    }
    anchor.href = anchors[href];
    currentType.unshift('anchor');
  },
  atext: takeText,
  aclose: (name) => {
    currentType.shift();
    popToken(name);
    append(anchor.markdown());
  }
});

// tags handlers
const tagsHandlers = {
  // block tags
  ...(['p', 'div'].reduce((res, tag) => ({...res, ...blockTag(tag)}), {})),
  // h1 - h6 tags
  ...([1, 2, 3, 4, 5, 6].reduce((res, level) => ({...res, ...headTag(`h${level}`, level)}), {})),
  // em del strong tags
  ...decorationTag('em', '*'),
  ...decorationTag('del', '~~'),
  ...decorationTag('strong', '**'),
  // pre tag
  ...preTag(),
  // code tag
  ...codeTag(),
  // blockquote tag
  ...blockquoteTag(),
  // list tag
  ...(['ol', 'ul'].reduce((res, tag) => ({...res, ...listTag(tag)}), {})),
  // li tag
  ...liTag(),
  // dl dt dd
  ...dlTags(),
  // table tags
  ...tableTags(),
  // a tags
  ...aTag(),
  inputopen: (name, attribute) => {
    if (tokens[0] && tokens[0] === 'li') {
      append(`[${attribute.checked !== undefined ? 'x' : ' '}] `);
    }
  },
  hropen: () => {
    blankLine();
    append('----------------');
    blankLine();
  },
  bropen: blankLine,
  imgopen: (name, attribute) => {
    const { alt, src } = attribute;
    append(`![${alt || 'image'}](${src})`);
  }
};

// htmlparser2 handlers
export default (res, rej) => ({
  onopentag: (name, attribute) => {
    const fn = `${name}open`;
    if (tagsHandlers[fn]) {
      if ((currentType[0] === 'anchor' || currentType[0] === 'table')
        && BLOCK_TAGS.indexOf(name) !== -1) {
        return;
      }
      tagsHandlers[fn](name, attribute);
    }
  },
  onclosetag: (name) => {
    const fn = `${name}close`;
    if (tagsHandlers[fn]) {
      if ((currentType[0] === 'anchor' || currentType[0] === 'table')
        && BLOCK_TAGS.indexOf(name) !== -1) {
        return;
      }
      tagsHandlers[fn](name);
    }
  },
  ontext: (text) => {
    const fn = `${tokens[0]}text`;
    if (tagsHandlers[fn]) {
      tagsHandlers[fn](text);
    }
  },
  onerror: (e) => rej(e),
  onend: () => {
    const md = `${getCurrentType().markdown()}${getAnchorsReference()}`;
    reset();
    return res(md);
  }
});

