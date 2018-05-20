/**
 * right pad
 *
 * @param {string} str
 * @param {number} len
 * @param {string} gap
 * @returns {undefined}
 */
export const rightPad = (str = '', len = 0, gap = ' ') => {
  if (str.length > len) {
    return str;
  }
  return `${str}${Array(len - str.length + 1).join(gap)}`;
};

/**
 * trim start and end space char
 *
 * @param {string} str
 * @returns {string}
 */
export const trim = (str) => {
  return str.replace(/\s+/g, ' ');
};

