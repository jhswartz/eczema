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
