system.parse(`

PUBLISH BOOK

CODE: BOOKS?
  let titles = system.pile.cells.map(book => book.title);
  system.console.write(titles.join(' '));
;

CODE: BURN
  system.pile.pop();
;

CODE: USE
  let input = system.input.top();
  system.book = system.pile.find(input.next());
;

CODE: BOOK?
  system.console.write(system.book.title);
;

CODE: LATEST?
  system.data.push(system.book.word);
;

CODE: WORDS?
  system.console.write(system.book.state());
;

`);
