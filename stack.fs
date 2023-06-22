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
