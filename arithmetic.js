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
