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
