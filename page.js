system.parse(`

PUBLISH PAGE 
 
\\ Dimensions 

150    VALUE DPI 
25.4   VALUE MM/INCH

\\ pixels -- millimetres
MACRO: PIXELS
  DPI / MM/INCH * 
;

\\ millimetres -- pixels
MACRO: MM 
  DPI * MM/INCH / 
;

<[  74 MM  105 MM ]> VALUE A7-PORTRAIT
<[ 105 MM  148 MM ]> VALUE A6-PORTRAIT
<[ 148 MM  210 MM ]> VALUE A5-PORTRAIT
<[ 210 MM  297 MM ]> VALUE A4-PORTRAIT
<[ 297 MM  420 MM ]> VALUE A3-PORTRAIT
<[ 420 MM  594 MM ]> VALUE A2-PORTRAIT
<[ 594 MM  841 MM ]> VALUE A1-PORTRAIT
<[ 841 MM 1189 MM ]> VALUE A0-PORTRAIT

A7-PORTRAIT REVERSE VALUE A7-LANDSCAPE
A6-PORTRAIT REVERSE VALUE A6-LANDSCAPE
A5-PORTRAIT REVERSE VALUE A5-LANDSCAPE
A4-PORTRAIT REVERSE VALUE A4-LANDSCAPE
A3-PORTRAIT REVERSE VALUE A3-LANDSCAPE
A2-PORTRAIT REVERSE VALUE A2-LANDSCAPE
A1-PORTRAIT REVERSE VALUE A1-LANDSCAPE
A0-PORTRAIT REVERSE VALUE A0-LANDSCAPE


\\ Surface

A4-PORTRAIT SPREAD CANVAS VALUE canvas
canvas 2D VALUE context

: NEW-PAGE { colour -- }
  colour context FILL-STYLE
  0 0 canvas DIMENSIONS? context FILL-RECT ;
  
: PAGE { colour width height -- }
  width height canvas DIMENSIONS! colour NEW-PAGE ;

: FONT { colour style variant weight size family -- }
  size "px" 2 "" MERGE { size }
  colour context FILL-STYLE
  style variant weight size family 5 " " MERGE context FONT! ;

: TEXT ( text -- )
  context FILL-TEXT ;

: ALIGNED-TEXT ( text x y alignment baseline -- ) 
  context TEXT-BASELINE! context TEXT-ALIGN! TEXT ;

: LEFT-TEXT ( text -- )
  "left" context TEXT-ALIGN! TEXT ;

: RIGHT-TEXT ( text -- )
  "right" context TEXT-ALIGN! TEXT ;

`);
