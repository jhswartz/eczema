system.parse(`

PUBLISH DOM

CODE: DOCUMENT
  system.data.push(document);
;

: SELECT-CLASS { name -- selector }
  <[ "." name ]> "" JOIN ;

: QUERY-SELECTOR { selector element -- nested-element }
  selector 1 "querySelector" element METHOD ;

: QUERY-ALL { selector element -- nested-elements }
  selector 1 "querySelectorAll" element METHOD ;

: CREATE-ELEMENT ( name -- element )
  1 "createElement" DOCUMENT METHOD ;

: CLASS? { element -- name }
  "className" element ? ;

: CLASS! { name element -- }
  name "className" element ! ;

: APPEND { child parent -- }
  child 1 "append" parent METHOD ;

: PREPEND { child parent -- }
  child 1 "prepend" parent METHOD ;

: TEXT? { element -- text }
  "textContent" element ? ;

: ADD-EVENT-LISTENER { function event element -- }
  event function 2 "addEventListener" element METHOD ;
  
: ON-EVENT { token -- function }
  "event" 1 <[
    "system.data.push(event);
     system.evaluate('" token "');"
  ]> "" JOIN
  FUNCTION ;

: PREVENT-DEFAULT { event -- }
  0 "preventDefault" event METHOD ;

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

: COLOUR! { colour element -- }
  colour element COLOUR? ! ;

: OPACITY? { element -- opacity }
  "opacity" element STYLE? ;

: OPACITY! { opacity element -- }
  opacity element OPACITY? ! ;

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
