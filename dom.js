system.parse(`

PUBLISH DOM

CODE: DOCUMENT
  system.data.push(document);
;

: SELECT-CLASS { name -- selector }
  <[ "." name ]> "" JOIN ;

: QUERY-SELECTOR ( selector -- element )
  1 "querySelector" DOCUMENT METHOD ;

: QUERY-ALL ( selector -- element )
  1 "querySelectorAll" DOCUMENT METHOD ;

: CREATE-ELEMENT ( name -- element )
  1 "createElement" DOCUMENT METHOD ;

: CLASS! { name element -- }
  name "className" element ! ;

: APPEND { child parent -- }
  child 1 "append" parent METHOD ;

: PREPEND { child parent -- }
  child 1 "prepend" parent METHOD ;

: ADD-EVENT-LISTENER { function event element -- }
  event function 2 "addEventListener" element METHOD ;
  
: ON-EVENT { token -- function }
  "event" 1 <[
    "system.data.push(event);
     system.interpret('" token "');"
  ]> "" JOIN
  FUNCTION ;

: WHEN-POINTER-MOVES { function element -- }
  function "pointermove" element ADD-EVENT-LISTENER ;

: WHEN-CLICKED { function element -- }
  function "click" element ADD-EVENT-LISTENER ;

: WHEN-KEY-RELEASED { function element -- }
  function "keyup" element ADD-EVENT-LISTENER ;

: WHEN-MENU-REQUESTED { function element -- }
  function "contextmenu" element ADD-EVENT-LISTENER ;

: STYLE? { element -- style }
  "style" element ? ;

: COLOUR? { element -- colour }
  "color" element STYLE? ;

: HIDE { element -- }
  "none" "display" element STYLE? ! ;

: DISPLAY { type element -- }
  type "display" element STYLE? ! ;

: VISIBLE? { element -- }
  "none" "display" element STYLE? ? <> ;

: TOGGLE-VISIBILITY { type element -- }
  element VISIBLE? IF
    element HIDE
  ELSE
    type element DISPLAY
  THEN ;

: FOCUS { element -- }
  0 "focus" element METHOD ;

`);
