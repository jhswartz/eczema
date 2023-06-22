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
