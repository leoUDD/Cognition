/* Guía de Relojes de Lamport (Ejercicios 1–13) */
ejercicios.push(
{
 id:'L01', group:'lamport', n:'Ej. 1', topic:'lamport', lvl:1, min:8, title:'Completar los relojes',
 statement:`<p>El diagrama muestra tres procesos con eventos marcados por letras. Las flechas son mensajes. Completa los timestamps de Lamport de los eventos con <b>?</b>.</p>`,
 diagram:{procs:['P1','P2','P3'], evs:[
  {k:'a',p:0,x:120,v:'1'},{k:'b',p:0,x:230,v:'2'},{k:'c',p:0,x:420,v:'?'},{k:'d',p:0,x:560,v:'?'},
  {k:'e',p:1,x:160,v:'1'},{k:'f',p:1,x:300,v:'?'},{k:'g',p:1,x:440,v:'?'},
  {k:'h',p:2,x:200,v:'1'},{k:'i',p:2,x:350,v:'?'},{k:'j',p:2,x:510,v:'?'}],
  msgs:[['b','f','m1'],['i','c','m2'],['g','j','m3']]},
 fields:[
  {k:'c',label:'c · P1 · recepción m2',ans:['3']},{k:'d',label:'d · P1 · interno',ans:['4']},
  {k:'f',label:'f · P2 · recepción m1',ans:['3']},{k:'g',label:'g · P2 · envío m3',ans:['4']},
  {k:'i',label:'i · P3 · envío m2',ans:['2']},{k:'j',label:'j · P3 · recepción m3',ans:['5']}],
 hints:['Avanza por proceso de izquierda a derecha, pero una recepción solo se puede calcular cuando ya conoces el timestamp del envío.','i es un envío después de h (C=1): solo suma 1.','Recepción: max(reloj local, ts del mensaje) + 1.'],
 think:['P3: h=1, i (envío m2) = 2.','P2: e=1, f recibe m1 (ts 2): max(1,2)+1 = 3. g envía m3: 4.','P1: b=2, c recibe m2 (ts 2): max(2,2)+1 = 3. d interno: 4.','P3: j recibe m3 (ts 4): max(2,4)+1 = 5.'],
 errors:['Calcular c como 2+1 sin mirar el ts del mensaje (aquí da igual por casualidad, pero no siempre).','Olvidar el +1 después del max.','Calcular j como i+1 ignorando que m3 trae ts 4.']
},
{
 id:'L02', group:'lamport', n:'Ej. 2', topic:'lamport', lvl:1, min:8, title:'Happens-before y concurrencia',
 statement:`<p>El diagrama tiene los timestamps del enunciado. Clasifica cada par con la relación happens-before. <b>Ojo:</b> decide por caminos de flechas y líneas de proceso, no por los números.</p>`,
 diagram:{procs:['P1','P2'], evs:[
  {k:'A',p:0,x:130,v:'1'},{k:'B',p:0,x:250,v:'2'},{k:'D',p:0,x:500,v:'6'},
  {k:'C',p:1,x:190,v:'1'},{k:'E',p:1,x:370,v:'3'},{k:'F',p:1,x:560,v:'7'}],
  msgs:[['B','E','m1'],['E','D','m2']]},
 fields:[['A','B','→'],['A','C','∥'],['B','E','→'],['B','F','→'],['C','D','→'],['E','D','→'],['A','F','→'],['C','F','→']]
  .map(([x,y,r])=>({k:x+y,label:x+', '+y,type:'opt',opts:['→','←','∥'],ans:[r]})),
 hints:['X → Y si hay un camino que va de X a Y avanzando por la línea de un proceso o siguiendo una flecha.','E es a la vez la recepción de m1 y el envío de m2.','Dos eventos del mismo proceso nunca son concurrentes.'],
 think:['A→B y C→F: mismo proceso.','B→E por m1; E→D por m2; B→F por B→E→F.','C→D por C→E→D (C está antes de E en P2).','A→F por A→B→E→F.','A ∥ C: no hay ningún camino entre ellos.','Nota: con las reglas, D debería valer max(2,3)+1 = 4 y F = 4. Los valores 6 y 7 del enunciado no rompen la garantía (son mayores), pero no siguen la regla al pie de la letra; si sale en la prueba, pregúntale al profesor.'],
 errors:['Decir A ∥ F porque están en procesos distintos: hay camino A→B→E→F.','Usar C(X) < C(Y) para concluir X → Y.']
},
{
 id:'L03', group:'lamport', n:'Ej. 3', topic:'lamport', lvl:1, min:6, title:'Ordenamiento total (C, PID)',
 statement:`<p>Ordena los eventos con la regla <b>(C, PID)</b>: menor timestamp primero y menor PID para desempatar.</p>
 <table class="t"><tr><th>Evento</th><th>Proceso</th><th>C</th></tr>${[['α','P2',4],['β','P1',4],['γ','P3',1],['δ','P1',7],['ε','P3',4],['ζ','P2',9],['η','P1',2],['θ','P3',6]].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>
 <p>Escribe la <b>posición</b> (1 a 8) de cada evento.</p>`,
 fields:[['α',4],['β',3],['γ',1],['δ',7],['ε',5],['ζ',8],['η',2],['θ',6]].map(([k,a])=>({k,label:k,ans:[String(a)]})),
 qs:[{q:'Hay tres eventos con C=4. ¿Qué implica eso respecto a su relación causal?',a:'Que <b>ninguno precede causalmente a otro</b>: si X→Y entonces C(X)&lt;C(Y), así que con C igual no puede haber relación. Son concurrentes entre sí.'},
     {q:'¿El ordenamiento total obtenido es único? Justifica.',a:'Con la regla (C, PID) fija, <b>sí</b>: es determinístico (todos los nodos obtienen el mismo). Pero no es el único orden válido: con otra regla de desempate se obtendría otro orden total igual de consistente con la causalidad, porque α, β y ε son concurrentes.'}],
 hints:['Primero ordena por C. Después, dentro de cada empate, ordena por número de proceso.','Los tres eventos con C=4 son β (P1), α (P2) y ε (P3).'],
 think:['Por C: γ(1), η(2), {α,β,ε}(4), θ(6), δ(7), ζ(9).','Empate en 4 por PID: β(P1), α(P2), ε(P3).','Orden: γ, η, β, α, ε, θ, δ, ζ.'],
 errors:['Desempatar por letra del evento en vez de por PID.','Pensar que el orden total refleja el tiempo real.']
},
{
 id:'L04', group:'lamport', n:'Ej. 4', topic:'lamport', lvl:1, min:6, title:'Detectar el error',
 statement:`<p>El diagrama contiene exactamente un timestamp incorrecto. Identifícalo y corrígelo.</p>`,
 diagram:{procs:['Pa','Pb'], evs:[
  {k:'X',p:0,x:120,v:'1'},{k:'Y',p:0,x:280,v:'2'},{k:'Z',p:0,x:480,v:'3'},
  {k:'W',p:1,x:180,v:'1'},{k:'Q',p:1,x:370,v:'2',cls:'bad'},{k:'V',p:1,x:540,v:'6'}],
  msgs:[['Y','Q','m1'],['Z','V','m2']]},
 fields:[{k:'ev',label:'Evento con error',type:'opt',opts:['X','Y','Z','W','Q','V'],ans:['Q']},
  {k:'regla',label:'Regla violada',type:'opt',opts:['Local/envío (C+1)','Recepción max(C,T)+1'],ans:['Recepción max(C,T)+1']},
  {k:'val',label:'Valor correcto',ans:['3']}],
 qs:[{q:'¿Qué consecuencia tiene sobre el ordenamiento total si no se detecta?',a:'Q (2) quedaría <b>empatado con su causa</b> Y (2). Al desempatar por PID, la recepción podría ordenarse <b>antes</b> que el envío del mismo mensaje: el orden total violaría la causalidad (un efecto antes que su causa), justo lo que Lamport debe impedir.'}],
 hints:['Revisa primero las recepciones: ahí es donde más se equivoca.','Q recibe m1, que lleva el timestamp de Y.'],
 think:['Q recibe m1 con T=2 y su reloj local era 1: max(1,2)+1 = <b>3</b>, no 2.','Se viola la regla de recepción (y la garantía Y→Q ⇒ C(Y) &lt; C(Q)).','Nota: con Q=3, V debería ser max(3,3)+1 = 4. El 6 del enunciado no rompe la garantía, pero el error "pedido" es Q.'],
 errors:['Marcar V porque "6 parece raro": V no viola ninguna garantía (6 > 3).']
},
{
 id:'L05', group:'lamport', n:'Ej. 5', topic:'lamport', lvl:2, min:10, title:'Diseño libre: sensores del reactor',
 statement:`<p>Tres sensores (S1, S2, S3) monitorean un reactor:</p><ul class="clean">
 <li>S1 toma una lectura (e1), luego envía una alerta a S2.</li><li>S2 recibe la alerta (e2), hace su propia lectura (e3) y envía un reporte a S3.</li>
 <li>S3 toma una lectura independiente (e4) antes de recibir el reporte de S2.</li><li>S3 recibe el reporte (e5) y envía una confirmación a S1 (e6).</li><li>S1 recibe la confirmación (e7).</li></ul>
 <p><b>1.</b> Dibuja el diagrama espacio-tiempo en tu hoja. <b>2.</b> Calcula los relojes (la tabla trata "lectura + envío" como un solo evento).</p>`,
 fields:[['e1',1],['e2',2],['e3',3],['e4',1],['e5',4],['e6',5],['e7',6]].map(([k,a])=>({k,label:k,ans:[String(a)]}))
  .concat([{k:'q1',label:'¿e4 ∥ e1?',type:'opt',opts:['Sí','No'],ans:['Sí']},{k:'q2',label:'¿e4 ∥ e2?',type:'opt',opts:['Sí','No'],ans:['Sí']}]),
 solDiagram:{procs:['S1','S2','S3'], evs:[
  {k:'e1',p:0,x:100,v:'1'},{k:'e7',p:0,x:560,v:'6'},{k:'e2',p:1,x:210,v:'2'},{k:'e3',p:1,x:310,v:'3'},
  {k:'e4',p:2,x:160,v:'1'},{k:'e5',p:2,x:400,v:'4'},{k:'e6',p:2,x:480,v:'5'}],
  msgs:[['e1','e2','alerta'],['e3','e5','reporte'],['e6','e7','conf.']]},
 qs:[{q:'¿Es e4 concurrente con e1? ¿Y con e2? Justifica formalmente.',a:'<b>Sí en ambos casos.</b> Para e1→e4 haría falta un camino de S1 a S3 que llegue antes de e4, pero lo primero que S3 recibe es e5, después de e4. Tampoco e4→e1 ni e4→e2: nada sale de S3 antes de e6. Ninguna de las tres reglas de happens-before se cumple, así que e4 ∥ e1 y e4 ∥ e2.'},
     {q:'¿Podría Lamport detectar que e4 ocurrió antes que e2 en tiempo real? ¿Por qué?',a:'<b>No.</b> Lamport solo captura causalidad, no tiempo físico. C(e4)=1 &lt; C(e2)=2, pero eso <b>no implica</b> e4→e2 (son concurrentes) ni dice nada del tiempo real. Para eso harían falta relojes físicos sincronizados.'}],
 hints:['Cada sensor es una línea horizontal; dibuja las flechas alerta, reporte y confirmación.','e4 es el primer evento de S3: vale 1.','e5 = max(1, 3) + 1.'],
 think:['S1: e1 = 1 (envía con ts 1).','S2: e2 = max(0,1)+1 = 2; e3 = 3 (envía con ts 3).','S3: e4 = 1; e5 = max(1,3)+1 = 4; e6 = 5.','S1: e7 = max(1,5)+1 = 6.'],
 errors:['Hacer e4 = 4 o 5 pensando que "ocurre después" en el relato: en S3 es el primer evento.','Responder que e4 → e2 porque C(e4) < C(e2).']
},
{
 id:'L06', group:'lamport', n:'Ej. 6', topic:'lamport', lvl:1, min:8, title:'Completar las funciones de Lamport',
 statement:`<p>Completa <code>lamport_local()</code>, <code>lamport_send()</code> y <code>lamport_recv()</code> según las reglas, y escribe la salida exacta del programa.</p>`,
 files:['L06/reloj.c'],
 out:'P1 envía m1 ts=2\nP2 recibe m1 clock=3\nP1 recibe m2 clock=5',
 qs:[{q:'Si en lamport_recv usaras n->clock = ts_recv + 1 (sin el max), ¿en qué escenario falla? Ejemplo concreto.',a:'Falla cuando el reloj local ya está <b>adelante</b> del mensaje. Ej.: P2 hizo 10 eventos (clock=10) y recibe un mensaje con ts=3: quedaría en 4, <b>retrocediendo</b>. Un evento posterior en P2 tendría menor timestamp que uno anterior del mismo proceso, y se rompe "X→Y ⇒ C(X) &lt; C(Y)".'}],
 hints:['Local y envío hacen lo mismo con el reloj; el envío además entrega el valor.','En C no existe max() para int: usa un if.'],
 think:['Local: clock++.','Envío: clock++ y *ts = clock (el mensaje lleva el reloj ya incrementado).','Recepción: si ts_recv > clock, clock = ts_recv; luego clock++.','Traza: a=1, b=2 (ts=2); c=1 en P2, d=max(1,2)+1=3; e=4, f=max(2,4)+1=5.'],
 errors:['Asignar *ts antes de incrementar.','Usar ts_recv + 1 sin max.'],
 rubric:[{pts:2,t:'lamport_local incrementa en 1'},{pts:3,t:'lamport_send incrementa y luego guarda en *ts'},{pts:3,t:'lamport_recv usa max(clock, ts_recv) + 1'},{pts:2,t:'Salida exacta correcta'},{pts:2,t:'Escenario de falla sin max bien explicado'}]
},
{
 id:'L07', group:'lamport', n:'Ej. 7', topic:'lamport', lvl:1, min:8, title:'Comparador de orden total (qsort)',
 statement:`<p>Implementa <code>total_order_cmp()</code> para <code>qsort</code>: primero por timestamp y desempate por PID. Escribe la salida.</p>`,
 files:['L07/order.c'],
 out:'1. [P3 ts=1] γ\n2. [P1 ts=2] η\n3. [P1 ts=4] β\n4. [P2 ts=4] α\n5. [P3 ts=4] ε\n6. [P3 ts=6] θ\n7. [P1 ts=7] δ\n8. [P2 ts=9] ζ',
 qs:[{q:'Tres eventos tienen C=4. ¿Podrían los tres estar causalmente relacionados?',a:'<b>No.</b> Si X→Y, Lamport garantiza C(X) &lt; C(Y) estrictamente. Con el mismo C ninguno puede preceder a otro: son concurrentes.'}],
 hints:['qsort entrega void*: conviértelos a const Event*.','Para comparar strings usa strcmp, nunca ==.'],
 think:['Castear a y b.','Si ts difiere, retornar la resta (da el signo correcto).','Si empatan, strcmp(proc) ("P1" < "P2" < "P3").'],
 errors:['Comparar x->proc == y->proc (compara punteros).','Olvidar el cast desde void*.'],
 rubric:[{pts:2,t:'Cast correcto de void*'},{pts:3,t:'Ordena por ts con signo correcto'},{pts:3,t:'Desempata con strcmp'},{pts:2,t:'Salida correcta y respuesta sobre C=4'}]
},
{
 id:'L08', group:'lamport', n:'Ej. 8', topic:'lamport', lvl:1, min:8, title:'Replay de log',
 statement:`<p>Completa la columna C manualmente e implementa <code>replay()</code>, que imprime <code>evento N: C=valor</code>.</p>
 <table class="t"><tr><th>#</th><th>Tipo</th><th>ts_recv</th></tr>${[['LOCAL','—'],['LOCAL','—'],['SEND','—'],['RECV',7],['LOCAL','—'],['RECV',5],['SEND','—'],['RECV',12]].map((r,i)=>`<tr><td>${i+1}</td><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`,
 files:['L08/replay.c'],
 out:'evento 1: C=1\nevento 2: C=2\nevento 3: C=3\nevento 4: C=8\nevento 5: C=9\nevento 6: C=10\nevento 7: C=11\nevento 8: C=13',
 qs:[{q:'En el evento 6 llega ts_recv=5, pero el reloj ya es mayor. ¿Qué valor queda y por qué no retrocede?',a:'Queda <b>10</b>: max(9, 5) + 1. El max conserva el reloj local porque un reloj lógico <b>nunca retrocede</b>; si lo hiciera, el evento 6 tendría menor C que el 5, que ocurrió antes en el mismo proceso.'}],
 hints:['Los tres tipos terminan con +1; solo RECV tiene un paso antes.','El reloj llega por puntero: (*clock)++ con paréntesis.'],
 think:['Un for por las n entradas.','Si es RECV y ts_recv > *clock: *clock = ts_recv.','Siempre (*clock)++ y luego printf.'],
 errors:['Escribir *clock++ (incrementa el puntero).','Imprimir antes de actualizar.'],
 rubric:[{pts:2,t:'Recorre el log'},{pts:3,t:'RECV con máximo'},{pts:2,t:'(*clock)++ con paréntesis'},{pts:3,t:'Tabla/salida y respuesta del evento 6 correctas'}]
},
{
 id:'L09', group:'lamport', n:'Ej. 9', topic:'lamport', lvl:2, min:12, title:'Lamport sobre sockets TCP',
 statement:`<p>Un servidor recibe mensajes con un campo <code>ts</code> y mantiene un reloj global. Completa los 4 TODO.</p>`,
 files:['L09/server_lamport.c'],
 qs:[{q:'El servidor usa global_clock sin mutex. Si se usa fork() para manejar clientes (como en el Control 01), ¿se comparte este reloj? ¿Qué problema genera y cómo lo resolverías?',a:'<b>No se comparte.</b> fork() copia la memoria: cada hijo tiene su propio global_clock, así que los relojes de cada conexión divergen y ya no existe un reloj único del servidor. Soluciones: (1) que los hijos envíen los eventos a <b>un proceso</b> que mantenga el reloj (pipe hijo→padre, como en el Ej. 12); o (2) <b>memoria compartida</b> (mmap/shmget) protegida con un semáforo.'},
     {q:'Si se usan hilos (pthread) en vez de fork(), ¿cambia el problema? ¿Qué mecanismo usarías?',a:'Con hilos la variable <b>sí se comparte</b>, pero aparece una <b>condición de carrera</b>: dos hilos pueden leer y escribir global_clock a la vez y perder actualizaciones. Se protege con un <code>pthread_mutex_t</code> (lock antes de actualizar, unlock después).'}],
 hints:['Paso 1 es la regla de recepción. Paso 2 es un evento interno. Paso 3 adjunta el reloj.','En el cliente, el reloj llega como puntero.'],
 think:['Recepción: global_clock = max(global_clock, msg.ts) + 1.','Interno: global_clock++.','Respuesta: enviar también es un evento, así que global_clock++ y resp.ts = global_clock. Si tu profesor considera el paso 2 como parte del envío, basta con resp.ts = global_clock; lo importante es justificarlo.','Cliente: (*clock)++ y msg.ts = *clock.'],
 errors:['Pensar que fork() comparte variables globales.','(*clock)++ sin paréntesis.'],
 rubric:[{pts:3,t:'TODO 1: recepción con max + 1'},{pts:1,t:'TODO 2: evento interno'},{pts:2,t:'TODO 3: resp.ts con el reloj actual'},{pts:2,t:'TODO 4: cliente incrementa y adjunta'},{pts:2,t:'Respuesta fork()'},{pts:2,t:'Respuesta hilos + mutex'}]
},
{
 id:'L10', group:'lamport', n:'Ej. 10', topic:'vector', lvl:2, min:12, title:'Extender Lamport: relojes vectoriales',
 statement:`<p>Lamport no distingue "A antes de B" de "A y B concurrentes". Implementa las 5 funciones de un reloj vectorial y escribe la salida.</p>`,
 files:['L10/vclock.c'],
 out:'P0 tras a: [1,0,0]\nP2 tras b: [0,0,1]\nP1 tras recv m1: [2,1,0]\na → P1_actual: SÍ\na ∥ b: SÍ',
 qs:[{q:'¿Qué información entrega el vector que Lamport escalar no puede dar?',a:'Permite <b>detectar concurrencia</b>: A→B ⟺ V(A) &lt; V(B). Con Lamport, C(A) &lt; C(B) no dice si hay causalidad o si son concurrentes. Además, cada componente dice cuántos eventos de cada proceso "conoce" el nodo.'},
     {q:'¿Por qué la recepción toma el máximo componente a componente y no sobrescribe con el vector recibido?',a:'Porque el receptor puede saber <b>más</b> que el emisor sobre algunos procesos (incluido él mismo). Sobrescribir borraría ese conocimiento: el reloj retrocedería en esas componentes y se perdería causalidad ya registrada.'}],
 hints:['v[pid] es tu propia componente.','happens_before: ningún a[i] mayor que b[i], y al menos uno estrictamente menor.','concurrent: ni a→b ni b→a.'],
 think:['local: v[pid]++. send: v[pid]++ y copiar a out.','recv: para todo i, v[i] = max(v[i], rcv[i]); luego v[pid]++.','Traza: p0 [1,0,0]; p2 [0,0,1]; p0 envía [2,0,0]; p1 recibe → [2,0,0] y luego +1 propio = [2,1,0].'],
 errors:['Comparar solo una componente.','En concurrent, olvidar uno de los dos sentidos.'],
 rubric:[{pts:2,t:'vc_local'},{pts:2,t:'vc_send incrementa y copia'},{pts:3,t:'vc_recv: máximo y luego +1 propio'},{pts:3,t:'vc_happens_before correcto (∀ ≤ y ∃ <)'},{pts:2,t:'vc_concurrent usando happens_before'},{pts:2,t:'Salida y respuestas teóricas'}]
},
{
 id:'L11', group:'lamport', n:'Ej. 11', topic:'lamport', lvl:3, min:35, title:'Exclusión mutua distribuida con pipes',
 statement:`<p>P0, P1 y P2 comparten <code>log.txt</code>; solo uno escribe a la vez. Se comunican por pipes (sin servidor central) con el algoritmo de exclusión mutua de Lamport:</p>
 <ol><li>Para entrar: enviar REQUEST(ts, pid) a todos.</li><li>Al recibir un REQUEST: responder REPLY(ts, pid).</li><li>Entrar solo con REPLY de todos y siendo el REQUEST de menor (ts, pid).</li><li>Al salir: RELEASE(ts, pid) a todos.</li></ol>
 <p>Cada proceso hace 2 ciclos request → enter → escribir "P&lt;pid&gt; ts=&lt;C&gt; escribe" → release.</p>`,
 files:['L11/mutex_lamport.c'],
 out:'P0 ts=1 escribe\nP1 ts=1 escribe\nP2 ts=1 escribe\nP0 ts=9 escribe\nP1 ts=11 escribe\nP2 ts=14 escribe\n(los ts de la segunda ronda varían entre ejecuciones)',
 qs:[{q:'Topología: ¿cuántas pipes necesitas para 3 procesos con comunicación bidireccional?',a:'Una pipe es <b>unidireccional</b>, así que hace falta una por cada par ordenado (i, j): N·(N−1) = <b>6 pipes</b> y 12 descriptores. Cada proceso conserva 2 extremos de escritura (hacia los otros) y 2 de lectura (desde los otros), y cierra los otros 8.'},
     {q:'¿Por qué es necesario el desempate por PID y no basta con el timestamp? Escenario con 3 procesos.',a:'Al inicio los tres piden con el reloj en 0: los tres REQUEST llevan <b>ts=1</b>. Sin desempate, cada uno vería que nadie tiene un ts menor y los tres entrarían a la vez. Con (ts, pid) el orden es total: entra P0, luego P1, luego P2. Es exactamente lo que se ve en la primera ronda del log.'},
     {q:'Si un proceso se cae antes de enviar RELEASE, ¿qué ocurre? ¿Cómo lo detectas con las pipes?',a:'Su REQUEST queda en la cola de los demás para siempre y <b>nadie más puede entrar</b> (bloqueo). Si murió, el SO cierra sus extremos: un <code>read()</code> en la pipe desde él retorna <b>0</b> (EOF). Al detectarlo, se puede borrar su solicitud de la cola y seguir, o abortar avisando el fallo (en la solución se imprime y termina).'}],
 hints:['Guarda en cola_ts[j] el ts de la solicitud pendiente de cada proceso (−1 si no tiene).','Mientras esperas entrar, sigue atendiendo mensajes (si no, nadie recibe tus REPLY y hay deadlock).','Usa select() sobre las 2 pipes de entrada para no bloquearte en una sola.'],
 think:['Topología: fds[i][j] = pipe de i hacia j. Tras fork, el proceso i solo conserva fds[i][*][1] y fds[*][i][0].','request: clock++, cola_ts[me] = clock y REQUEST con ese MISMO ts a todos.','procesar: regla de recepción; REQUEST → guardar en cola y responder REPLY; REPLY → contar; RELEASE → quitar de la cola.','puedo_entrar: replies == N−1 y ninguna solicitud ajena con (ts, pid) menor.','Después de los 2 ciclos, seguir atendiendo hasta recibir todos los RELEASE (los demás aún necesitan tus REPLY).','La escritura carácter por carácter con usleep es a propósito: si la exclusión fallara, verías líneas mezcladas.'],
 errors:['No cerrar los extremos que no usas: read() nunca devuelve 0 y no detectas caídas.','Incrementar el reloj por cada destinatario (los REQUEST deben llevar el mismo ts).','Bloquearse en read() de una sola pipe mientras otro proceso espera tu REPLY: deadlock.','Terminar el proceso apenas acaba sus ciclos, dejando a otros sin REPLY.'],
 rubric:[{pts:3,t:'Crea N·(N−1) pipes antes de fork() y cierra extremos no usados'},{pts:3,t:'request_cs con el mismo ts a todos'},{pts:4,t:'Recepción: Lamport + manejo de REQUEST/REPLY/RELEASE'},{pts:4,t:'Condición de entrada: todos los REPLY y (ts, pid) mínimo'},{pts:2,t:'release_cs quita la solicitud y avisa'},{pts:2,t:'Sigue atendiendo mensajes mientras espera y al terminar'},{pts:2,t:'Desempate por PID explicado con escenario'},{pts:2,t:'Detección de caída con read() == 0'}]
},
{
 id:'L12', group:'lamport', n:'Ej. 12', topic:'lamport', lvl:3, min:35, title:'Concentrador de telemetría con orden causal',
 statement:`<p>Red SELENE: un concentrador TCP (puerto 9090, <code>fork()</code> por sonda) recibe <code>TELEM &lt;id&gt; &lt;seq&gt; &lt;val&gt; &lt;ts&gt;</code> y <code>RELAY &lt;origen&gt; &lt;destino&gt; &lt;val&gt; &lt;ts&gt;</code>, y debe escribirlos en <code>registro.log</code> en <b>orden causal</b>, no en el de llegada. Cada 2 s vacía su buffer ordenado por (ts, pid). Mantiene su propio reloj Lamport.</p>
 <p>Implementa el concentrador y una sonda que incremente su reloj en cada envío.</p>`,
 files:['L12/concentrador.c','L12/sonda.c'],
 qs:[{q:'Elige un mecanismo IPC para comunicar los hijos con el proceso que escribe el log. Justifica.',a:'<b>Pipe hijo → padre</b>: el padre la crea antes de los fork y todos los hijos heredan el extremo de escritura. Si cada evento se escribe con un solo <code>write()</code> de tamaño fijo menor a PIPE_BUF, la escritura es <b>atómica</b> y no se mezclan eventos de distintos hijos. El padre la vigila con select() junto al socket de escucha. <b>Memoria compartida + semáforo</b> obliga a gestionar el buffer y el lock a mano (más errores). Una <b>cola de mensajes</b> funcionaría, pero es más API para lo mismo.'},
     {q:'¿Basta esperar 2 segundos para garantizar que llegaron todos los mensajes anteriores a un timestamp T? ¿Qué supone sobre la red?',a:'<b>No.</b> Supone una red <b>síncrona</b>, con latencia máxima menor a 2 s. Una sonda lenta o una red congestionada puede entregar un mensaje con ts &lt; T después del flush, y el log quedaría desordenado.'},
     {q:'Propón una mejora que no dependa de un timeout fijo.',a:'Aprovechar que TCP entrega <b>en orden</b> por conexión y que cada sonda tiene un reloj creciente. El concentrador guarda el <b>último ts recibido de cada sonda</b>. Un evento con timestamp T es seguro de escribir cuando <b>todas</b> las sondas ya enviaron algo con ts ≥ T: min(último_ts[i]) ≥ T. Para que una sonda inactiva no bloquee, envía <b>heartbeats con su ts</b>. Es el criterio de estabilidad del algoritmo de Lamport.'}],
 hints:['El padre no puede leer de cada socket: lo hacen los hijos. Necesitas IPC hijo → padre.','Un struct de tamaño fijo por evento, escrito con un write(), no se mezcla en la pipe.','El padre hace select() con un timeout para poder hacer el flush aunque no lleguen eventos.'],
 think:['Padre: socket, bind, listen y pipe(p) ANTES de aceptar clientes.','Loop: select(srv, p[0], timeout 1 s). Socket listo → accept y fork (el hijo cierra srv y p[0]). Pipe lista → read de un PendingEvent, reloj = max(reloj, ts) + 1, guardar.','Cada 2 s: qsort por (ts, pid) y append a registro.log.','Hijo: buffer acumulador por líneas, sscanf de TELEM o RELAY, pid desde "ARES-%d", write a la pipe.','Sonda: reloj++ antes de cada send y adjuntar el ts.'],
 errors:['Guardar los eventos en un arreglo del HIJO (el padre nunca los ve).','Olvidar fflush(stdout) antes de fork(): el hijo repite lo que había en el buffer.','Bloquearse en read(p[0]) y no aceptar nuevas sondas (por eso select).'],
 rubric:[{pts:3,t:'Justifica la IPC elegida'},{pts:4,t:'Hijo: parsea líneas y envía el evento al padre'},{pts:4,t:'Padre: select() entre el socket y la pipe'},{pts:2,t:'Reloj del concentrador con max + 1'},{pts:3,t:'Flush cada 2 s ordenado por (ts, pid)'},{pts:2,t:'Sonda incrementa y adjunta ts'},{pts:2,t:'Responde la suposición sobre la red'},{pts:2,t:'Mejora sin timeout (mínimo ts por sonda)'}]
},
{
 id:'L13', group:'lamport', n:'Ej. 13', topic:'lamport', lvl:3, min:35, title:'Snapshot consistente (Chandy-Lamport)',
 statement:`<p>3 procesos conectados por pipes (todos con todos). Cada uno parte con <code>counter = 100</code> y de vez en cuando hace TRANSFER(cantidad, ts) a otro (el emisor resta y el receptor suma). P0 inicia un snapshot: registra su estado y envía MARKER(ts) por todas sus pipes. Quien recibe el primer MARKER registra su estado y reenvía MARKER. Los mensajes que llegan por un canal después de registrar el estado y antes del MARKER de ese canal están <b>en tránsito</b>. La suma del snapshot debe ser 300.</p>`,
 files:['L13/snapshot.c'],
 out:'P1: snap_counter=106  en tránsito=0 (0 msgs)  reloj al snapshot=29\nP0: snap_counter=101  en tránsito=0 (0 msgs)  reloj al snapshot=27\nP2: snap_counter=93  en tránsito=0 (0 msgs)  reloj al snapshot=29\nTOTAL del snapshot = 300 (debe ser 300)',
 qs:[{q:'¿Qué rol juegan los timestamps de Lamport en los MARKER? ¿Podría funcionar sin ellos?',a:'<b>Sí funcionaría sin ellos.</b> Lo que define el corte consistente es el <b>MARKER</b> y que las pipes son FIFO. Los timestamps ayudan a <b>razonar y verificar</b> la causalidad del corte (todo lo registrado es causalmente anterior al MARKER que lo cierra) y a ordenar o depurar los eventos, pero no son necesarios para el algoritmo.'},
     {q:'¿Por qué hay que capturar los mensajes en tránsito? Escenario.',a:'P0 tiene 100 y transfiere 10 a P1 (P0 = 90). <b>Luego</b> P0 toma su snapshot (90) y envía MARKER. P1 toma su snapshot antes de recibir esos 10 (100). Suma: 190 + 100 de P2 = 290. <b>Se perdieron 10</b>: estaban en la pipe. Contarlos como "en tránsito" en el canal P0→P1 devuelve 300. Al revés, contar un mensaje en el emisor y en el receptor lo <b>duplica</b>.'},
     {q:'P1 recibe un TRANSFER de P0 después de que P0 tomó su snapshot pero antes del MARKER de P0. ¿Dónde se contabiliza?',a:'Las pipes son FIFO y P0 envía el MARKER <b>apenas</b> toma su snapshot. Un TRANSFER enviado <b>después</b> del snapshot de P0 llega detrás del MARKER, así que pertenece al "después" y <b>no se cuenta</b>. Uno enviado <b>antes</b> del snapshot de P0 llega antes del MARKER: si P1 ya había tomado su snapshot (por un MARKER de P2), se registra como <b>en tránsito</b> del canal P0→P1; si no, ya está en el contador de P1 al registrarlo.'},
     {q:'¿Pueden dos ejecuciones dar snapshots distintos pero ambos consistentes?',a:'<b>Sí.</b> El snapshot no captura el estado real en un instante, sino un <b>corte consistente</b>. Cambian el momento del snapshot, la planificación y los TRANSFER aleatorios, así que los valores cambian, pero en todos se conserva la suma (300) y ningún mensaje queda recibido sin haber sido enviado.'}],
 hints:['Por cada canal entrante necesitas saber si ya llegó su MARKER (marker_from[j]).','Un TRANSFER va a "en tránsito" solo si yo ya tomé el snapshot Y el MARKER de ese canal aún no llega.','Para leer sin bloquearte: select() con timeout 0.'],
 think:['tomar_snapshot: snap_counter = counter, snap_taken = 1, clock++ y MARKER a todos.','Recibir TRANSFER: counter += amount; si snap_taken && !marker_from[from] → transito[from] += amount.','Recibir MARKER: si no tengo snapshot, lo tomo; marker_from[from] = 1.','Completo: snapshot tomado y MARKER de los otros dos.','El enunciado pide "incrementar counter" en cada iteración, pero eso cambiaría la suma total. En la solución el evento periódico solo avanza el reloj Lamport, para que la suma se conserve.'],
 errors:['Registrar un TRANSFER como en tránsito después de recibir el MARKER de ese canal.','Olvidar que el primer MARKER también cierra su propio canal (estado vacío).','Pipes bloqueantes sin select(): el proceso se queda pegado.'],
 rubric:[{pts:2,t:'Crea las 6 pipes y cierra extremos'},{pts:3,t:'tomar_snapshot registra estado y envía MARKER'},{pts:4,t:'Registra en tránsito solo en la ventana correcta'},{pts:2,t:'Recepción con Lamport'},{pts:2,t:'Lectura no bloqueante (select)'},{pts:2,t:'Suma = 300 e impresión de resultados'},{pts:5,t:'Preguntas teóricas 2 a 5'}]
}
);
