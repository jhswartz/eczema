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
