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
