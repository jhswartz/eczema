const Interpret = 0;
const Compile   = 1;

const Direct   = 0;
const Indirect = 1;

class Frame {
  constructor(word, offset = 0, local = {}) {
    this.word   = word;
    this.offset = offset;
    this.local  = local;
  }

  add(key, value) {
    this.local[key] = value;
  }

  has(key) {
    return key in this.local;
  }

  get(key) {
    return this.local[key];
  }
}

class Word {
  constructor(type, token, definition = [], immediate = false) {
    this.type       = type;
    this.token      = token; 
    this.definition = definition; 
    this.immediate  = immediate;
    this.boundary   = 0;

    if (definition) {
      this.finalise();
    }
  }

  append(...token) {
    this.definition.push(...token);
  }

  data() {
    return this.definition.slice(0, this.boundary);
  }

  source() {
    return this.definition.slice(this.boundary);
  }

  finalise() {
    if (this.type == Direct) {
      this.execute = new Function("system", this.source().join(" "));
    }
  }

  execute(system) {
    let frame = system.frames.top();
    frame.offset = this.boundary;
    while (frame.offset < this.definition.length) {
      system.evaluate(this.definition.at(frame.offset++));
    }
  }
}

class Stack {
  constructor(label) {
    this.label = label;
    this.cells = [];
  }

  clear() {
    this.cells = [];
  }

  depth() {
    return this.cells.length;
  }

  push(...values) {
    this.cells.push(...values);
  }

  pop() {
    this.abortOnUnderflow();
    return this.cells.pop();
  }

  top() {
    return this.cells.at(-1);
  }

  drop() {
    this.pop();
  }

  get(n) {
    return this.cells.at(-(n + 1));
  }

  pick(n) {
    this.push(this.get(n));
  }

  roll(n) {
    this.push(this.cells.splice(-(n + 1), 1).at(0));
  }

  dup() {
    this.push(this.top());
  }

  swap() {
    const y = this.pop(); 
    const x = this.pop();
    this.push(y, x);
  }

  over() {
    const y = this.pop(); 
    const x = this.pop();
    this.push(x, y, x);
  }

  nip() {
    const y = this.pop(); 
    const x = this.pop();
    this.push(y);
  }

  tuck() {
    const y = this.pop(); 
    const x = this.pop();
    this.push(y, x, y);
  }

  rot() {
    const z = this.pop(); 
    const y = this.pop(); 
    const x = this.pop();
    this.push(y, z, x);
  }

  nrot() {
    const z = this.pop(); 
    const y = this.pop(); 
    const x = this.pop();
    this.push(z, x, y);
  }

  state() {
    return this.cells.map(JSON.stringify).join(" ");
  }

  abortOnUnderflow() {
    if (this.cells.length == 0) {
      throw new Error(`${this.label} underflow!`);
    }
  }
}

class Pile extends Stack {
  constructor() {
    super("books");
  }

  find(title) {
    for (let index = 0; index < this.depth(); index++) {
      let book = this.get(index);
      if (book.title == title) {
        this.roll(index);
        return this.top();
      }
    }
    this.abortIfNotFound(title);
  }

  search(token) {
    for (let index = 0; index < this.depth(); index++) {
      let book = this.get(index);
      let word = book.get(token);
      if (word) {
        return word;
      }
    }
  }

  titles() {
    return this.cells.map(book => book.title);
  }

  abortIfNotFound(token) {
    throw new Error(`${token} book not found`);
  }
}

class Book {
  constructor(title) {
    this.title = title;
    this.word  = undefined;
    this.words = {};
  }

  add(word) {
    this.words[word.token] = word;
    this.word = word;
  }

  remove(token) {
    delete this.words[token];
  }

  count() {
    return Object.keys(this.words.length);
  }

  contains(token) {
    return token in this.words;
  }

  get(token) {
    return this.words[token];
  }

  state() {
    return Object.keys(this.words).join(" ");
  }
}

class Input {
  constructor(text = "", offset = 0) {
    this.update(text, offset);
    this.space = [ ' ', '\t', '\n' ];
  }

  update(text = "", offset = 0) {
    this.text = text;
    this.offset = offset;
  }

  nextSpace() {
    let offset = this.offset;
    while (offset < this.text.length) {
      if (this.space.includes(this.text[offset])) {
        break;
      }
      offset++;
    }
    return offset;
  }

  skipSpace() {
    while (this.offset < this.text.length) {
      if (!this.space.includes(this.text[this.offset])) {
        break;
      }
      this.offset++;
    }
  }

  nextBoundary() {
    if (this.text[this.offset] == '"') {
      let next = this.text.indexOf('"', this.offset + 1);
      if (next != -1) {
        return next + 1;
      }
    }
    return this.nextSpace();
  }

  token() {
    if (this.offset < this.text.length) {
      let boundary = this.nextBoundary();
      let token = this.text.slice(this.offset, boundary);
      this.offset = boundary;
      return token;
    }
  }

  next() {
    this.skipSpace();
    return this.token();
  }

  tokens() {
    let tokens = [];
    while (this.offset < this.text.length) {
      tokens.push(this.next());
    }
    return tokens;
  }

  skipLine() {
    while (this.offset < this.text.length) {
      if (this.text[this.offset] == '\n') {
        this.offset++;
        break;
      }
      this.offset++;
    }
  }

  static isString(token) {
    return token[0] == '"' && token[token.length - 1] == '"';
  }

  static dequote(string) {
    if (this.isString(string)) {
      string = string.slice(1, -1);
    }
    return string;
  }
}

class InputError extends Error {
  constructor(message) {
    super(message);
  }
}

class Console {
  constructor(writer = console.log, reader = undefined) {
    this.write = writer;
    this.read  = reader; 
  }
}

class SystemError extends Error {
  constructor(message, cause) {
    super(message, cause);
  }
}

class System {
  constructor() {
    this.mode    = Interpret; 
    this.console = new Console();
    this.input   = new Stack("input");
    this.aux     = new Stack("aux");
    this.data    = new Stack("data");
    this.frames  = new Stack("frames");
    this.pile    = new Pile();
    this.book    = undefined;

    this.initialise();
  }

  parse(source) {
    this.input.push(new Input(source));
    let token;
    do { 
      token = this.input.top().next();
      if (token) {
         this.evaluate(token);
      }
    } while (token);
    this.input.drop();
  }

  evaluate(token) {
    if (token) {
      if (this.mode == Compile) {
        this.compile(token);
      }
      else {
        this.interpret(token);
      }
    }
  }

  compile(token) {
    let word = this.pile.search(token);
    if (word && word.immediate) {
      this.execute(word);
    }
    else {
      this.book.word.append(token);
    }
  }

  interpret(token) {
    let frame = this.frames.top();
    if (frame) {
      if (frame.has(token)) {
        this.data.push(frame.get(token));
        return;
      }
    }

    let word = this.pile.search(token);
    if (word) {
      this.execute(word);
      return;
    }

    if (Input.isString(token)) {
      this.data.push(Input.dequote(token));
      return;
    }

    let number = parseFloat(token);
    if (!isNaN(number)) {
      this.data.push(number);
      return;
    }

    this.error(`Unrecognised token: ${token}`);
  }

  execute(word) {
    let frame = new Frame(word);
    system.frames.push(frame);
    try {
      word.execute(this);
    }
    catch (error) {
      this.interpret('BACKTRACE');
      this.console.error(error.message);
    }
    system.frames.drop();
  }

  error(message) {
    let input = this.input.top();
    throw new SystemError(message, {
      cause: {
        "offset": input.offset,
        "text": input.text
      }
    });
  }

  initialise() {
    this.book = new Book("CORE");

    this.book.add(
      new Word(Direct, "CREATE", [
        "let input = system.input.top();",
        "system.book.add(new Word(Indirect, input.next()));"
      ])
    );
    
    this.book.add(
      new Word(Direct, "POSTPONE", [
        "let input = system.input.top();",
        "system.book.word.append(input.next());"
      ], true)
    );
    
    this.book.add(
      new Word(Direct, "]", [
        "system.mode = Compile"
      ])
    );
    
    this.book.add(
      new Word(Direct, "[", [
        "system.mode = Interpret"
      ], true)
    );
    
    this.book.add(
      new Word(Direct, "FINAL", [
        "system.book.word.finalise();"
      ])
    );
    
    this.book.add(
      new Word(Direct, "IMMEDIATE", [
        "system.book.word.immediate = true;"
      ])
    );
    
    this.book.add(
      new Word(Direct, "CODE", [
        "system.book.word.type = Direct;"
      ])
    );

    this.pile.push(this.book);
  }
}

let system = new System();
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

`);
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
system.parse(`

PUBLISH WORD

CODE: ,
  system.book.word.append(system.data.pop());
;

CODE: '
  let input = system.input.top();
  system.data.push(system.pile.search(input.next()));
;

: DEFINITION? ( word -- definition )
  "definition" SWAP ? ;

: FUNCTION? ( word -- function )
  "execute" SWAP ? ;

: SEE ( token -- )
  " " 1 "join" POSTPONE ' DEFINITION? METHOD . ;

: INSPECT ( item -- )
  DUP . ;

CODE: WORD
  let input = system.input.top();
  system.data.push(input.next());
;

`);
system.parse(`

PUBLISH MEMORY 

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

`);
system.parse(`

PUBLISH FLOW

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
  JUMP? [ LATEST? DEFINITION? COUNT ] 0 ;

MACRO: THEN
  [ LATEST? DEFINITION? COUNT SWAP LATEST? DEFINITION? ! ] ;

MACRO: ELSE
  JUMP [ LATEST? DEFINITION? COUNT SWAP ] 0 THEN ;

MACRO: BEGIN
  [ LATEST? DEFINITION? COUNT ] ;

MACRO: UNTIL
  JUMP? [ , ] ;

MACRO: AGAIN
  JUMP [ , ] ;

MACRO: WHILE
  IF ;

MACRO: REPEAT
  JUMP [ SWAP , ] THEN ;

`);
system.parse(`

PUBLISH STACK

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

`);
system.parse(`

PUBLISH ARITHMETIC

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

`);
system.parse(`

PUBLISH COMPARE

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
system.parse(`

PUBLISH OBJECT

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

`);
system.parse(`

PUBLISH ARRAY

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

: CONTAINS { item array -- boolean }
  item 1 "indexOf" array METHOD -1 <> ;

`);
system.parse(`

PUBLISH STRING

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

`);
system.parse(`

PUBLISH WINDOW

CODE: WINDOW
  system.data.push(window);
;

: SET-INTERVAL { function interval -- id }
  function interval 2 "setInterval" WINDOW METHOD ;

: CLEAR-INTERVAL { id -- }
  id 1 "clearInterval" WINDOW METHOD ;

`);
system.parse(`

PUBLISH DOM

CODE: DOCUMENT
  system.data.push(document);
;

: SELECT-CLASS { name -- selector }
  <[ "." name ]> "" JOIN ;

: QUERY-SELECTOR { selector element -- nested-element }
  selector 1 "querySelector" element METHOD ;

: QUERY-ALL { selector element -- nested-elements }
  selector 1 "querySelectorAll" element METHOD ;

: CREATE-ELEMENT ( name -- element )
  1 "createElement" DOCUMENT METHOD ;

: CLASS? { element -- name }
  "className" element ? ;

: CLASS! { name element -- }
  name "className" element ! ;

: APPEND { child parent -- }
  child 1 "append" parent METHOD ;

: PREPEND { child parent -- }
  child 1 "prepend" parent METHOD ;

: TEXT? { element -- text }
  "textContent" element ? ;

: ADD-EVENT-LISTENER { function event element -- }
  event function 2 "addEventListener" element METHOD ;
  
: ON-EVENT { token -- function }
  "event" 1 <[
    "system.data.push(event);
     system.evaluate('" token "');"
  ]> "" JOIN
  FUNCTION ;

: PREVENT-DEFAULT { event -- }
  0 "preventDefault" event METHOD ;

: WHEN-POINTER-MOVES { function element -- }
  function "pointermove" element ADD-EVENT-LISTENER ;

: WHEN-CLICKED { function element -- }
  function "click" element ADD-EVENT-LISTENER ;

: WHEN-KEY-RELEASED { function element -- }
  function "keyup" element ADD-EVENT-LISTENER ;

: WHEN-MENU-REQUESTED { function element -- }
  function "contextmenu" element ADD-EVENT-LISTENER ;

: STYLE? { element -- style }
  "style" element ? ;

: COLOUR? { element -- colour }
  "color" element STYLE? ;

: COLOUR! { colour element -- }
  colour element COLOUR? ! ;

: OPACITY? { element -- opacity }
  "opacity" element STYLE? ;

: OPACITY! { opacity element -- }
  opacity element OPACITY? ! ;

: HIDE { element -- }
  "none" "display" element STYLE? ! ;

: DISPLAY { type element -- }
  type "display" element STYLE? ! ;

: VISIBLE? { element -- }
  "none" "display" element STYLE? ? <> ;

: TOGGLE-VISIBILITY { type element -- }
  element VISIBLE? IF
    element HIDE
  ELSE
    type element DISPLAY
  THEN ;

: FOCUS { element -- }
  0 "focus" element METHOD ;

`);
system.parse(` 

PUBLISH CANVAS

( Canvas )

: DIMENSIONS! { width height canvas -- }
  width "width" canvas ! height "height" canvas ! ;

: DIMENSIONS? { canvas -- width height }
  "width" canvas ? "height" canvas ? ;
 
: CANVAS { width height -- canvas }
  "canvas" CREATE-ELEMENT { canvas }
  width height canvas DIMENSIONS! canvas ;


( Context )

: GET-CONTEXT ( type canvas -- context )
  1 "getContext" ROT METHOD ;

: 2D ( canvas -- context )
  "2d" SWAP GET-CONTEXT ;


( Style )

: FILL-STYLE ( value context -- )
  "fillStyle" SWAP ! ;

: STROKE-STYLE ( value context -- )
  "strokeStyle" SWAP ! ;


( Rectangles )

: FILL-RECT ( x y width height context -- )
  4 "fillRect" ROT METHOD ;

: STROKE-RECT ( x y width height context -- )
  4 "strokeRect" ROT METHOD ;

: CLEAR-RECT ( x y width height context -- )
  4 "clearRect" ROT METHOD ;


( Text )

: FONT! ( font-face context -- )
  "font" SWAP ! ;

: TEXT-ALIGN! ( alignment context -- )
  "textAlign" SWAP ! ;

: TEXT-BASELINE! ( alignment context -- )
  "textBaseline" SWAP ! ;

: FILL-TEXT ( text x y context -- )
  3 "fillText" ROT METHOD ;

: STOKE-TEXT ( text x y context -- )
  3 "strokeText" ROT METHOD ;


( Paths )

: BEGIN-PATH ( context -- )
  0 "beginPath" ROT METHOD ;

: CLOSE-PATH ( context -- )
  0 "closePath" ROT METHOD ;

: FILL ( context -- )
  0 "fill" ROT METHOD ;

: STROKE ( context -- )
  0 "stroke" ROT METHOD ;

: CLIP ( context -- )
  0 "clip" ROT METHOD ;

: MOVE-TO ( x y context -- )
  2 "moveTo" ROT METHOD ;

: LINE-TO ( x y context -- )
  2 "lineTo" ROT METHOD ;

: SET-LINE-DASH ( segments context -- )
  1 "setLineDash" ROT METHOD ;

: QUADRATIC-CURVE-TO ( cpx cpy x y context -- )
  4 "quadraticCurveTo" ROT METHOD ;

: BEZIER-CURVE-TO ( cp1x cp1y cp2x cp2y x y context -- )
  6 "bezierCurveTo" ROT METHOD ;

: ARC-TO ( x1 y1 x2 y2 radius context -- )
  5 "arcTo" ROT METHOD ;

: ARC ( x y radius startAngle endAngle anticlockwise context -- )
  6 "arc" ROT METHOD ;

: RECT ( x y w h context -- )
  4 "rect" ROT METHOD ;

: IS-POINT-IN-PATH ( x y context -- )
  2 "isPointInPath" ROT METHOD ;

`);
system.parse(`

PUBLISH TIME

86400 VALUE SECONDS/DAY
3600  VALUE SECONDS/HOUR
60    VALUE SECONDS/MINUTE

: DAYS? { seconds -- days }
  seconds SECONDS/DAY / FLOOR ;

: HOURS? { seconds -- hours }
  seconds SECONDS/DAY  MOD
          SECONDS/HOUR / FLOOR ;

: MINUTES? { seconds -- hours }
  seconds SECONDS/DAY    MOD
          SECONDS/HOUR   MOD
          SECONDS/MINUTE / FLOOR ;

: SECONDS? { seconds -- hours }
  seconds SECONDS/DAY    MOD
          SECONDS/HOUR   MOD
          SECONDS/MINUTE MOD ;

CODE: TIME
  let input = system.input.top();
  let start = performance.now();
  system.evaluate(input.next());
  let end = performance.now();
  system.console.write(\`\${end - start}ms\`);
;

`);
system.console.error = function(error) {
  system.data.push(error);
  system.evaluate("ERROR");
}

system.console.write = function(text, colour = "#ccc") {
  system.data.push(text, colour);
  system.evaluate("WRITE");
};

system.console.read = function(text) {
  try {
    system.data.push(text);
    system.evaluate("READ");
  }
  catch (error) {
    system.evaluate("BACKTRACE");
    system.console.error(error);
  }
}

system.parse(`

PUBLISH CONSOLE

( View )

-1 :VARIABLE LineIndex

"#2a9" VALUE TimestampOutput
"#ccc" VALUE DefaultOutput
"#6ec" VALUE InputOutput
"#ec2" VALUE ErrorOutput

"#view"    DOCUMENT QUERY-SELECTOR VALUE #view
"#output"  DOCUMENT QUERY-SELECTOR VALUE #output
"#control" DOCUMENT QUERY-SELECTOR VALUE #control
"#input"   DOCUMENT QUERY-SELECTOR VALUE #input
"#enter"   DOCUMENT QUERY-SELECTOR VALUE #enter
"#mode"    DOCUMENT QUERY-SELECTOR VALUE #mode


( Input / Output )

: LINE { text colour -- line }
  "p" CREATE-ELEMENT { line }
  colour line COLOUR? !
  text line APPEND
  line ;

: WRITE ( text colour -- )
  LINE #output PREPEND ;

: BREAK ( -- )
  "br" CREATE-ELEMENT #output PREPEND ;

: TIMESTAMP ( -- )
  0 "Date" NEW                { date }
  0 "toUTCString" date METHOD { utcDate }
  utcDate TimestampOutput WRITE ;

: INPUT ( text -- )
  InputOutput LINE { line }
  "input-line" line CLASS!
  line #output PREPEND ;

: ERROR ( error -- )
  ErrorOutput WRITE ;

: READ { text -- }
  BREAK TIMESTAMP
  text INPUT
  text EVALUATE ;


( Control )

: TOGGLE-MODE { event -- }
  "zIndex" #view STYLE? ? "2" <> IF
    "2" "zIndex" #view STYLE? !
    "CODE" "innerHTML" #mode !
  ELSE
    "0" "zIndex" #view STYLE? !
    "VIEW" "innerHTML" #mode !
  THEN
  #input FOCUS ;

: INPUT! { text -- }
  text "value" #input ! ;

: CLEAR-INPUT { -- }
  "" INPUT!
  -1 LineIndex ! ;

: ENTER { event -- }
  "value" #input ? { text }
  text IF
    text READ
    CLEAR-INPUT
  THEN
  #input FOCUS ;

: STEP-INPUT { step -- }
  LineIndex ?                      { index }
  ".input-line" DOCUMENT QUERY-ALL { inputs }
  index step + inputs ? UNDEFINED = IF 
    CLEAR-INPUT
  ELSE
    step LineIndex +!
    LineIndex ? inputs ? { input }
    input IF
      "textContent" input ? INPUT!
    THEN
  THEN ;

: PREVIOUS-INPUT ( -- )
  +1 STEP-INPUT ;

: NEXT-INPUT ( -- )
  -1 STEP-INPUT ;

: KEY { event -- }
  "key" event ? "ArrowUp" = IF
    event PREVENT-DEFAULT PREVIOUS-INPUT EXIT
  THEN

  "key" event ? "ArrowDown" = IF
    event PREVENT-DEFAULT NEXT-INPUT EXIT
  THEN

  "key" event ? "Enter" = IF
    event PREVENT-DEFAULT event ENTER
  THEN ;


( Initialisation )

: EXPECT-EVENTS ( -- )
  "TOGGLE-MODE" ON-EVENT #mode  WHEN-CLICKED
  "ENTER"       ON-EVENT #enter WHEN-CLICKED
  "KEY"         ON-EVENT #input WHEN-KEY-RELEASED ;

: MAKE-ANNOUNCEMENTS ( -- )
  "слава україні! https://war.ukraine.ua/support-ukraine/" "#fd0" WRITE
  "россия будет свободной! https://legionliberty.army/" "#5cd" WRITE
  "Живе́ Білору́сь! https://kalinouski.org/" "#f66" WRITE ;
 
: START ( -- )
  #input FOCUS ;

EXPECT-EVENTS MAKE-ANNOUNCEMENTS START

`);
