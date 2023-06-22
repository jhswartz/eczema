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

CODE: PUBLISH
  let input = system.input.top();
  system.book = new Book(input.next());
  system.pile.push(system.book);
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

CODE: TIME
  let input = system.input.top();
  let start = performance.now();
  system.evaluate(input.next());
  let end = performance.now();
  system.console.write(\`\${end - start}ms\`);
;

`);
