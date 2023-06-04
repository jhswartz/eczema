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
    this.input   = new Input();
    this.console = new Console();
    this.aux     = new Stack("aux");
    this.data    = new Stack("data");
    this.frames  = new Stack("frames");
    this.pile    = new Pile();
    this.book    = undefined;

    this.initialise();
  }

  parse(source) {
    this.input.update(source);
    let token;
    do { 
      token = this.input.next();
      if (token) {
         this.evaluate(token);
      }
    } while (token);
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
    throw new SystemError(message, {
      cause: {
        "offset": this.input.offset,
        "text": this.input.text
      }
    });
  }

  initialise() {
    this.book = new Book("CORE");

    this.book.add(
      new Word(Direct, "CREATE", [
        "system.book.add(new Word(Indirect, system.input.next()));"
      ])
    );
    
    this.book.add(
      new Word(Direct, "POSTPONE", [
        "system.book.word.append(system.input.next());"
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
