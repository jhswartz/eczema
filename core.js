system.parse(

// Core
`
CREATE ; ] POSTPONE [ POSTPONE FINAL [ IMMEDIATE
CREATE : ] POSTPONE CREATE POSTPONE ] ;

: CODE: CREATE POSTPONE CODE POSTPONE ] ;

CODE: MACRO:
  system.book.add(new Word(Indirect, system.input.next()));
  system.book.word.immediate = true;
  let token;
  while ((token = system.input.next()) !== ";") {
    system.book.word.append(token);
  }
;

CODE: \\
  system.input.skipLine();
; IMMEDIATE

CODE: (
  while (system.input.next() !== ")");
; IMMEDIATE

CODE: PARSE 
  system.parse(system.data.pop());
;


\\ ECMAScript

CODE: :CODE
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
  let start = performance.now();
  system.evaluate(system.input.next());
  let end = performance.now();
  system.console.write(\`\${end - start}ms\`);
;


\\ Memory

CODE: VARIABLE
  system.book.add(new Word(Direct, system.input.next()));
  system.book.word.boundary = 1;
  system.book.word.execute = new Function(\`
    let frame = system.frames.top();
    system.data.push(0);
    system.data.push(frame.word.definition);
  \`);
;

CODE: VALUE
  system.book.add(new Word(Direct, system.input.next()));
  system.book.word.boundary = 1;
  system.book.word.append(system.data.pop());
  system.book.word.execute = new Function(\`
    let frame = system.frames.top();
    system.data.push(frame.word.definition.at(0));
  \`);
;

CODE: TO
  let token = system.input.next();
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
  system.book = new Book(system.input.next());
  system.pile.push(system.book);
;

CODE: BURN 
  system.pile.pop();
;

CODE: USE 
  system.book = system.pile.find(system.input.next());
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

CODE: ,
  system.book.word.append(system.data.pop());
;

CODE: '
  system.data.push(system.pile.search(system.input.next()));
;

: DEFINITION ( word -- definition )
  "definition" SWAP ? ;

: FUNCTION? ( word -- function )
  "execute" SWAP ? ;

: SEE ( token -- )
  " " 1 "join" POSTPONE ' DEFINITION METHOD . ;

: INSPECT ( item -- ) 
  DUP . ;


\\ Flow

CODE: BACKTRACE
  let depth = system.frames.depth();
  for (let level = depth - 1; level > 0; level--) {
    let frame  = system.frames.get(level);
    let token  = frame.word.token;
    let type   = frame.word.type;
    let offset = frame.offset;
    if (type == Indirect) {
      offset--;
    }
    let printableOffset = ("0000" + offset).slice(-4);
    system.console.write(
      \`\${type} \${printableOffset} \${token}\`
    );
  }
;

CODE: EXIT
  let frame = system.frames.get(1);
  frame.offset = frame.word.definition.length;
;

CODE: JUMP
  let frame = system.frames.get(1);
  frame.offset = frame.word.definition.at(frame.offset);
;

CODE: JUMP?
  let frame = system.frames.get(1);
  if (system.data.pop()) {
    frame.offset++;
  }
  else {
    frame.offset = frame.word.definition.at(frame.offset);
  }
;

MACRO: IF
  JUMP? [ LATEST? DEFINITION COUNT ] 0 ;

MACRO: THEN
  [ LATEST? DEFINITION COUNT SWAP LATEST? DEFINITION ! ] ;

MACRO: ELSE
  JUMP [ LATEST? DEFINITION COUNT SWAP ] 0 THEN ;

MACRO: BEGIN
  [ LATEST? DEFINITION COUNT ] ;

MACRO: UNTIL
  JUMP? [ , ] ;

MACRO: AGAIN
  JUMP [ , ] ;

MACRO: WHILE
  IF ;

MACRO: REPEAT
  JUMP [ SWAP , ] THEN ;


\\ Input

CODE: WORD 
  system.data.push(system.input.next());
;


\\ Stack

CODE: DEPTH
  system.data.push(system.data.depth());
;

CODE: CLEAR
  system.data.clear();
;

CODE: DUP
  system.data.dup();
;

CODE: DROP
  system.data.drop();
;

CODE: SWAP
  system.data.swap();
;

CODE: OVER
  system.data.over();
;

CODE: NIP 
  system.data.nip();
;

CODE: TUCK
  system.data.tuck();
;

CODE: ROLL 
  system.data.roll(system.data.pop());
;

CODE: PICK
  system.data.pick(system.data.pop());
;

CODE: ROT
  system.data.rot();
;

CODE: -ROT
  system.data.nrot();
;

CODE: .
  system.console.write(JSON.stringify(system.data.pop()));
;

CODE: .S
  let depth = system.data.depth();
  let state = system.data.state();
  system.console.write(\`<\${depth}> \${state}\`);
;

CODE: >A
  system.aux.push(system.data.pop());
;

CODE: A>
  system.data.push(system.aux.pop());
;

CODE: A?
  system.data.push(system.aux.top());
;

CODE: .A
  let depth = system.aux.depth();
  let state = system.aux.state();
  system.console.write(\`<\${depth}> \${state}\`);
;

CODE: ADROP
  system.aux.drop();
;


\\ Arithmetic 

CODE: +
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x + y);
;

CODE: -
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x - y);
;

CODE: *
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x * y);
;

CODE: /
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x / y);
;

CODE: MOD 
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x % y);
;

CODE: <<
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x << y);
;

CODE: >>
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x >> y);
;

CODE: AND 
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x & y);
;

CODE: OR 
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x | y);
;

CODE: XOR 
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x ^ y);
;

CODE: INVERT 
  system.data.push(~system.data.pop());
;

CODE: TRUE
  system.data.push(true);
;

CODE: FALSE
  system.data.push(false);
;

CODE: FLOOR
  system.data.push(Math.floor(system.data.pop()));
;

CODE: CEILING
  system.data.push(Math.ceil(system.data.pop()));
;


\\ Comparison

CODE: =
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x === y);
;

CODE: <>
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x !== y);
;

CODE: <
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x < y);
;

CODE: <=
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x <= y);
;

CODE: >
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x > y);
;

CODE: >=
  let y = system.data.pop();
  let x = system.data.pop();
  system.data.push(x >= y);
;

`);
