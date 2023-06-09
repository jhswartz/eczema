system.parse(`

PUBLISH TIME

86400 VALUE SECONDS/DAY
3600  VALUE SECONDS/HOUR
60    VALUE SECONDS/MINUTE

: DAYS? { seconds -- days }
  seconds SECONDS/DAY / FLOOR ;

: HOURS? { seconds -- hours }
  seconds SECONDS/DAY  MOD
          SECONDS/HOUR / FLOOR ;

: MINUTES? { seconds -- hours }
  seconds SECONDS/DAY    MOD
          SECONDS/HOUR   MOD
          SECONDS/MINUTE / FLOOR ;

: SECONDS? { seconds -- hours }
  seconds SECONDS/DAY    MOD
          SECONDS/HOUR   MOD
          SECONDS/MINUTE MOD ;

: HH:MM:SS { -- timestamp }
  0 "Date" NEW                        { date }
  0 "getHours"   date METHOD "00" FIT { hour }
  0 "getMinutes" date METHOD "00" FIT { minute }
  0 "getSeconds" date METHOD "00" FIT { seconds }
  <[ hour ":" minute ":" seconds ]> "" JOIN ;

CODE: TIME
  let input = system.input.top();
  let start = performance.now();
  system.evaluate(input.next());
  let end = performance.now();
  system.console.write(\`\${end - start}ms\`);
;

`);
