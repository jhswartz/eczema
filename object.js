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
