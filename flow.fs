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
