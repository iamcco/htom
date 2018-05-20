import htmlparser from 'htmlparser2';
import parseHandlers from './handlers';

export default (html) => new Promise((res, rej) => {

  const parser = new htmlparser.Parser(
    parseHandlers(res, rej),
    {
      decodeEntities: true,
      xmlMode: true
    }
  );

  parser.write(html);

  parser.end();
});
