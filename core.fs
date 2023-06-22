system.parse(`

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

CODE: TIME
  let input = system.input.top();
  let start = performance.now();
  system.evaluate(input.next());
  let end = performance.now();
  system.console.write(\`\${end - start}ms\`);
;

`);
