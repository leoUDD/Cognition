/* Teoría por temas. Cada tema tiene subtemas; cada subtema, su explicación.
   Basado en las tarjetas, la transcripción de clases, los controles y los ejercicios del ramo.
   teoria.push({ id, unidad, titulo, resumen, intro, sub: [{ id, titulo, resumen, comparacion?, idea, texto, pasos, tabla, ejemplo, codigo, ojo, recuerda, ejercicios }] }) */

/* =====================================================================
   ALGORITMOS DE ELECCIÓN DE LÍDER Y CONSENSO
   ===================================================================== */
teoria.push({
  id: 'algoritmos', unidad: 'Unidad 2 · Certamen 2', titulo: 'Algoritmos de elección y consenso',
  resumen: 'Cuando cae el líder, ¿quién manda? Bully, Raft, Paxos, quórum y 2PC, cada uno por separado y comparados.',
  intro: `En clase el profesor lo planteó como una pregunta simple: <b>si cae el primario, ¿quién manda?</b> La respuesta es un <b>algoritmo de consenso</b>, que puede ser <b>Bully, Raft o Paxos</b>. Aquí está cada uno por separado y, al final, una comparación para elegir cuál usar.`,
  sub: [
    {
      id: 'problema', titulo: '¿Qué problema resuelven?', resumen: 'Elegir un líder y ponerse de acuerdo aunque haya nodos que fallan.',
      idea: `Varios nodos sin un jefe fijo necesitan <b>acordar algo</b>: quién es el líder, o qué valor guardar. Y deben lograrlo aunque algunos nodos se caigan o la red pierda mensajes.`,
      texto: `<p>En un sistema distribuido muchas cosas funcionan con un <b>líder</b> (o coordinador): el primario que acepta las escrituras, el dron que coordina el enjambre, el servidor que ordena los mensajes. Si el líder se cae, los demás tienen que elegir otro, y <b>todos deben terminar reconociendo al mismo</b>. Si dos nodos creen ser líderes a la vez, hay un <b>split-brain</b>.</p>
<p>Hay dos problemas relacionados:</p>
<ul><li><b>Elección de líder:</b> decidir <i>quién</i> manda. Bully hace solo esto.</li>
<li><b>Consenso:</b> que todos acuerden <i>un mismo valor</i> (por ejemplo, cuál es la siguiente operación del log). Raft y Paxos resuelven el consenso, y elegir un líder es parte de cómo lo hacen.</li></ul>
<p>Un algoritmo de consenso debe cumplir 4 propiedades:</p>
<ul><li><b>Terminación:</b> los nodos correctos eventualmente deciden.</li>
<li><b>Acuerdo:</b> todos deciden lo mismo.</li>
<li><b>Validez:</b> lo decidido fue propuesto por alguien (no aparece de la nada).</li>
<li><b>Integridad:</b> cada nodo decide a lo más una vez.</li></ul>`,
      ejemplo: `El enjambre CENTINELA del Control 3: C3 era el líder y dejó de responder. C1 lo detecta con el heartbeat. Ahora los 5 drones que quedan deben ponerse de acuerdo en un nuevo líder, y al final <b>todos deben reconocer al mismo</b> (C5).`,
      ojo: [`<b>Teorema FLP:</b> en un sistema <b>asíncrono</b> (sin límite de tiempo para los mensajes) no existe un algoritmo determinístico que garantice consenso si aunque sea un nodo puede fallar. Por eso todos los algoritmos reales usan <b>timeouts</b>: suponen que si alguien no responde a tiempo, cayó.`,
        `No confundas consenso con <b>2PC</b>: 2PC no elige líder, confirma una transacción en todos los nodos (ver su subtema).`],
      recuerda: `Si te preguntan "¿qué algoritmo usarías para elegir el nuevo líder?", nombra uno concreto (Bully o Raft) y explica sus mensajes. "Un algoritmo de elección" no basta.`
    },
    {
      id: 'bully', titulo: 'Bully', resumen: 'Gana el de mayor prioridad vivo. Mensajes ELECTION, OK y COORDINATOR.',
      idea: `<b>"El más grande se impone"</b> (bully = matón): cada nodo pregunta solo a los de mayor prioridad; si ninguno responde, se proclama líder.`,
      texto: `<p>Cada nodo tiene una <b>prioridad</b> conocida por todos. En el Bully original es el <b>ID</b> (gana el ID más alto); en el certamen es la <b>aptitud</b>. Siempre gana el nodo <b>vivo de mayor prioridad</b>.</p>
<p>Usa 3 tipos de mensaje:</p>
<ul><li><b>ELECTION</b>: "¿hay alguien con más prioridad que yo?". Se envía solo <b>hacia arriba</b>, a los de mayor prioridad.</li>
<li><b>OK</b>: "sí, aquí estoy; tú retírate, yo sigo". Lo responde un nodo de mayor prioridad.</li>
<li><b>COORDINATOR</b>: "gané, soy el nuevo líder". Lo envía el ganador a <b>todos</b>.</li></ul>
<p>La clave: cuando un nodo recibe ELECTION, responde OK <b>y además inicia su propia elección</b> hacia arriba. Así la elección "sube" hasta llegar al de mayor prioridad, que no tiene a quién preguntar y gana.</p>`,
      pasos: [`<b>Detección:</b> un nodo nota que el líder no responde (heartbeat sin respuesta tras n ciclos).`,
        `<b>Elección:</b> envía ELECTION a todos los nodos de <b>mayor</b> prioridad que él.`,
        `<b>Respuesta:</b> cada nodo vivo que recibe ELECTION responde OK al que preguntó e inicia su propia elección hacia arriba (si no lo había hecho).`,
        `<b>Espera:</b> si el que preguntó recibe al menos un OK, se retira y espera el COORDINATOR. Si vence el timeout <b>sin ningún OK</b>, nadie de mayor prioridad está vivo: él es el líder.`,
        `<b>Anuncio:</b> el ganador envía COORDINATOR a todos, y cada uno lo registra como líder.`],
      ejemplo: `Aptitudes: C5 74.6 > C1 71.7 > C2 65.7 > C4 60.9 > C6 56.1 (C3 caído).<br>
<b>Si detecta C1:</b> C1 → C5 ELECTION. C5 → C1 OK. C5 pregunta hacia arriba: no hay nadie, gana. C5 → todos COORDINATOR. Total: 1 ELECTION, 1 OK, 5 COORDINATOR = <b>7 mensajes</b>.<br>
<b>Si detecta C4:</b> C4 → C1, C2, C5 ELECTION. Los tres responden OK e inician su elección: C2 → C1, C5; C1 → C5. Responden OK. C5 no recibe OK y gana. Total: 6 + 6 + 5 = <b>17 mensajes</b>.`,
      ojo: [`Enviar ELECTION a <b>todos</b>, incluidos los de menor prioridad: no sirve, ellos no pueden ganarte.`,
        `Responder OK pero <b>no</b> iniciar la propia elección: nadie llega a proclamarse.`,
        `Olvidar el COORDINATOR: los demás nunca se enteran de quién ganó.`,
        `<b>Si revive un nodo de mayor prioridad</b>, inicia una elección y retoma el liderazgo, pero (condición del profesor) solo si tiene los <b>eventos sincronizados</b>: un líder no puede tener el historial atrasado.`,
        `Costo: en el peor caso (detecta el de menor prioridad) son <b>O(n²)</b> mensajes. En el mejor caso (detecta el de mayor prioridad vivo) bastan n−1 COORDINATOR.`],
      recuerda: `Bully <b>no usa mayoría</b>: confía en que los timeouts dicen la verdad. Si la red se parte, cada lado puede elegir su propio líder (split-brain). Es simple de implementar en C, por eso conviene para el certamen.`,
      ejercicios: ['K3']
    },
    {
      id: 'bully-aptitud', titulo: 'Bully con aptitud', resumen: 'La prioridad deja de ser el ID y pasa a ser la función de aptitud F.',
      idea: `Es el mismo Bully, pero la prioridad de cada nodo es su <b>aptitud F</b> en vez de su ID. Así gana el nodo <b>más apto</b> vivo, no el de número más alto.`,
      texto: `<p>En el Control 3 no importaba qué dron tenía el número mayor, sino cuál era <b>mejor líder</b> según batería, distancia y visibilidad. La adaptación es directa:</p>
<ul><li>Cada nodo calcula su aptitud con la <b>misma función</b> (pregunta 1). Como todos conocen la composición del enjambre, todos saben las aptitudes de los demás.</li>
<li>ELECTION se envía a los de <b>mayor aptitud</b>: <code>if (nodos[j].aptitud &gt; nodos[yo].aptitud)</code>.</li>
<li>Gana el que no recibe OK: el <b>más apto vivo</b>.</li>
<li>Si dos empataran en aptitud, se desempata por ID (en el enjambre del control no hay empates).</li></ul>
<p>Lo que pide la pauta: nombrar el algoritmo, un struct del dron con <b>id, batería, distancia, visibilidad, estado y aptitud</b>, y que el código <b>use la función de la pregunta 1</b> como prioridad.</p>`,
      codigo: `/* la única diferencia con Bully original: comparar aptitud, no id */
void iniciar_eleccion(int yo) {
    nodos[yo].participo = 1;
    nodos[yo].recibio_ok = 0;
    for (int j = 0; j < N; j++) {
        if (j != yo) {
            if (nodos[j].aptitud > nodos[yo].aptitud) {
                enviar(ELECTION, yo, j);
            }
        }
    }
    if (nodos[yo].recibio_ok == 0) {
        anunciar(yo);
    }
}`,
      ojo: [`Escribir las aptitudes a mano en el código: la pauta pide calcularlas con tu función de la pregunta 1.`,
        `Usar el ID como prioridad: entonces ganaría C6 (el de número mayor), que es el <b>menos</b> apto.`],
      recuerda: `En la justificación conecta las dos preguntas: "gana C5 porque es el primero del ranking de aptitud (74.6), y en Bully gana el de mayor prioridad vivo".`,
      ejercicios: ['K1', 'K3']
    },
    {
      id: 'bully-fallas', titulo: 'Fallas durante la elección', resumen: 'Qué pasa si un nodo se desconecta a mitad de Bully: timeouts de OK y de COORDINATOR.',
      idea: `La elección <b>siempre termina</b> gracias a los timeouts. El ganador <b>cambia solo si cae el que iba a ganar</b>.`,
      texto: `<p>Bully usa dos esperas con límite de tiempo:</p>
<ul><li><b>Timeout de OK:</b> después de enviar ELECTION, espero respuestas. Si no llega ningún OK, gano.</li>
<li><b>Timeout de COORDINATOR:</b> si recibí un OK, espero el anuncio. Si no llega, el que me respondió se cayó a mitad de camino: <b>reinicio la elección</b>.</li></ul>
<p>El timeout de COORDINATOR debe ser <b>más largo</b> que el de OK, porque el nodo que me respondió todavía tiene que hacer su propia elección y esperar su propio timeout de OK antes de anunciarse.</p>`,
      tabla: { titulo: 'Escenarios con el enjambre (detecta C1)', cols: ['Quién cae', '¿La elección termina?', '¿Cambia el ganador?', 'Por qué'],
        filas: [['C5, después de responder OK', 'Sí', '<b>Sí: gana C1</b>', 'C1 esperaba un COORDINATOR que nunca llega. Vence su timeout, reinicia, nadie responde OK y gana el siguiente más apto vivo.'],
          ['C2 (menos apto que C5)', 'Sí', 'No: gana C5', 'Un nodo de menor prioridad no puede ganar ni bloquear. Solo pierde su COORDINATOR.'],
          ['C1 (el que detectó), tras enviar ELECTION', 'Sí', 'No: gana C5', 'C5 ya recibió el ELECTION, sigue solo y anuncia. Bully no depende del iniciador.']] },
      ojo: [`No reiniciar tras el timeout de COORDINATOR: el nodo queda esperando para siempre y el enjambre sin líder.`,
        `Creer que "el resultado nunca cambia": cambia si cae el que iba a ganar (o uno de mayor prioridad).`],
      recuerda: `Respuesta modelo: "Sí concluye, porque los mensajes a un nodo caído se pierden y los timeouts hacen que los demás sigan. El resultado cambia solo si el caído era el que iba a ganar".`,
      ejercicios: ['K4']
    },
    {
      id: 'raft-estados', ejercicios: ['X7'], titulo: 'Raft: estados y terms', resumen: 'Follower, Candidate y Leader. Terms numerados y timeouts aleatorios.',
      idea: `En Raft cada nodo es <b>follower</b>, <b>candidate</b> o <b>leader</b>. El líder envía heartbeats; si un follower deja de oírlos, se postula y necesita <b>mayoría</b> de votos para ganar.`,
      texto: `<p>Raft se diseñó para ser <b>más fácil de entender que Paxos</b>. Separa el consenso en 3 subproblemas: <b>elección de líder</b>, <b>replicación del log</b> y <b>seguridad</b>.</p>
<p><b>Los 3 estados:</b></p>
<ul><li><b>Follower</b> (estado inicial): obedece al líder y responde sus mensajes.</li>
<li><b>Candidate</b>: un follower que dejó de recibir heartbeats y pide votos.</li>
<li><b>Leader</b>: ganó con mayoría; envía heartbeats y replica el log.</li></ul>
<p><b>Transiciones:</b> Follower → (timeout sin heartbeat) → Candidate → (mayoría de votos) → Leader. Un candidate vuelve a follower si pierde o si descubre un líder; un leader vuelve a follower si ve un term mayor.</p>
<p><b>Term:</b> es un número de "mandato". Cada term empieza con una elección, y hay <b>como máximo un líder por term</b>. Si un nodo ve un term mayor que el suyo, se actualiza y pasa a follower. Así un líder antiguo que vuelve de una partición se da cuenta de que ya no manda.</p>
<p><b>Timeouts aleatorios (150–300 ms):</b> cada follower espera un tiempo distinto antes de postularse. Normalmente expira <b>uno solo</b> primero, se postula y gana antes de que los demás despierten. Esto evita empates (<b>split vote</b>).</p>`,
      ojo: [`Un term puede terminar <b>sin líder</b> (split vote). Se resuelve con un nuevo term y otros timeouts aleatorios.`,
        `Los terms solo crecen: nunca se vuelve a un term anterior.`],
      recuerda: `Diferencia clave con Bully: en Raft gana quien junta <b>mayoría de votos</b>, no "el de mayor prioridad". Por eso Raft evita el split-brain y Bully no.`
    },
    {
      id: 'raft-eleccion', ejercicios: ['X5', 'X7'], titulo: 'Raft: la elección', resumen: 'RequestVote, un voto por term y las tres formas en que termina una elección.',
      idea: `El candidato sube su term, vota por sí mismo y pide votos con <b>RequestVote</b>. Gana si obtiene <b>más de la mitad</b>.`,
      pasos: [`El follower no recibe heartbeat antes de su timeout aleatorio.`,
        `Pasa a <b>candidate</b>: incrementa su term (<code>term = term + 1</code>) y vota por sí mismo.`,
        `Envía <b>RequestVote</b> a todos los demás.`,
        `Cada nodo concede su voto si: (1) el term del candidato es ≥ al suyo; (2) no ha votado en este term (o votó por ese mismo candidato): <b>un voto por term</b>; (3) el log del candidato está <b>al menos tan actualizado</b> como el suyo.`,
        `Si el candidato junta <b>mayoría</b> (más de N/2), pasa a leader y empieza a enviar heartbeats (AppendEntries vacíos).`],
      tabla: { titulo: 'Cómo puede terminar una elección', cols: ['Resultado', 'Qué pasa'],
        filas: [['Gana', 'Obtiene mayoría → LEADER y envía heartbeats.'],
          ['Otro gana', 'Recibe un AppendEntries con term ≥ el suyo → vuelve a FOLLOWER.'],
          ['Split vote', 'Nadie alcanza mayoría → vence el timeout → nueva elección con term + 1.']] },
      ejemplo: `5 nodos: se necesitan <b>3 votos</b>. Si la red se parte en 3 | 2, solo el lado de 3 puede elegir líder. El lado de 2 nunca junta mayoría, así que no hay dos líderes.`,
      ojo: [`La condición (3) sobre el log es la que garantiza que el nuevo líder tenga todo lo ya confirmado (Leader Completeness).`,
        `Con N par puede haber empate en una partición (2 | 2): por eso se usa N impar.`],
      recuerda: `Si te piden adaptar Raft a la aptitud: (1) timeout más corto para los más aptos, así se postulan primero; (2) solo votar por candidatos con aptitud ≥ la propia; (3) gana con mayoría (con 6 drones, 4 votos).`
    },
    {
      id: 'raft-log', ejercicios: ['X6'], titulo: 'Raft: replicación del log', resumen: 'AppendEntries, commit por mayoría y cómo se reparan los logs.',
      idea: `El líder agrega cada operación a su log y la copia a los followers. Cuando <b>la mayoría</b> la tiene, está <b>confirmada (commit)</b> y se aplica.`,
      pasos: [`El cliente envía la operación al líder.`,
        `El líder la <b>agrega a su log</b> (todavía sin confirmar).`,
        `Envía <b>AppendEntries</b> con la entrada a todos los followers.`,
        `Espera confirmación (ACK) de una <b>mayoría</b>.`,
        `Hace <b>commit</b>: la aplica a su máquina de estados y responde al cliente.`,
        `En el siguiente AppendEntries avisa a los followers hasta dónde está confirmado, y ellos también la aplican.`],
      texto: `<p><b>AppendEntries</b> tiene dos usos: <b>heartbeat</b> (sin entradas, para mantener la autoridad) y <b>replicación</b>. Lleva <code>prev_log_index</code> y <code>prev_log_term</code>: el follower acepta solo si su log tiene esa entrada anterior con ese term. Si no coincide, rechaza; el líder <b>retrocede</b> hasta encontrar dónde coinciden y el follower <b>sobrescribe</b> lo que no coincide.</p>
<p><b>Log Matching:</b> si dos logs tienen una entrada con el mismo índice y term, guardan el mismo comando y son idénticos en todo lo anterior.</p>
<p>Las 5 propiedades de seguridad: a lo más un líder por term; el líder nunca borra su log; Log Matching; lo confirmado estará en todos los líderes futuros; nadie aplica un comando distinto en el mismo índice.</p>`,
      ojo: [`Una entrada en el log del líder <b>no</b> está confirmada hasta que la tenga la mayoría.`,
        `El follower no "decide": copia lo que dice el líder, incluso si tiene que borrar entradas suyas que no coinciden.`],
      recuerda: `Raft = elección + replicación del log. Bully solo elige; no dice nada de cómo copiar los datos.`
    },
    {
      id: 'paxos', titulo: 'Paxos', resumen: 'El algoritmo de consenso clásico: cualquiera propone y decide la mayoría.',
      idea: `En Paxos <b>cualquier nodo puede proponer</b> un valor, y un valor queda elegido cuando lo acepta una <b>mayoría</b>. Es correcto pero difícil de entender e implementar.`,
      texto: `<p>Paxos es el algoritmo de consenso más antiguo y conocido. El profesor lo nombra junto a Bully y Raft, y dijo que no hay algoritmos que hayan resultado mejores que Paxos o Raft. En el curso se usa sobre todo como referencia para entender por qué Raft es más simple.</p>
<p>Los roles son:</p>
<ul><li><b>Proposer:</b> propone un valor con un número de propuesta.</li>
<li><b>Acceptor:</b> vota; promete no aceptar propuestas más viejas.</li>
<li><b>Learner:</b> se entera del valor elegido.</li></ul>
<p>Funciona en dos fases: <b>prepare/promise</b> (el proposer pide permiso con un número; una mayoría promete ignorar números menores) y <b class="nog">accept/accepted</b> (el proposer pide aceptar el valor; si la mayoría acepta, queda elegido).</p>
<p><b>Diferencia con Raft:</b> en Paxos cualquiera puede proponer, así que hay más casos que razonar. Raft simplifica: solo el <b>líder</b> propone, y el resto copia.</p>`,
      ojo: [`Paxos y Raft resuelven el mismo problema (consenso con mayoría). Raft es la versión pensada para ser entendible.`],
      recuerda: `En el certamen no conviene implementar Paxos en C: es largo y fácil de equivocarse. Si lo mencionas, basta explicar las dos fases y que decide la mayoría.`
    },
    {
      id: 'quorum', ejercicios: ['X1', 'X8'], titulo: 'Votación por quórum', resumen: 'La elección que explicó el profesor: N impar, nadie vota por sí mismo, gana la mayoría.',
      idea: `Los nodos <b>votan</b> según un criterio común y gana quien junte <b>mayoría</b>. Como solo un lado de una partición puede tener mayoría, no hay dos líderes.`,
      texto: `<p>El <b>quórum</b> es la cantidad mínima de votos para decidir: <b>N/2 + 1</b> (división entera). Con 5 nodos, el quórum es 3, y el sistema tolera 2 caídas.</p>
<p>Las reglas que dio el profesor para elegir líder por votación:</p>
<ol><li>El número de nodos debe ser <b>impar</b>.</li>
<li><b>Nadie vota por sí mismo.</b></li>
<li>Todos usan el mismo <b>criterio</b> para votar (por ejemplo, el de menor latencia o el más actualizado).</li>
<li>Gana quien tiene <b>mayoría</b>.</li></ol>
<p>Es <b>determinista</b>: con las mismas condiciones, siempre gana el mismo.</p>
<p>¿Por qué impar? Con N par, una partición puede dejar dos mitades iguales (2 | 2) y <b>ninguna</b> llega a la mayoría: empate, y nadie es elegido.</p>`,
      ejemplo: `Pregunta de examen del profesor: <i>"¿Se puede usar quórum para resolver el split-brain con un número par de nodos?"</i> → <b>No.</b> Con N par puede haber empate y no se elige líder.`,
      recuerda: `El quórum es la idea que usan Raft (votos) y Redis Sentinel (para declarar caído al primario). Bully no lo usa.`
    },
    {
      id: '2pc', ejercicios: ['X3'], titulo: '2PC: commit en dos fases', resumen: 'No elige líder: confirma una transacción en todos los nodos o en ninguno.',
      idea: `Un <b>coordinador</b> pregunta a todos "¿pueden confirmar?" y solo si <b>todos</b> dicen sí, ordena confirmar. Si uno dice no, se cancela en todos.`,
      pasos: [`<b>Fase 1 (PREPARE):</b> el coordinador pregunta a cada participante si puede confirmar la transacción. Cada uno responde Sí o No.`,
        `<b>Fase 2:</b> si <b>todos</b> dijeron Sí → envía COMMIT. Si alguno dijo No (o no respondió) → envía ABORT.`],
      texto: `<p>2PC garantiza <b>atomicidad</b>: la operación ocurre en todos los nodos o en ninguno. Es la forma típica de implementar <b>consistencia fuerte</b>.</p>
<p>Desventajas: es <b>lento</b> (espera a todos) y <b>bloqueante</b>: si el coordinador se cae entre las dos fases, los participantes quedan esperando sin saber si confirmar o cancelar.</p>`,
      ojo: [`2PC <b>supone</b> que ya hay un coordinador; no lo elige. Si te preguntan cómo elegir un líder, la respuesta es Bully o Raft, no 2PC.`,
        `2PC necesita que respondan <b>todos</b>; Raft solo la <b>mayoría</b>. Por eso Raft sigue funcionando con nodos caídos y 2PC no.`]
    },
    {
      id: 'comparacion', titulo: 'Comparación de los algoritmos', comparacion: true, resumen: 'Bully, Raft, Paxos, quórum y 2PC lado a lado, y cuál elegir.',
      idea: `<b>Bully</b> elige rápido por prioridad pero no aguanta particiones. <b>Raft y Paxos</b> deciden por mayoría y sí las aguantan. <b>2PC</b> no elige líder: confirma transacciones.`,
      tabla: { cols: ['', 'Bully', 'Raft', 'Paxos', 'Quórum (votación)', '2PC'],
        filas: [
          ['Para qué sirve', 'Elegir líder', 'Consenso: elegir líder y replicar el log', 'Consenso sobre un valor', 'Elegir líder o decidir por votación', 'Confirmar una transacción en todos'],
          ['Quién gana / decide', 'El de mayor prioridad vivo (ID o aptitud)', 'El candidato con mayoría de votos', 'El valor aceptado por la mayoría', 'El más votado, con mayoría', 'El coordinador, si todos dicen Sí'],
          ['Mensajes', 'ELECTION, OK, COORDINATOR', 'RequestVote, AppendEntries', '<span class="nog">Prepare/Promise, Accept/Accepted</span>', 'Votos', 'PREPARE, Sí/No, COMMIT/ABORT'],
          ['¿Necesita mayoría?', 'No', 'Sí', 'Sí', 'Sí', 'No: necesita a todos'],
          ['¿Evita split-brain?', 'No: con partición, cada lado elige uno', 'Sí', 'Sí', 'Sí (con N impar)', 'No aplica'],
          ['Si un nodo cae', 'Timeout y sigue; cambia el ganador solo si cae el que iba a ganar', 'Sigue mientras haya mayoría', 'Sigue mientras haya mayoría', 'Sigue mientras haya mayoría', 'Se bloquea o aborta'],
          ['Costo en mensajes', 'O(n²) en el peor caso', 'O(n) por elección', 'Varias rondas por valor', 'O(n)', '3 mensajes por participante'],
          ['Dificultad de implementar', 'Baja', 'Media', 'Alta', 'Baja', 'Baja'],
          ['Cuándo usarlo', 'Pocos nodos, prioridad clara, red confiable', 'Sistemas reales que necesitan un líder seguro (etcd, Consul)', 'Referencia teórica; sistemas como Chubby', 'Detección de caída y failover (Redis Sentinel)', 'Transacciones que deben ser atómicas (finanzas)']] },
      texto: `<p><b>¿Cuál elijo en el certamen?</b> Si te piden <b>implementar en C</b> la elección con prioridad (aptitud), elige <b>Bully</b>: tiene 3 mensajes, una regla simple y gana el más prioritario, que es justo lo que pide la función de aptitud. Si te preguntan por <b>particiones</b> o split-brain, menciona que Raft (mayoría) lo evita y Bully no.</p>`,
      ojo: [`Bully y Raft no compiten en todo: Bully solo elige; Raft además replica el log.`,
        `"Raft usa el ID mayor" es falso: Raft usa votos y timeouts aleatorios.`],
      recuerda: `Una frase por algoritmo: <b>Bully</b> = gana el más fuerte vivo. <b>Raft</b> = gana quien junta mayoría de votos, y luego replica el log. <b>Paxos</b> = cualquiera propone, decide la mayoría. <b>Quórum</b> = votación con N impar. <b>2PC</b> = todos confirman o nadie.`
    }
  ]
});

/* =====================================================================
   FUNCIONES DE APTITUD
   ===================================================================== */
teoria.push({
  id: 'aptitud', unidad: 'Unidad 2 · Certamen 2', titulo: 'Funciones de aptitud',
  resumen: 'Convertir varios criterios (batería, distancia, visibilidad) en un solo número para decidir quién es mejor líder.',
  intro: `Una <b>función de aptitud</b> F resume en un solo número qué tan bueno es un nodo para un rol. En el Control 3 decide qué dron debe ser el nuevo líder del enjambre, y después ese número se usa como <b>prioridad</b> en el algoritmo de elección.`,
  sub: [
    {
      id: 'que-es', titulo: '¿Qué es y para qué sirve?', resumen: 'Un número por nodo que combina varios criterios con pesos.',
      idea: `F = <b>suma ponderada</b> de criterios normalizados. Mientras mayor es F, mejor candidato es el nodo.`,
      texto: `<p>Cuando hay que elegir un líder, rara vez basta un solo criterio. El dron con más batería puede estar lejísimos; el más cercano puede tener poca visibilidad. La función de aptitud mezcla todos los criterios en uno, dándole a cada uno un <b>peso</b> según cuánto importa para la misión.</p>
<p>Forma general:</p>
<p><code>F = 100 · (w1 · c1 + w2 · c2 + w3 · c3)</code>, con cada criterio c entre 0 y 1 y los pesos sumando 1. Así F queda entre 0 y 100.</p>
<p>Después se calcula F para cada nodo <b>operativo</b>, se ordenan de mayor a menor y el primero es el mejor candidato.</p>`,
      recuerda: `La pauta pide: (1) F como expresión calculable con los tres criterios; (2) la distancia con relación inversa; (3) cada peso justificado según el contexto; (4) aplicar F a cada dron; (5) ordenarlos.`,
      ejercicios: ['K1']
    },
    {
      id: 'normalizar', titulo: 'Normalizar los criterios', resumen: 'Llevar todo a la misma escala (0 a 1) antes de aplicar pesos.',
      idea: `Si sumas números de escalas distintas, <b>gana el que tiene números más grandes</b>, no el más importante. Normalizar evita eso.`,
      texto: `<p>Batería va de 0 a 100 %, visibilidad de 0 a 100, y distancia de 0.5 a 2.1 km. Si sumas "batería + visibilidad − distancia", la distancia casi no influye: su efecto es como mucho 2.1 puntos, contra 100 de los otros.</p>
<p>Normalizar es dividir por el máximo posible para que todos queden entre 0 y 1:</p>
<ul><li><code>bat = bateria / 100</code></li>
<li><code>vis = visibilidad / 100</code></li>
<li><code>distancia / dmax</code>, donde <code>dmax</code> es la mayor distancia entre los drones operativos.</li></ul>
<p>Con todo en 0–1, el <b>peso</b> es lo único que decide cuánto importa cada criterio.</p>`,
      ejemplo: `C4: batería 91 % → 0.91; visibilidad 70 → 0.70; distancia 2.1 km con dmax = 2.1 → 1.0 (el más lejano).`,
      ojo: [`Calcular <code>dmax</code> incluyendo a C3 (caído): sus datos no valen y distorsionan la escala. Solo operativos.`]
    },
    {
      id: 'inversos', titulo: 'Criterios inversos', resumen: 'Cuando menos es mejor (como la distancia), hay que invertirlo.',
      idea: `Para la distancia, <b>menos es mejor</b>. Hay que convertirla en "cercanía" o restarla; nunca sumarla tal cual.`,
      texto: `<p>Dos formas válidas, que dan el mismo orden:</p>
<ul><li><b>Cercanía (complemento):</b> <code>cerca = 1 − distancia / dmax</code>. El más lejano saca 0 y el más cercano casi 1. Se <b>suma</b> como los otros criterios.</li>
<li><b>Castigo (resta):</b> <code>F = … − w · (distancia / dmax)</code>. La distancia resta puntos.</li></ul>
<p>Con la cercanía, F queda entre 0 y 100, lo que es más fácil de leer. Si usas la escala 0–100 en vez de 0–1, el complemento es <code>100 − …</code>: de ahí sale el "100 −" que aparece en algunas fórmulas.</p>`,
      tabla: { titulo: 'Cercanía de cada dron (dmax = 2.1 km)', cols: ['Dron', 'Distancia', 'd / dmax', 'Cercanía = 1 − d/dmax'],
        filas: [['C5', '0.5 km', '0.24', '<b>0.76</b> (el más cercano)'], ['C2', '0.8 km', '0.38', '0.62'], ['C1', '1.2 km', '0.57', '0.43'], ['C6', '1.5 km', '0.71', '0.29'], ['C4', '2.1 km', '1.00', '<b>0</b> (el más lejano)']] },
      ojo: [`Sumar la distancia tal cual premia al dron <b>más lejano</b>.`]
    },
    {
      id: 'pesos', titulo: 'Elegir y justificar los pesos', resumen: 'Los pesos suman 1 y cada uno necesita una razón ligada a la misión.',
      idea: `El peso dice <b>cuánto importa</b> cada criterio para el rol de líder. No basta nombrar el criterio: hay que explicar <b>por qué</b> pesa eso en este contexto.`,
      texto: `<p>Pasos para decidir los pesos:</p>
<ol><li><b>Ordena</b> los criterios por importancia para la misión.</li>
<li>Asigna pesos que respeten ese orden y <b>sumen 1</b>.</li>
<li>Justifica cada uno con el contexto (vigilancia con cámara multiespectral).</li></ol>
<p>Una forma sistemática es <b>rank-sum</b>: con 3 criterios ordenados, los pesos son 3/6, 2/6 y 1/6 (0.50, 0.33, 0.17). Puedes partir de ahí y ajustar.</p>`,
      tabla: { titulo: 'Pesos de la solución y su justificación', cols: ['Criterio', 'Peso', 'Por qué'],
        filas: [['Batería', '0.40', 'El líder coordina por horas y gasta más energía; si se agota, hay que repetir la elección.'],
          ['Visibilidad', '0.35', 'La cámara multiespectral del líder alimenta el terminal central: sin buena visibilidad, la vigilancia falla.'],
          ['Cercanía', '0.25', 'Estar cerca del perímetro permite reaccionar antes, pero con red mesh importa menos.']] },
      ojo: [`Otro orden de pesos <b>también es válido</b> si lo justificas. Lo que se evalúa es que el argumento sea coherente con la misión.`,
        `<b>Doble conteo:</b> si la distancia afecta la visibilidad y además pesa sola, estás contando dos veces lo mismo. Puedes mencionarlo y bajar su peso.`],
      recuerda: `Escribe una frase por peso con la forma: "<i>criterio</i> pesa <i>X</i> porque, en esta misión, <i>consecuencia</i>".`
    },
    {
      id: 'calcular', titulo: 'Calcular y ordenar', resumen: 'Aplicar F a cada dron con la tabla del control y obtener el ranking.',
      idea: `Reemplaza en F los valores normalizados de cada dron, calcula y ordena de mayor a menor. Los caídos no participan.`,
      tabla: { titulo: 'F = 100 · (0.40·bat + 0.25·cerca + 0.35·vis)', cols: ['Dron', 'Batería', 'Cercanía', 'Visibilidad', 'F', 'Lugar'],
        filas: [['C5', '0.62', '0.76', '0.88', '<b>74.6</b>', '1º'], ['C1', '0.78', '0.43', '0.85', '71.7', '2º'], ['C2', '0.45', '0.62', '0.92', '65.7', '3º'], ['C4', '0.91', '0', '0.70', '60.9', '4º'], ['C6', '0.83', '0.29', '0.45', '56.1', '5º'], ['C3', '—', '—', '—', 'caído', '—']] },
      ejemplo: `F(C5) = 100 · (0.40 · 0.62 + 0.25 · 0.76 + 0.35 · 0.88) = 100 · (0.248 + 0.190 + 0.308) = <b>74.6</b>.<br>
¿Por qué gana C5 y no C4, que tiene la mayor batería? Porque C4 es el más lejano (cercanía 0) y tiene visibilidad media. Un solo criterio alto no basta.`,
      codigo: `float calcular_aptitud(Dron d, float dmax) {
    float bat = d.bateria / 100;
    float vis = d.visibilidad / 100;
    float cerca = 1 - d.distancia / dmax;
    return 100 * (W_BAT * bat + W_DIST * cerca + W_VIS * vis);
}`,
      recuerda: `Los números deben ser <b>coherentes con tu fórmula</b>. Si usaste otra fórmula válida, tus valores serán otros, y está bien mientras el orden salga de tus propios cálculos.`,
      ejercicios: ['K1']
    }
  ]
});

/* =====================================================================
   DETECCIÓN DE FALLAS
   ===================================================================== */
teoria.push({
  id: 'fallas', unidad: 'Unidad 2', titulo: 'Detección de fallas',
  resumen: 'Cómo saber si un nodo cayó: ping vs heartbeat, timeouts, particiones, split-brain y recuperación.',
  intro: `Antes de elegir un nuevo líder hay que <b>darse cuenta</b> de que el anterior cayó. El problema es que en una red nunca se sabe con certeza: un nodo caído, uno lento y uno aislado se ven igual. Todo este tema trata de cómo decidir con información incompleta.`,
  sub: [
    {
      id: 'caido-lento', titulo: '¿Caído o lento?', resumen: 'Por qué es imposible distinguirlo con certeza.',
      idea: `Si A no recibe respuesta de B, <b>no puede saber</b> si B cayó, está lento, la red se partió o el mensaje se perdió. Solo puede <b>suponer</b> después de esperar un tiempo.`,
      texto: `<p>Cuatro situaciones distintas producen el mismo síntoma ("no me responde"):</p>
<ul><li>B está <b>caído</b>.</li><li>B está <b>muy lento</b> u ocupado.</li><li>La <b>red está particionada</b> y A y B quedaron en lados distintos.</li><li>El <b>mensaje se perdió</b> en el camino.</li></ul>
<p>Por eso los sistemas distribuidos usan <b>timeouts</b>: "si no respondes en T segundos, asumo que caíste". Es una suposición, y a veces es falsa.</p>`,
      recuerda: `Esta es la razón de fondo de todo lo demás: los heartbeats, los timeouts, el quórum y el split-brain existen porque no se puede distinguir caído de lento.`
    },
    {
      id: 'ping-heartbeat', titulo: 'Ping vs heartbeat', comparacion: true, resumen: 'Por qué el ping no sirve para saber si un servidor está vivo.',
      idea: `El <b>ping</b> es una herramienta externa que el servidor puede ignorar. El <b>heartbeat</b> es parte del propio sistema: un "estoy vivo" que sí es confiable.`,
      tabla: { cols: ['', 'Ping', 'Heartbeat'],
        filas: [['Qué es', 'Comando externo y administrativo (ICMP)', 'Función del propio sistema: mensaje "estoy vivo"'],
          ['¿Siempre responde?', 'No: el servidor puede estar configurado para no responder (seguridad) o estar ocupado', 'Sí, si el proceso funciona'],
          ['Qué prueba', 'Que la máquina responde a la red', 'Que el <b>proceso</b> del sistema está funcionando'],
          ['Un "no responde" significa', 'Poco: puede estar vivo igual', 'Que probablemente falló (tras n ciclos)']] },
      texto: `<p>El heartbeat funciona por <b>polling</b>: se pregunta periódicamente. Ni muy seguido (satura al nodo con solicitudes) ni muy espaciado (una falla pasa inadvertida mucho rato).</p>`
    },
    {
      id: 'timeouts', ejercicios: ['X4'], titulo: 'Timeouts y falsos positivos', resumen: 'El trade-off entre detectar rápido y equivocarse poco.',
      idea: `Un timeout <b>corto</b> detecta rápido pero se equivoca mucho; uno <b>largo</b> se equivoca poco pero detecta tarde. Siempre es un <b>trade-off</b>.`,
      tabla: { cols: ['Timeout', 'Ventaja', 'Desventaja'],
        filas: [['Corto', 'Detecta la caída rápido', 'Muchos <b>falsos positivos</b>: da por muerto a un nodo que solo estaba lento'],
          ['Largo', 'Pocos falsos positivos', 'Detección lenta: el sistema queda sin líder más tiempo']] },
      texto: `<p>Un <b>falso positivo</b> es dar por caído un nodo vivo. Es grave: se inicia una elección, y cuando el "caído" vuelve, puede haber <b>dos líderes</b>.</p>
<p><b>Timeouts adaptativos:</b> en vez de un valor fijo, el timeout se ajusta según la latencia observada, por ejemplo <b>media + 4 · desviación estándar</b>. Se calcula sobre una <b>ventana de tiempo</b> (por ejemplo, las últimas 24 horas), <b>nunca con el 100 % de los datos</b>, porque las fallas antiguas distorsionan el cálculo.</p>`
    },
    {
      id: 'n-ciclos', titulo: 'Declarar caído tras n ciclos', resumen: 'Contar fallos consecutivos y avisar una sola vez.',
      idea: `No se declara caído al primer timeout, sino tras <b>n ciclos seguidos</b> sin respuesta (por ejemplo 3). Si responde entremedio, la cuenta <b>vuelve a 0</b>.`,
      texto: `<p>Un solo timeout puede ser un paquete perdido. Exigir 3 seguidos baja mucho la probabilidad de un falso positivo, a cambio de detectar unos ciclos más tarde.</p>
<p>Dos detalles que se evalúan:</p>
<ul><li><b>Consecutivos:</b> una respuesta prueba que está vivo, así que reinicia el contador. Si no se reiniciara, fallos esporádicos a lo largo de horas terminarían declarando muerto a un nodo sano.</li>
<li><b>Avisar una vez:</b> al llegar a n se marca INOPERATIVO y se inicia <b>una</b> elección. En el ciclo n+1 no se vuelve a avisar.</li></ul>`,
      tabla: { titulo: 'Ejemplo con MAX_FALLOS = 3', cols: ['Ciclo', '¿Respondió?', 'fallos', 'Estado'],
        filas: [['1', 'No', '1', 'operativo'], ['2', 'No', '2', 'operativo'], ['3', '<b>Sí</b>', '<b>0</b>', 'operativo'], ['4', 'No', '1', 'operativo'], ['5', 'No', '2', 'operativo'], ['6', 'No', '3', '<b>INOPERATIVO</b> → inicia elección']] },
      codigo: `int registrar_ciclo(Monitor *m, int respondio, const char *hora) {
    if (respondio == 1) {
        m->fallos = 0;
        return 0;
    }
    m->fallos = m->fallos + 1;
    if (m->fallos >= MAX_FALLOS) {
        if (m->estado == OPERATIVO) {
            m->estado = INOPERATIVO;
            return 1;            /* iniciar la elección, una sola vez */
        }
    }
    return 0;
}`,
      recuerda: `En el log del Control 3, cada ciclo dura unos 7 s (5 s de período + 2 s de espera), así que la caída se detecta unos 3 ciclos después: de 03:12:00 a 03:12:19.`,
      ejercicios: ['K2']
    },
    {
      id: 'particion', titulo: 'Red particionada', resumen: 'Cuando la red se divide sin que nadie lo pida.',
      idea: `Una <b>partición</b> es una división de la red que nadie pidió: cae un switch o un router, y quedan grupos de nodos que no se ven entre sí.`,
      texto: `<p>Hay que distinguirla de <b>segmentar</b> una red, que es intencional (por ejemplo, subredes en una VPC de AWS).</p>
<p>Para un nodo, una partición es <b>indistinguible</b> de que el otro esté caído o lento: simplemente deja de recibir respuestas. Lo peligroso es que ambos lados siguen vivos y pueden tomar decisiones por separado.</p>`
    },
    {
      id: 'split-brain', ejercicios: ['X1', 'X8'], titulo: 'Split-brain y quórum', resumen: 'Dos líderes a la vez, y cómo la mayoría lo impide.',
      idea: `<b>Split-brain</b>: por una partición, cada lado cree que el otro murió y <b>ambos eligen líder</b>. Se evita exigiendo <b>mayoría</b> (quórum) para elegir.`,
      texto: `<p>Ejemplo: 5 nodos, la red se parte en 3 | 2. Si cualquier lado pudiera elegir, habría dos primarios aceptando escrituras distintas. Al volver la red, los datos están en conflicto.</p>
<p>Con <b>quórum = N/2 + 1 = 3</b>, solo el lado de 3 puede elegir líder. El lado de 2 queda sin líder (no acepta escrituras) hasta que la red se repare.</p>
<p>Por eso N debe ser <b>impar</b>: con 4 nodos, una partición 2 | 2 deja a ambos lados sin mayoría.</p>`,
      ojo: [`Bully <b>no</b> usa mayoría, así que no evita el split-brain. Raft sí.`]
    },
    {
      id: 'recuperacion', titulo: 'Recuperarse de una falla', resumen: 'Checkpoints, log replay y state transfer.',
      idea: `Cuando un nodo vuelve, tiene que <b>ponerse al día</b> antes de participar: desde una copia guardada, re-ejecutando operaciones o copiando el estado de otro.`,
      tabla: { cols: ['Estrategia', 'Cómo funciona', 'Ventaja', 'Desventaja'],
        filas: [['Checkpointing', 'Guarda una copia (snapshot) del estado cada cierto tiempo, y al volver re-ejecuta solo lo posterior', 'Rápido de recuperar', 'Hay que guardar copias periódicas'],
          ['Log replay', 'Re-ejecuta todas las operaciones del log desde el inicio', 'Completo', 'Lento; por eso se combina con checkpoints'],
          ['State transfer', 'Copia el estado completo desde otra réplica', 'El más rápido', 'Necesita una réplica disponible y actualizada']] },
      texto: `<p><b>Redis Sentinel</b> es un ejemplo real de detección y failover: varios sentinels hacen PING al primario. Si uno no recibe respuesta, lo marca <b>SDOWN</b> (caído subjetivo). Si una <b>mayoría</b> concuerda, pasa a <b>ODOWN</b> (caído objetivo), votan por el backup más actualizado y lo promueven. Tarda unos 15–30 s.</p>`,
      recuerda: `Condición del profesor: un nodo que revive no puede ser líder con el historial atrasado. Primero se pone al día.`
    }
  ]
});

/* =====================================================================
   REPLICACIÓN
   ===================================================================== */
teoria.push({
  id: 'replicacion', unidad: 'Unidad 2', titulo: 'Replicación',
  resumen: 'Tener copias de los datos en varios nodos: primary-backup, multi-master, logs y conflictos.',
  intro: `Replicar es mantener <b>copias de los datos en varios nodos</b>. Es la base de la tolerancia a fallas: si un nodo cae, otro tiene los datos. Pero las copias pueden desincronizarse, y ahí aparecen los problemas de este tema.`,
  sub: [
    {
      id: 'por-que', titulo: '¿Por qué replicar?', resumen: 'Disponibilidad, rendimiento y escalabilidad.',
      idea: `Se replica para no tener un <b>punto único de falla</b>, para responder más rápido y para aguantar más carga.`,
      texto: `<ul><li><b>Disponibilidad:</b> si un nodo falla, otro sigue atendiendo. Sin réplicas, el servidor es un punto único de falla.</li>
<li><b>Rendimiento:</b> una réplica cercana al usuario reduce la latencia, y las lecturas se reparten entre varias.</li>
<li><b>Escalabilidad:</b> si crece la carga, se agregan réplicas.</li></ul>
<p>El costo: cada réplica cuesta dinero y hace la <b>sincronización más compleja</b>. Por eso los backups suelen ser máquinas más chicas, pensadas para aguantar unas horas mientras se repara el principal.</p>`
    },
    {
      id: 'replicar-duplicar', titulo: 'Replicar vs duplicar', comparacion: true, resumen: 'Copiar los datos no es lo mismo que clonar el nodo.',
      idea: `<b>Replicar</b> = mandar una copia de los <b>datos</b> a otro nodo. <b>Duplicar</b> = clonar el <b>nodo completo</b>.`,
      tabla: { cols: ['', 'Replicar', 'Duplicar'],
        filas: [['Qué se copia', 'Los datos', 'El nodo entero (sistema, configuración y datos)'], ['Peso', 'Liviano', 'Pesado'], ['Uso típico', 'Backups que siguen al primario', 'Levantar otra máquina idéntica']] },
      texto: `<p>Semánticamente parecen lo mismo, pero operacionalmente no. Así lo distinguió el profesor en clase.</p>`
    },
    {
      id: 'primary-backup', titulo: 'Primary-backup', resumen: 'Un solo nodo escribe; los backups copian y leen.',
      idea: `Solo el <b>primario</b> acepta escrituras y envía los cambios a los <b>backups</b>, que solo leen.`,
      texto: `<p>Es el esquema más común (MySQL, PostgreSQL, Redis). Como hay un solo escritor, <b>no hay conflictos de escritura</b> y la consistencia es más fácil.</p>
<p>Problemas: el primario es un <b>cuello de botella</b>, y si cae hay un tiempo sin servicio hasta que un backup lo reemplaza (<b>failover</b>, típicamente 5–30 s).</p>
<p><b>Failover:</b> se detecta por timeout de heartbeat y se elige el nuevo primario con criterios como el <b>backup más actualizado</b> (log más completo), una prioridad configurada y el ID más bajo para desempatar. Si ningún backup tiene la réplica exacta, gana el más actualizado y se asume la <b>pérdida</b> de las transacciones que no alcanzaron a replicarse: perder lo mínimo en vez de perderlo todo.</p>`
    },
    {
      id: 'multi-master', titulo: 'Multi-master', resumen: 'Cualquier nodo acepta escrituras, y aparecen conflictos.',
      idea: `<b>Todos</b> los nodos aceptan escrituras y se replican entre sí. No hay cuello de botella, pero sí <b>conflictos</b>.`,
      texto: `<p>Se usa cuando los usuarios están repartidos geográficamente (juegos en línea, nubes, Cassandra, CouchDB). Cada usuario escribe en el nodo más cercano.</p>
<p>El problema principal: dos nodos pueden modificar el mismo dato a la vez. Hay que <b>resolver el conflicto</b>, y en un sistema distribuido se hace de forma <b>automática</b>, sin un humano.</p>`
    },
    {
      id: 'pb-vs-mm', titulo: 'Primary-backup vs multi-master', comparacion: true, resumen: 'Cuándo conviene cada esquema.',
      idea: `Primary-backup es <b>simple y consistente</b>; multi-master es <b>disponible y rápido</b> pero con conflictos.`,
      tabla: { cols: ['', 'Primary-backup', 'Multi-master'],
        filas: [['Quién escribe', 'Solo el primario', 'Cualquier nodo'], ['Conflictos', 'No hay', 'Sí, hay que resolverlos'], ['Cuello de botella', 'El primario', 'No'], ['Si cae un nodo', 'Failover: unos segundos sin escrituras', 'Los demás siguen escribiendo'], ['Consistencia', 'Más fácil (fuerte)', 'Normalmente eventual'], ['Ejemplos', 'MySQL, PostgreSQL, Redis', 'Cassandra, CouchDB, Riak']] }
    },
    {
      id: 'log', titulo: 'Replicación por log', resumen: 'Guardar las operaciones, no los datos, y re-ejecutarlas.',
      idea: `El log (bitácora) guarda las <b>operaciones</b> en orden. Un backup se pone al día <b>re-ejecutándolas</b> hasta llegar al valor actual.`,
      texto: `<p>En vez de copiar la base de datos completa, el primario envía cada operación ("sumar 50 a la cuenta A") con un número de secuencia. El backup las aplica en el mismo orden.</p>
<p>Antes de aplicar una entrada, el backup verifica que sea la siguiente: <code>seq_num == last_applied + 1</code>. Si falta alguna, <b>pide las faltantes</b> antes de seguir.</p>
<p>Las bases de datos como Cassandra trabajan así: guardan las acciones para poder reconstruir el estado.</p>`,
      ejercicios: ['L08']
    },
    {
      id: 'conflictos', titulo: 'Resolver conflictos', resumen: 'Last-write-wins, vector clocks y CRDTs.',
      idea: `Cuando dos réplicas escribieron lo mismo a la vez, hay tres formas automáticas de decidir: <b>gana la última</b>, <b>detectar y mezclar</b>, o usar estructuras que <b>se mezclan solas</b>.`,
      tabla: { cols: ['Estrategia', 'Cómo funciona', 'Ventaja', 'Desventaja'],
        filas: [['Last-write-wins (LWW)', 'Gana la escritura con el timestamp mayor', 'Muy simple', 'Pierde datos: la otra escritura desaparece'],
          ['Vector clocks + merge', 'Detecta que las escrituras fueron concurrentes y la aplicación las mezcla', 'No pierde datos', 'Requiere lógica de mezcla'],
          ['CRDTs', 'Estructuras que se mezclan solas (ej. contador: merge = máximo por nodo)', 'Automático y sin pérdida', 'Solo para ciertos tipos de datos']] },
      ejemplo: `En <b>Git</b> el conflicto lo resuelve un humano: merge, quedarse con la versión A o con la B. En el <b>carrito de Amazon</b> (DynamoDB) se usan vector clocks: si hay conflicto, se muestran todos los ítems mezclados, porque es mejor un ítem de más que perder una venta.`
    },
    {
      id: 'seguridad', titulo: 'Atacar el backup', resumen: 'Por qué el backup también hay que protegerlo.',
      idea: `Un atacante puede <b>corromper el backup</b> en vez del principal: cuando el principal caiga, el sistema se levanta con datos malos.`,
      texto: `<p>Todos suelen proteger el servidor principal y olvidar el backup, o el medio por donde viajan las copias (<b>man in the middle</b>). Si el backup está corrupto, el failover "funciona", pero con datos falsos.</p>
<p>Defensa: <b>verificar</b> que el backup está sano y sincronizado antes de usarlo, y proteger también el canal de replicación.</p>`
    }
  ]
});

/* =====================================================================
   CONSISTENCIA Y CAP
   ===================================================================== */
teoria.push({
  id: 'consistencia', unidad: 'Unidad 2', titulo: 'Consistencia y CAP',
  resumen: 'Qué garantías dan las réplicas al leer: fuerte, eventual y causal. Teorema CAP, PACELC y overhead.',
  intro: `Si hay varias copias de un dato, ¿qué ve el que lee? Un <b>modelo de consistencia</b> es la promesa que hace el sistema sobre eso. Más garantías significan más espera; menos garantías, más velocidad.`,
  sub: [
    {
      id: 'que-es', titulo: '¿Qué es la consistencia?', resumen: 'Que las réplicas converjan y las lecturas sean predecibles.',
      idea: `Consistencia = garantía de que las réplicas <b>convergen al mismo valor</b> y que las lecturas reflejan las escrituras de forma predecible.`,
      texto: `<p>Es difícil porque hay varias réplicas, escrituras concurrentes, latencia variable, nodos que fallan y particiones de red.</p>`,
      ejemplo: `Caso bancario: saldo inicial $100. Se depositan $50 en la réplica A y se retiran $30 en la réplica B, antes de que se repliquen. Resultado: A tiene $150, B $70 y C $100. <b>Ninguna tiene el valor correcto ($120)</b>, porque cada una vio solo parte de las escrituras.`
    },
    {
      id: 'fuerte', titulo: 'Consistencia fuerte', resumen: 'Toda lectura ve la escritura más reciente.',
      idea: `Funciona como si hubiera <b>una sola copia</b>: después de escribir, cualquier lectura en cualquier réplica ve el valor nuevo.`,
      texto: `<p>Se implementa típicamente con <b>2PC</b>: no se confirma la escritura hasta que todas las réplicas la tienen.</p>
<ul><li>✓ Fácil de razonar, sin conflictos.</li><li>✗ <b>Alta latencia</b> (hay que esperar a todas), se <b>bloquea</b> si una réplica no responde, no tolera particiones.</li></ul>
<p>Se usa donde un error es inaceptable: finanzas, inventario, historial de un chat.</p>`
    },
    {
      id: 'eventual', titulo: 'Consistencia eventual', resumen: 'Las réplicas convergen... en algún momento.',
      idea: `Si dejan de llegar escrituras, <b>eventualmente</b> todas las réplicas tendrán el mismo valor. No dice cuándo.`,
      texto: `<p>Se escribe en una réplica y se propaga a las demás de forma asíncrona. El ejemplo clásico es el <b>DNS</b>: un cambio tarda en verse en todo el mundo.</p>
<ul><li>✓ Baja latencia, alta disponibilidad, escala bien.</li><li>✗ Lecturas viejas y conflictos que resolver.</li></ul>
<p>Se usa en redes sociales, carritos de compra, DNS, notificaciones.</p>`
    },
    {
      id: 'causal', titulo: 'Consistencia causal', resumen: 'Lo que tiene relación de causa se ve en orden.',
      idea: `Si una escritura <b>causó</b> otra, todos las ven en ese orden. Las que no tienen relación pueden verse en cualquier orden.`,
      texto: `<p>Es un punto medio entre fuerte y eventual. Se implementa con <b>vector clocks</b>: una réplica aplica una escritura solo si ya aplicó todas sus causas.</p>`,
      ejemplo: `Chat: Alice pregunta "¿vamos al cine?" y Bob responde "sí". Con consistencia causal, nadie verá el "sí" de Bob antes de la pregunta de Alice.`,
      ejercicios: ['L12']
    },
    {
      id: 'modelos', titulo: 'Comparación de modelos', comparacion: true, resumen: 'Fuerte, causal y eventual lado a lado.',
      idea: `De más fuerte a más débil: <b>fuerte</b> (todos ven lo último) → <b>causal</b> (se respeta causa-efecto) → <b>eventual</b> (algún día coinciden).`,
      tabla: { cols: ['', 'Fuerte', 'Causal', 'Eventual'],
        filas: [['Garantía', 'Toda lectura ve la escritura más reciente', 'Las escrituras relacionadas se ven en orden', 'Las réplicas convergen si paran las escrituras'],
          ['Cómo se implementa', '2PC, líder único', 'Vector clocks', 'Propagación asíncrona + resolución de conflictos'],
          ['Latencia', 'Alta', 'Media', 'Baja'],
          ['Disponibilidad con fallas', 'Baja', 'Media', 'Alta'],
          ['Ejemplo', 'Transferencias bancarias', 'Respuestas en un chat', 'DNS, likes, carrito']] },
      recuerda: `En el chat distribuido del curso: <b>fuerte</b> para el historial de mensajes y los mensajes privados; <b>eventual</b> para las notificaciones del sistema.`
    },
    {
      id: 'cap', titulo: 'Teorema CAP', resumen: 'Consistencia, disponibilidad, tolerancia a particiones: solo 2 de 3.',
      idea: `Ante una <b>partición</b>, un sistema debe elegir: seguir respondiendo (<b>A</b>) o mantener los datos consistentes (<b>C</b>). No puede tener las dos.`,
      texto: `<p>Brewer (2000): de estas tres propiedades solo se pueden garantizar dos a la vez:</p>
<ul><li><b>C</b>onsistency: toda lectura ve la escritura más reciente.</li>
<li><b>A</b>vailability: toda petición recibe respuesta.</li>
<li><b>P</b>artition tolerance: el sistema sigue funcionando aunque se pierdan mensajes entre nodos.</li></ul>
<p>Como en una red real las particiones <b>van a ocurrir</b>, la elección práctica es entre <b>CP</b> y <b>AP</b>.</p>`,
      tabla: { titulo: 'CP vs AP', cols: ['', 'CP', 'AP'],
        filas: [['Ante una partición', 'El lado minoritario rechaza escrituras', 'Ambos lados aceptan escrituras y reconcilian después'], ['Prioriza', 'Que los datos sean correctos', 'Que el sistema responda'], ['Consistencia', 'Fuerte', 'Eventual'], ['Ejemplos', 'HBase, MongoDB (por defecto), Google Spanner', 'Cassandra, DynamoDB, Riak']] }
    },
    {
      id: 'pacelc', titulo: 'PACELC', resumen: 'Lo que CAP no dice: qué pasa cuando no hay partición.',
      idea: `Si hay <b>P</b>artición: <b>A</b> o <b>C</b>. <b>E</b>lse (sin partición): <b>L</b>atencia o <b>C</b>onsistencia.`,
      texto: `<p>Abadi (2012) notó que CAP solo habla del caso con partición. Pero incluso con la red sana hay un trade-off: esperar a que todas las réplicas confirmen (consistente pero lento) o responder de inmediato (rápido pero quizás desactualizado).</p>
<p>Moraleja: no hay una solución única; cada sistema elige según lo que más le importa.</p>`
    },
    {
      id: 'overhead', titulo: 'Overhead', resumen: 'El costo extra de coordinarse.',
      idea: `<b>Overhead</b> = instrucciones o tiempo adicional que acompañan a cada operación para tareas de gestión, no para el trabajo útil.`,
      texto: `<p>La analogía del profesor: llegar a clase implica vestirse y viajar antes; eso es overhead. En un sistema distribuido son los mensajes de confirmación, los heartbeats, los timestamps, los votos.</p>
<p>¿Puede ser mayor que la transacción misma? <b>Sí</b>. Depende del sistema y del <b>nivel de consistencia</b> exigido: mientras más fuerte, más mensajes de coordinación.</p>`
    }
  ]
});

/* =====================================================================
   TIEMPO Y ORDEN: LAMPORT Y VECTOR CLOCKS
   ===================================================================== */
teoria.push({
  id: 'tiempo', unidad: 'Unidad 2', titulo: 'Tiempo y orden de eventos',
  resumen: 'Sin reloj global, ¿qué pasó primero? Happened-before, Lamport, vector clocks, exclusión mutua y snapshots.',
  intro: `En un sistema distribuido cada nodo tiene su propio reloj y ninguno es confiable para comparar con los otros. Por eso, en vez de la <b>hora</b>, se razona sobre el <b>orden</b>: qué evento pudo influir en cuál. Los relojes lógicos (Lamport y vectoriales) son contadores que capturan ese orden.`,
  sub: [
    {
      id: 'sin-reloj', titulo: 'No hay reloj global', resumen: 'Clock drift y por qué importa el orden y no la hora.',
      idea: `Cada nodo tiene su <b>propio reloj físico</b>, y no avanzan igual. No se puede confiar en la hora para saber qué pasó antes.`,
      texto: `<p>Los relojes de cuarzo varían con la temperatura y la fabricación: es el <b>clock drift</b>, típicamente alrededor de 1 segundo cada 11–12 días. Dos nodos pueden marcar horas distintas para el mismo instante.</p>
<p>Lo que sí podemos saber con certeza es el <b>orden causal</b>: si un evento pudo influir en otro (por ejemplo, porque le mandó un mensaje). Los relojes lógicos numeran los eventos respetando ese orden, sin usar la hora.</p>`
    },
    {
      id: 'happened-before', titulo: 'Happened-before (→)', resumen: 'Las 3 reglas para saber si un evento ocurrió antes que otro.',
      idea: `A → B ("A ocurrió antes que B") si A pudo <b>influir</b> en B. Si ninguno pudo influir en el otro, son <b>concurrentes</b> (A ∥ B).`,
      texto: `<p>A → B cuando se cumple alguna de estas reglas:</p>
<ol><li><b>Mismo proceso:</b> A y B ocurren en el mismo proceso y A va primero.</li>
<li><b>Mensaje:</b> A es el envío de un mensaje y B su recepción.</li>
<li><b>Transitividad:</b> si A → B y B → C, entonces A → C.</li></ol>
<p>Si no se puede armar una cadena de flechas de A a B ni de B a A, son <b>concurrentes</b>: ocurrieron "a la vez" en el sentido de que ninguno supo del otro.</p>`,
      ejemplo: `P1 envía un mensaje a P2 (evento a), y P2 lo recibe (evento b): a → b. Si P3 hace un evento local c sin comunicarse con nadie, entonces c ∥ a y c ∥ b.`,
      ejercicios: ['L02']
    },
    {
      id: 'lamport', titulo: 'Relojes de Lamport', resumen: 'Un contador por proceso y la regla max(L, T) + 1.',
      idea: `Cada proceso tiene un contador L. Suma 1 en cada evento, y al recibir un mensaje salta a <b>max(L, T) + 1</b> para quedar por delante del emisor.`,
      pasos: [`L parte en 0.`, `<b>Evento local:</b> L = L + 1.`, `<b>Envío:</b> L = L + 1 y el mensaje lleva el valor de L.`, `<b>Recepción</b> de un mensaje con timestamp T: <b>L = max(L, T) + 1</b>.`],
      texto: `<p>¿Por qué max y no simplemente T + 1? Porque el reloj local puede ir más adelante que T. Con T + 1 el reloj <b>retrocedería</b>, y se rompería la garantía. El max asegura que el receptor quede por delante de su propio pasado <b>y</b> del emisor.</p>
<p><b>Qué garantiza:</b> si A → B, entonces C(A) &lt; C(B).<br><b>Qué NO garantiza:</b> que C(A) &lt; C(B) implique A → B. Dos eventos concurrentes pueden tener cualquier par de números. Lamport <b>no detecta concurrencia</b>.</p>`,
      codigo: `void lamport_recibir(Node *n, int ts) {
    if (ts > n->clock) {
        n->clock = ts;
    }
    n->clock = n->clock + 1;      /* max(L, T) + 1 */
}`,
      ejercicios: ['L01', 'L06']
    },
    {
      id: 'orden-total', titulo: 'Orden total (C, PID)', resumen: 'Cómo ordenar todos los eventos sin empates.',
      idea: `Se ordena por timestamp de Lamport y, si empatan, por <b>PID</b> menor. Así todos los nodos obtienen <b>el mismo orden</b>.`,
      texto: `<p>Lamport solo da un orden parcial: dos eventos pueden tener el mismo número. Para tener un orden <b>total</b> (todos comparables) se usa el par <b>(C, PID)</b>: primero el menor C; si empatan, el menor PID.</p>
<p>Si dos eventos tienen el <b>mismo C</b>, no pueden estar relacionados causalmente (A → B exige C(A) &lt; C(B)), así que son concurrentes y desempatar por PID no rompe nada.</p>
<p>Uso: el chat distribuido. El servidor ordena los mensajes por (C, PID) y todos los clientes ven el <b>mismo orden</b>, reproducible para depurar.</p>`,
      ejercicios: ['L03', 'L07']
    },
    {
      id: 'vector', titulo: 'Vector clocks', resumen: 'Un vector con lo que cada proceso sabe de los demás.',
      idea: `Cada proceso guarda un <b>vector</b> con un contador por proceso: V[i] cuenta sus propios eventos, y V[j] cuántos eventos de j conoce.`,
      pasos: [`V parte en [0, 0, …, 0].`, `<b>Evento local:</b> V[i] = V[i] + 1.`, `<b>Envío:</b> V[i] = V[i] + 1 y el mensaje lleva el vector completo.`, `<b>Recepción</b> de un vector W: V[i] = V[i] + 1 y, para cada j ≠ i, <b>V[j] = max(V[j], W[j])</b>.`],
      texto: `<p><b>Comparar dos vectores:</b> V1 ≤ V2 si cada componente de V1 es ≤ la de V2. V1 &lt; V2 si además son distintos. Si V1 tiene alguna componente mayor y V2 también tiene alguna mayor, son <b>concurrentes</b>.</p>
<p><b>Garantía en ambos sentidos:</b> A → B si y solo si V(A) &lt; V(B). A diferencia de Lamport, <b>sí detecta concurrencia</b>.</p>`,
      ejemplo: `P2 tiene [2, 2, 0] y recibe un mensaje de P3 con [0, 0, 2]. Primero suma 1 a su propia casilla: [2, 3, 0]. Luego toma el máximo casilla por casilla con [0, 0, 2]: <b>[2, 3, 2]</b>. Ahora P2 sabe de 2 eventos de P1, 3 propios y 2 de P3.<br>
Comparar [2, 1, 0] con [1, 2, 0]: la primera casilla es mayor en el primero y la segunda en el segundo → <b>concurrentes</b>.`,
      ejercicios: ['L10']
    },
    {
      id: 'lamport-vs-vector', titulo: 'Lamport vs vector clocks', comparacion: true, resumen: 'Cuándo basta un número y cuándo hace falta un vector.',
      idea: `<b>Lamport</b>: un número, barato, da un orden total pero no detecta concurrencia. <b>Vector</b>: N números, más caro, detecta causalidad y concurrencia.`,
      tabla: { cols: ['', 'Lamport', 'Vector clocks'],
        filas: [['Qué guarda cada proceso', 'Un entero', 'Un vector de N enteros'], ['Recepción', 'L = max(L, T) + 1', 'V[i]++ y V[j] = max(V[j], W[j])'], ['A → B implica…', 'C(A) &lt; C(B)', 'V(A) &lt; V(B)'], ['¿El inverso se cumple?', 'No', 'Sí'], ['¿Detecta concurrencia?', 'No', 'Sí'], ['Costo por mensaje', '1 número', 'N números'], ['Uso típico', 'Orden total de logs, chat', 'Detectar conflictos: Git, DynamoDB, CRDTs']] },
      recuerda: `Pregunta típica: "¿por qué no basta Lamport para detectar conflictos?" → porque C(A) &lt; C(B) no dice si A causó B o si fueron concurrentes.`
    },
    {
      id: 'exclusion', titulo: 'Exclusión mutua de Lamport', resumen: 'Turnarse un recurso compartido sin servidor central.',
      idea: `Para usar el recurso, un proceso pide permiso a todos con <b>REQUEST(ts, pid)</b>. Entra cuando todos le respondieron y su pedido es el <b>más antiguo</b> según (ts, pid).`,
      pasos: [`<b>Pedir:</b> enviar REQUEST(ts, pid) a todos y guardarlo en la cola propia.`, `<b>Al recibir un REQUEST:</b> guardarlo en la cola y responder REPLY.`, `<b>Entrar:</b> solo con REPLY de todos y siendo el REQUEST de menor (ts, pid) de la cola.`, `<b>Salir:</b> enviar RELEASE a todos, que borran ese pedido de su cola.`],
      texto: `<p>El desempate por PID es necesario: al inicio todos piden con ts = 1, y sin desempate los tres entrarían a la vez.</p>
<p>Si un proceso se cae antes de enviar RELEASE, su pedido queda en las colas y <b>nadie más puede entrar</b>. Con pipes se detecta porque <code>read()</code> retorna 0 (EOF).</p>`,
      ejercicios: ['L11']
    },
    {
      id: 'snapshot', titulo: 'Snapshot de Chandy-Lamport', resumen: 'Fotografiar el estado global sin detener el sistema.',
      idea: `Un proceso registra su estado y envía <b>MARKER</b> por todos sus canales. Cada uno, al recibir su primer MARKER, registra su estado y lo reenvía. Lo que llega entre medio está <b>en tránsito</b>.`,
      texto: `<p>Sirve para obtener un <b>corte consistente</b>: un estado global que pudo haber existido, aunque no se tomó en un instante exacto. Necesita canales <b>FIFO</b> (las pipes y TCP lo son).</p>
<p>¿Por qué capturar los mensajes en tránsito? Si P0 envía 10 a P1 y luego toma su snapshot (90), y P1 toma el suyo antes de recibirlos (100), la suma da 290: se "perdieron" 10 que estaban en la pipe. Contarlos como en tránsito devuelve 300.</p>`,
      ejercicios: ['L13']
    }
  ]
});

/* =====================================================================
   COMUNICACIÓN ENTRE PROCESOS (UNIDAD 1)
   ===================================================================== */
teoria.push({
  id: 'ipc', unidad: 'Unidad 1', titulo: 'Comunicación entre procesos',
  resumen: 'Pipes y fork, sockets TCP y RPC: las piezas con que se construye todo lo demás.',
  intro: `Antes de los algoritmos distribuidos, los procesos tienen que poder hablar. En la Unidad 1 se vieron tres mecanismos de menor a mayor alcance: <b>pipes</b> (procesos de la misma máquina), <b>sockets</b> (procesos en máquinas distintas) y <b>RPC</b> (llamar funciones remotas como si fueran locales).`,
  sub: [
    {
      id: 'fork', titulo: 'fork()', resumen: 'Crear un proceso hijo que es una copia del padre.',
      idea: `<code>fork()</code> crea un proceso <b>hijo</b> que es una copia del padre. Retorna <b>0 en el hijo</b> y el <b>PID del hijo</b> en el padre.`,
      texto: `<ul><li>Retorna 0 en el hijo, el PID del hijo en el padre y −1 si hay error. Con un <code>if</code> sobre el retorno, cada proceso sabe qué hacer.</li>
<li>El hijo recibe una <b>copia</b> de la memoria: después del fork las variables <b>no se comparten</b>.</li>
<li>Sí hereda los <b>descriptores abiertos</b>: pipes y sockets quedan compartidos.</li>
<li>También copia el buffer de printf sin vaciar: usa <code>fflush(stdout)</code> antes del fork para no imprimir dos veces.</li></ul>
<p><b>Zombi:</b> un hijo que terminó pero cuyo padre no leyó su estado con <code>wait()</code>. En un servidor se evita con <code>signal(SIGCHLD, SIG_IGN)</code> o <code>waitpid(-1, NULL, WNOHANG)</code>.</p>`,
      codigo: `pid_t pid = fork();
if (pid == 0) {
    /* código del hijo */
    exit(0);
}
/* código del padre */
wait(NULL);`,
      ejercicios: ['P1']
    },
    {
      id: 'pipes', titulo: 'Pipes', resumen: 'Un canal de una sola dirección entre procesos emparentados.',
      idea: `Un pipe es un canal <b>unidireccional</b>: <b>fd[0] lee</b> y <b>fd[1] escribe</b>. Se crea <b>antes</b> del fork para que padre e hijo lo hereden.`,
      texto: `<p>Truco para recordar: 0 como stdin (entrada, leer) y 1 como stdout (salida, escribir).</p>
<p><b>Cerrar los extremos que no se usan</b> es obligatorio: <code>read()</code> solo retorna 0 (fin) cuando <b>todos</b> los extremos de escritura están cerrados. Si el lector deja abierta su copia de fd[1], nunca recibe el fin y se bloquea para siempre.</p>
<p>Para comunicación en los dos sentidos se necesitan <b>dos pipes</b>. Con N procesos todos con todos: N·(N−1) pipes.</p>`,
      codigo: `int fd[2];
pipe(fd);
if (fork() == 0) {
    close(fd[1]);             /* el hijo solo lee */
    read(fd[0], buf, sizeof(buf));
    exit(0);
}
close(fd[0]);                 /* el padre solo escribe */
write(fd[1], "hola", 5);
close(fd[1]);`,
      ejercicios: ['P2', 'P3']
    },
    {
      id: 'select', titulo: 'select()', resumen: 'Esperar a varios descriptores a la vez.',
      idea: `<code>select()</code> espera hasta que <b>alguno</b> de varios descriptores tenga algo para leer, sin quedarse bloqueado en uno solo.`,
      pasos: [`<code>FD_ZERO(&amp;rd)</code> para vaciar el conjunto.`, `<code>FD_SET(fd, &amp;rd)</code> por cada descriptor a vigilar.`, `<code>select(maxfd + 1, &amp;rd, NULL, NULL, timeout)</code>.`, `<code>FD_ISSET(fd, &amp;rd)</code> para ver cuál está listo y leerlo.`],
      ojo: [`Hay que <b>reconstruir</b> el conjunto en cada vuelta del loop, porque select lo modifica.`, `El primer argumento es el descriptor mayor <b>+ 1</b>.`]
    },
    {
      id: 'sockets', titulo: 'Sockets TCP', resumen: 'Las llamadas del servidor y del cliente, en orden.',
      idea: `Servidor: <b>socket → bind → listen → accept</b>. Cliente: <b>socket → connect</b>. Después ambos usan send/recv y close.`,
      tabla: { cols: ['Paso', 'Servidor', 'Cliente'],
        filas: [['1', '<code>socket()</code>: crear el socket', '<code>socket()</code>'], ['2', '<code>setsockopt(SO_REUSEADDR)</code> (opcional)', '—'], ['3', '<code>bind()</code>: asociar IP y puerto', '—'], ['4', '<code>listen()</code>: empezar a escuchar', '—'], ['5', '<code>accept()</code>: retorna un <b>nuevo</b> fd por cliente', '<code>connect()</code>: conectarse al servidor'], ['6', '<code>recv()</code> / <code>send()</code>', '<code>send()</code> / <code>recv()</code>'], ['7', '<code>close()</code>', '<code>close()</code>']] },
      texto: `<ul><li><b>htons:</b> convierte el puerto al orden de bytes de red. Olvidarlo hace que te conectes a otro puerto.</li>
<li><b>inet_pton:</b> convierte una IP en texto ("127.0.0.1") a binario.</li>
<li><b>recv</b> retorna &gt;0 bytes leídos, 0 si el otro lado cerró y −1 si hubo error. <b>No agrega '\\0'</b>: hay que hacer <code>buf[n] = '\\0'</code>.</li>
<li>TCP es un <b>flujo</b>: un recv puede traer medio mensaje o varios juntos.</li></ul>
<p><b>Servidor concurrente con fork:</b> el hijo cierra el socket de escucha (no acepta clientes) y el padre cierra el socket del cliente (no habla con él).</p>`,
      ejercicios: ['S1', 'S2', 'C01A']
    },
    {
      id: 'rpc', titulo: 'RPC', resumen: 'Llamar una función que se ejecuta en otra máquina.',
      idea: `<b>Remote Procedure Call</b>: llamar a una función remota como si fuera local. El <b>stub</b> (cliente) empaqueta y envía; el <b>skeleton</b> (servidor) desempaqueta, llama y responde.`,
      texto: `<p>Protocolo del curso: el cliente envía <code>CALL f args</code> y el servidor responde <code>RESULT valor</code>.</p>
<ul><li><b>Stub (cliente):</b> serializa los argumentos, envía, espera y deserializa el resultado.</li>
<li><b>Skeleton (servidor):</b> recibe, parsea, llama a la función real y responde.</li>
<li><b>Dispatch table:</b> un arreglo de structs <code>{nombre, puntero a función}</code>. El servidor busca el nombre recibido y llama a la función. Agregar una función remota es agregar una fila.</li></ul>
<p><b>flock:</b> como con fork las variables no se comparten, el estado común va a un archivo. <code>LOCK_SH</code> permite varios lectores; <code>LOCK_EX</code> un solo escritor. Leer, modificar y escribir bajo el mismo LOCK_EX evita perder actualizaciones.</p>`,
      ejercicios: ['R1', 'R2', 'R3']
    },
    {
      id: 'comparacion-ipc', titulo: 'Pipes vs sockets vs RPC', comparacion: true, resumen: 'Qué mecanismo usar según dónde están los procesos.',
      idea: `<b>Pipe</b>: misma máquina, procesos emparentados. <b>Socket</b>: cualquier máquina. <b>RPC</b>: sobre sockets, pero se usa como una llamada a función.`,
      tabla: { cols: ['', 'Pipe', 'Socket TCP', 'RPC'],
        filas: [['Alcance', 'Misma máquina, padre e hijos', 'Máquinas distintas por red', 'Máquinas distintas por red'], ['Dirección', 'Una (dos pipes para ida y vuelta)', 'Dos sentidos', 'Pregunta y respuesta'], ['Nivel', 'Bajo: bytes', 'Bajo: flujo de bytes', 'Alto: llamadas a funciones'], ['Se crea con', '<code>pipe()</code> antes de <code>fork()</code>', '<code>socket</code>, <code>bind</code>, <code>listen</code>, <code>accept</code> / <code>connect</code>', 'Stub y skeleton sobre un socket'], ['Uso en el curso', 'Hijos que reportan al padre', 'Servidor SELENE, relay', 'Registro de naves, dispatch table']] },
      ejercicios: ['I1', 'I2', 'I3']
    }
  ]
});
