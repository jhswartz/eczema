system.console.error = function(error) {
  system.data.push(error);
  system.interpret("ERROR");
}

system.console.write = function(text, colour = "#ccc") {
  system.data.push(text, colour);
  system.interpret("WRITE");
};

system.console.read = function(text) {
  try {
    system.data.push(text);
    system.interpret("READ");
  }
  catch (error) {
    system.interpret("BACKTRACE");
    system.console.error(error);
  }
}

system.parse(`

PUBLISH CONSOLE

\\ View  

VARIABLE LineIndex
-1 LineIndex !

"#2a9" VALUE TimestampOutput
"#ccc" VALUE DefaultOutput
"#6ec" VALUE InputOutput
"#ec2" VALUE ErrorOutput

"#view"    QUERY-SELECTOR VALUE #view
"#output"  QUERY-SELECTOR VALUE #output
"#control" QUERY-SELECTOR VALUE #control
"#input"   QUERY-SELECTOR VALUE #input
"#enter"   QUERY-SELECTOR VALUE #enter
"#mode"    QUERY-SELECTOR VALUE #mode


\\ Input / Output

: WRITE { text colour -- }
  "p" CREATE-ELEMENT { line }
  colour line COLOUR? !
  text line APPEND
  line #output PREPEND ;

: BREAK ( -- )
  "br" CREATE-ELEMENT #output PREPEND ;

: TIMESTAMP ( -- )
  0 "Date" NEW                { date }
  0 "toUTCString" date METHOD { utcDate }
  utcDate TimestampOutput WRITE ;

: INPUT ( text -- )
  InputOutput WRITE ;

: ERROR ( error -- )
  ErrorOutput WRITE ;

: READ { text -- }
  BREAK TIMESTAMP
  text INPUT
  text PARSE ;


\\ Control 

: TOGGLE-MODE { event -- }
  "zIndex" #view STYLE? ? "2" <> IF
    "2" "zIndex" #view STYLE? !
    "CODE" "innerHTML" #mode !
  ELSE
    "0" "zIndex" #view STYLE? !
    "VIEW" "innerHTML" #mode !
  THEN
  #input FOCUS ;

: INPUT! { text -- }
  text "value" #input ! ;

: CLEAR-INPUT { -- }
  "" INPUT!
  -1 LineIndex ! ;

: ENTER { event -- }
  "value" #input ? { text }
  text IF
    text READ
    CLEAR-INPUT
  THEN
  #input FOCUS ;

: STEP-INPUT { step -- }
  InputOutput SELECT-CLASS QUERY-ALL { inputs }
  LineIndex ?                        { index }
  index step + inputs ? UNDEFINED = IF 
    CLEAR-INPUT
  ELSE
    step LineIndex +!
    LineIndex ? inputs ? { input }
    input IF
      "textContent" input ? INPUT!
    THEN
  THEN ;

: KEY { event -- }
  "key" event ? "ArrowUp" = IF
    0 "preventDefault" event METHOD
    +1 STEP-INPUT
  EXIT THEN

  "key" event ? "ArrowDown" = IF
    0 "preventDefault" event METHOD
    -1 STEP-INPUT
  EXIT THEN

  "key" event ? "Enter" = IF
    0 "preventDefault" event METHOD
    event ENTER
  THEN ;

"TOGGLE-MODE" ON-EVENT #mode  WHEN-CLICKED
"ENTER"       ON-EVENT #enter WHEN-CLICKED
"KEY"         ON-EVENT #input WHEN-KEY-RELEASED

#input FOCUS

`);

system.console.write('"слава україні! https://war.ukraine.ua/support-ukraine/"', "#fd0");
system.console.write('"россия будет свободной! https://legionliberty.army/"', "#5cd");
system.console.read("USE CORE WORDS?");
