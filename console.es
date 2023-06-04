system.console.error = function(error) {
  system.data.push(error);
  system.interpret("ERROR");
}

system.console.write = function(text, type = "default-output") {
  system.data.push(text, type);
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

"timestamp-output" VALUE TimestampOutput
"default-output"   VALUE DefaultOutput
"input-output"     VALUE InputOutput
"error-output"     VALUE ErrorOutput

"#view"    QUERY-SELECTOR VALUE #view
"#output"  QUERY-SELECTOR VALUE #output
"#control" QUERY-SELECTOR VALUE #control
"#input"   QUERY-SELECTOR VALUE #input
"#enter"   QUERY-SELECTOR VALUE #enter
"#mode"    QUERY-SELECTOR VALUE #mode


\\ Input / Output

: WRITE { text class -- }
  "p" CREATE-ELEMENT { line }
  class line CLASS!
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

: ENTER { event -- }
  "value" #input ? { text }
  text IF
    text READ
    CLEAR-INPUT
  THEN
  #input FOCUS ;

: CLEAR-INPUT { -- }
  "" INPUT!
  -1 LineIndex ;

: INPUT! { text -- }
  text "value" #input ! ;

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

system.console.read("USE CORE WORDS?");
