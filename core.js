system.parse(

// Core
`
CREATE ; ] POSTPONE [ POSTPONE FINAL [ IMMEDIATE
CREATE : ] POSTPONE CREATE POSTPONE ] ;

: CODE: CREATE POSTPONE CODE POSTPONE ] ;

CODE: MACRO:
  let input = system.input.top();
  system.book.add(new Word(Indirect, input.next()));
  system.book.word.immediate = true;
  let token;
  while ((token = input.next()) !== ";") {
    system.book.word.append(token);
  }
;

CODE: \\
  let input = system.input.top();
  input.skipLine();
; IMMEDIATE

CODE: (
  let input = system.input.top();
  while (input.next() !== ")");
; IMMEDIATE

CODE: EXECUTE
  system.execute(system.data.pop());
;

CODE: EVALUATE 
  system.parse(system.data.pop());
;

CODE: ENCODE
  let source = system.data.pop();
  system.data.push(\`system.parse('\${source}');\`);
;


\\ ECMAScript

CODE: EVAL
  system.data.push(eval(system.data.pop()));
;

CODE: FUNCTION
  let code = system.data.pop();
  let parameters = system.data.pop();
  let definition = [];
  while (parameters--) {
    definition.unshift(system.data.pop());
  }
  definition.push(code);
  system.data.push(new Function(...definition));
;

CODE: CALL
  let code = system.data.pop();
  let count = system.data.pop();
  let parameters = [];
  while (count--) {
    parameters.unshift(system.data.pop());
  }
  let result = code(...parameters);
  if (result !== undefined) {
    system.data.push(result);
  }
;

CODE: NEW
  let code = system.data.pop();
  let count = system.data.pop();
  let parameters = [];
  while (count--) {
    parameters.unshift(system.data.pop());
  }
  let result = eval(\`new \${code}(...parameters)\`);
  if (result !== undefined) {
    system.data.push(result);
  }
;

CODE: METHOD
  let object = system.data.pop();
  let method = system.data.pop();
  let count = system.data.pop();
  let parameters = [];
  while (count--) {
    parameters.unshift(system.data.pop());
  }
  let result = object[method](...parameters);
  if (result !== undefined) {
    system.data.push(result);
  }
;

CODE: UNDEFINED
  system.data.push(undefined);
;

CODE: OBJECT
  system.data.push({});
;

CODE: :OBJECT
  let count = system.data.pop();
  let object = {};
  while (count--) {
    let value = system.data.pop();
    let key = system.data.pop();
    object[key] = value;
  }
  system.data.push(object);
;

: <{ ( -- )
  DEPTH >A ;

: }> ( -- object )
  DEPTH A> - 2 / :OBJECT ;

CODE: ARRAY
  system.data.push([]);
;

CODE: TO-ARRAY
  system.data.push(Array.from(system.data.pop()));
;

CODE: :ARRAY
  let count = system.data.pop();
  let array = [];
  while (count--) {
    array.unshift(system.data.pop());
  }
  system.data.push(array);
;

: <[ ( -- )
  DEPTH >A ;

: ]> ( -- array )
  DEPTH A> - :ARRAY ;

CODE: SPREAD
  let array = system.data.pop();
  system.data.push(...array);
;

CODE: KEYS
  let object = system.data.pop();
  system.data.push(Object.keys(object));
;

CODE: VALUES
  let object = system.data.pop();
  system.data.push(Object.values(object));
;

CODE: DELETE
  let object = system.data.pop();
  let attribute = system.data.pop();
  delete object[attribute];
;

CODE: ?
  let object = system.data.pop();
  let key = system.data.pop();
  system.data.push(object[key]);
;

CODE: !
  let object = system.data.pop();
  let key = system.data.pop();
  let value = system.data.pop();
  object[key] = value;
;

: +! { addend key object -- }
  key object ? addend + key object ! ;

: REVERSE { array -- yarra }
  0 "reverse" array METHOD ;

: SORT { unsorted -- sorted }
  0 "sort" unsorted METHOD ;

: SPLICE# { index count array -- subarray }
  index count 2 "splice" array METHOD ;

: SPLICE { index array -- subarray }
  index array COUNT array SPLICE# ;

: SLICE# { index count array -- subarray }
  index count + { boundary }
  index boundary 2 "slice" array METHOD ;

: SLICE { index array -- subarray }
  index array COUNT array SLICE# ;

: JOIN { array glue -- string }
  glue 1 "join" array METHOD ;

: MERGE { count glue -- string }
  count :ARRAY glue JOIN ;

: TRIM { string -- trimmed }
  0 "trim" string METHOD ;

: FIT { string form -- fitted }
  form string +   { composite }
  form COUNT -1 * { index }
  index 1 "slice" composite METHOD ;

: SPLIT { string delimiter -- array }
  delimiter 1 "split" string METHOD ;

: CONTAINS { item array -- boolean }
  item 1 "indexOf" array METHOD -1 <> ;

CODE: CONCAT
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x.concat(y));
;

CODE: COUNT
  let array = system.data.pop();
  system.data.push(array.length);
;

CODE: PUSH
  let array = system.data.pop();
  let value = system.data.pop();
  array.push(value);
;

CODE: POP
  let array = system.data.pop();
  system.data.push(array.pop());
;

CODE: TIME
  let input = system.input.top();
  let start = performance.now();
  system.evaluate(input.next());
  let end = performance.now();
  system.console.write(\`\${end - start}ms\`);
;


\\ Memory

CODE: VARIABLE
  let input = system.input.top();
  system.book.add(new Word(Direct, input.next()));
  system.book.word.boundary = 1;
  system.book.word.execute = new Function(\`
    let frame = system.frames.top();
    system.data.push(0);
    system.data.push(frame.word.definition);
  \`);
;

CODE: :VARIABLE
  let value = system.data.pop();
  let input = system.input.top();
  system.book.add(new Word(Direct, input.next()));
  system.book.word.boundary = 1;
  system.book.word.definition = [value];
  system.book.word.execute = new Function(\`
    let frame = system.frames.top();
    system.data.push(0);
    system.data.push(frame.word.definition);
  \`);
;

CODE: VALUE
  let input = system.input.top();
  system.book.add(new Word(Direct, input.next()));
  system.book.word.boundary = 1;
  system.book.word.append(system.data.pop());
  system.book.word.execute = new Function(\`
    let frame = system.frames.top();
    system.data.push(frame.word.definition.at(0));
  \`);
;

CODE: TO
  let input = system.input.top();
  let token = input.next();
  let word = system.pile.search(token);
  word.definition[0] = system.data.pop();
;

CODE: {
  let local = true, locals = [];
  let token, frame = system.frames.get(1);
  while (token = frame.word.definition.at(frame.offset)) {
    if (token === "}") {
      break;
    }
    else if (token === "--") {
      local = false;
    }
    else {
      if (local) {
        locals.unshift(token);
      }
    }
    frame.offset++;
  }
  frame.offset++;
  locals.forEach(local => {
    frame.add(local, system.data.pop());
  });
;


\\ Pile

CODE: BOOKS?
  let titles = system.pile.cells.map(book => book.title);
  system.console.write(titles.join(' '));
;

CODE: PUBLISH
  let input = system.input.top();
  system.book = new Book(input.next());
  system.pile.push(system.book);
;

CODE: BURN
  system.pile.pop();
;

CODE: USE
  let input = system.input.top();
  system.book = system.pile.find(input.next());
;


\\ Book

CODE: BOOK?
  system.console.write(system.book.title);
;

CODE: LATEST?
  system.data.push(system.book.word);
;

CODE: WORDS?
  system.console.write(system.book.state());
;


\\ Word


`);
