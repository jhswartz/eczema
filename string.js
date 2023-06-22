system.parse(`

PUBLISH STRING

: JOIN { array glue -- string }
  glue 1 "join" array METHOD ;

: MERGE { count glue -- string }
  count :ARRAY glue JOIN ;

: TRIM { string -- trimmed }
  0 "trim" string METHOD ;

: FIT { string form -- fitted }
  form string +   { composite }
  form COUNT -1 * { index }
  index 1 "slice" composite METHOD ;

: SPLIT { string delimiter -- array }
  delimiter 1 "split" string METHOD ;

`);
