system.parse(` 

PUBLISH CANVAS

( Canvas )

: DIMENSIONS! { width height canvas -- }
  width "width" canvas ! height "height" canvas ! ;

: DIMENSIONS? { canvas -- width height }
  "width" canvas ? "height" canvas ? ;
 
: CANVAS { width height -- canvas }
  "canvas" CREATE-ELEMENT { canvas }
  width height canvas DIMENSIONS! canvas ;


( Context )

: GET-CONTEXT ( type canvas -- context )
  1 "getContext" ROT METHOD ;

: 2D ( canvas -- context )
  "2d" SWAP GET-CONTEXT ;


( Style )

: FILL-STYLE ( value context -- )
  "fillStyle" SWAP ! ;

: STROKE-STYLE ( value context -- )
  "strokeStyle" SWAP ! ;


( Rectangles )

: FILL-RECT ( x y width height context -- )
  4 "fillRect" ROT METHOD ;

: STROKE-RECT ( x y width height context -- )
  4 "strokeRect" ROT METHOD ;

: CLEAR-RECT ( x y width height context -- )
  4 "clearRect" ROT METHOD ;


( Text )

: FONT! ( font-face context -- )
  "font" SWAP ! ;

: TEXT-ALIGN! ( alignment context -- )
  "textAlign" SWAP ! ;

: TEXT-BASELINE! ( alignment context -- )
  "textBaseline" SWAP ! ;

: FILL-TEXT ( text x y context -- )
  3 "fillText" ROT METHOD ;

: STOKE-TEXT ( text x y context -- )
  3 "strokeText" ROT METHOD ;


( Paths )

: BEGIN-PATH ( context -- )
  0 "beginPath" ROT METHOD ;

: CLOSE-PATH ( context -- )
  0 "closePath" ROT METHOD ;

: FILL ( context -- )
  0 "fill" ROT METHOD ;

: STROKE ( context -- )
  0 "stroke" ROT METHOD ;

: CLIP ( context -- )
  0 "clip" ROT METHOD ;

: MOVE-TO ( x y context -- )
  2 "moveTo" ROT METHOD ;

: LINE-TO ( x y context -- )
  2 "lineTo" ROT METHOD ;

: SET-LINE-DASH ( segments context -- )
  1 "setLineDash" ROT METHOD ;

: QUADRATIC-CURVE-TO ( cpx cpy x y context -- )
  4 "quadraticCurveTo" ROT METHOD ;

: BEZIER-CURVE-TO ( cp1x cp1y cp2x cp2y x y context -- )
  6 "bezierCurveTo" ROT METHOD ;

: ARC-TO ( x1 y1 x2 y2 radius context -- )
  5 "arcTo" ROT METHOD ;

: ARC ( x y radius startAngle endAngle anticlockwise context -- )
  6 "arc" ROT METHOD ;

: RECT ( x y w h context -- )
  4 "rect" ROT METHOD ;

: IS-POINT-IN-PATH ( x y context -- )
  2 "isPointInPath" ROT METHOD ;

`);
