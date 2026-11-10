/* Extras de la Unidad 2: quórum, KV con quórum, 2PC, heartbeats y Raft */
ejercicios.push(
{
 "id": "X1",
 "group": "extra",
 "n": "Extra 1",
 "topic": "fallos",
 "lvl": 1,
 "min": 6,
 "title": "Quórum y split-brain",
 "statement": "<p>Un clúster usa <b>quórum = mayoría</b> para evitar split-brain. Implementa:</p>\n <ul><li><code>bool has_quorum(int alive, int cluster_size)</code></li>\n <li><code>int max_failures(int cluster_size)</code>: cuántos nodos pueden caer y aún haber quórum.</li>\n <li><code>int side_with_quorum(int size_a, int size_b)</code>: ante una partición en dos lados, retorna 0 si opera A, 1 si opera B, -1 si ninguno.</li></ul>",
 "files": [
  "X1/quorum.c"
 ],
 "out": "1\n2\n0\n-1",
 "hints": [
  "Quórum = (N/2) + 1 con división entera.",
  "Máximo de fallos = N menos el quórum.",
  "En la partición, el total es la suma de los dos lados y cada lado se compara contra ese total, no contra su propio tamaño."
 ],
 "think": [
  "N=5 → quórum 3. Con 3 vivos opera; con 2, no.",
  "Fallos tolerados con N=5: 5−3 = 2.",
  "Partición 3|2: A tiene 3 ≥ 3, opera. Partición 2|2 con N=4: quórum 3, nadie lo alcanza → ninguno opera (por eso se prefieren números impares).",
  "Reutiliza has_quorum en side_with_quorum en vez de repetir la fórmula."
 ],
 "errors": [
  "Usar alive > N/2 con N par (da resultados sutilmente distintos); usa la fórmula N/2+1.",
  "Comparar cada lado contra su propio tamaño en vez del total."
 ],
 "rubric": [
  {
   "pts": 3,
   "t": "has_quorum correcto"
  },
  {
   "pts": 3,
   "t": "max_failures correcto"
  },
  {
   "pts": 3,
   "t": "side_with_quorum usa el total y cubre los tres casos"
  },
  {
   "pts": 1,
   "t": "Salida predicha: 1, 2, 0, -1"
  }
 ]
},
{
 "id": "X2",
 "group": "extra",
 "n": "Extra 2",
 "topic": "consistencia",
 "lvl": 2,
 "min": 12,
 "title": "Escritura y lectura con quórum",
 "statement": "<p>Un KV store tiene 3 réplicas (<code>NREP</code>) y usa quórum con <code>W=2</code> y <code>R=2</code>. Implementa:</p>\n <ul><li><code>bool put_quorum(const char *key, const char *value)</code>: escribe en réplicas hasta lograr W acks.</li>\n <li><code>bool get_quorum(const char *key, KVPair *result)</code>: lee de R réplicas alcanzables y devuelve el valor con mayor <code>version</code>.</li></ul>\n <p>Pregunta: ¿por qué con W=2, R=2, N=3 una lectura siempre ve la última escritura?</p>",
 "files": [
  "X2/kv_quorum.c"
 ],
 "hints": [
  "put: cuenta acks y corta apenas llegas a W. get: cuenta lecturas exitosas y compara versiones.",
  "En get, una réplica caída (read_from_replica = false) no cuenta: usa continue.",
  "Si al terminar el for count < R, no hubo quórum de lectura → false."
 ],
 "think": [
  "put_quorum: for sobre las réplicas, acumulando acks; return true al alcanzar W; si el for termina, false.",
  "get_quorum: guarda el mejor candidato por version. La primera lectura exitosa inicializa latest (count == 0).",
  "Teoría: W + R > N (2+2 > 3). Todo conjunto de 2 réplicas se solapa con cualquier otro de 2 → al menos una réplica leída tiene la última escritura, y la version la identifica."
 ],
 "errors": [
  "Contar acks de réplicas caídas.",
  "No distinguir \"réplica caída\" de \"valor vacío\".",
  "Devolver el primer valor leído sin comparar versiones."
 ],
 "rubric": [
  {
   "pts": 2,
   "t": "put: recorre réplicas y cuenta acks"
  },
  {
   "pts": 2,
   "t": "put: retorna true al llegar a W y false si no"
  },
  {
   "pts": 3,
   "t": "get: ignora réplicas que no responden"
  },
  {
   "pts": 3,
   "t": "get: se queda con la mayor version"
  },
  {
   "pts": 2,
   "t": "get: verifica count >= R antes de entregar"
  },
  {
   "pts": 2,
   "t": "Explica W + R > N (intersección de quórums)"
  }
 ]
},
{
 "id": "X3",
 "group": "extra",
 "n": "Extra 3",
 "topic": "cap",
 "lvl": 2,
 "min": 10,
 "title": "Coordinador de Two-Phase Commit",
 "statement": "<p>Implementa el coordinador de <b>2PC</b>: <code>bool two_phase_commit(const char *key, const char *value)</code>.</p>\n <p><b>Fase 1 (PREPARE):</b> pregunta a todas las réplicas. <b>Fase 2:</b> si todas votaron YES, ordena COMMIT; si no, ABORT. Retorna si se confirmó.</p>\n <p>Pregunta: ¿qué pasa si una réplica no responde en la fase 1? ¿Por qué 2PC sacrifica disponibilidad?</p>",
 "files": [
  "X3/two_phase_commit.c"
 ],
 "hints": [
  "Dos bucles de red: uno para preguntar (prepare) y otro para ejecutar la decisión.",
  "COMMIT solo si votes_yes == N_REPLICAS (unanimidad, no mayoría).",
  "Si no hay unanimidad, el camino es ABORT a todas."
 ],
 "think": [
  "Cuenta los YES en la fase 1.",
  "Decisión: todos YES → commit a todas y true. Cualquier otro caso → abort a todas y false.",
  "Teoría: si una réplica no responde, se cuenta como NO (o el coordinador queda esperando) y se aborta. 2PC exige unanimidad: una sola réplica caída bloquea o aborta toda escritura → elige consistencia sobre disponibilidad (CP)."
 ],
 "errors": [
  "Usar mayoría en vez de unanimidad.",
  "Enviar commit solo a quienes votaron YES.",
  "Olvidar el abort a las réplicas cuando falla."
 ],
 "rubric": [
  {
   "pts": 3,
   "t": "Fase 1 envía prepare a todas y cuenta YES"
  },
  {
   "pts": 3,
   "t": "Commit solo con unanimidad"
  },
  {
   "pts": 2,
   "t": "Abort a todas en caso contrario"
  },
  {
   "pts": 1,
   "t": "Retorna true/false según corresponda"
  },
  {
   "pts": 3,
   "t": "Explica por qué 2PC sacrifica disponibilidad"
  }
 ]
},
{
 "id": "X4",
 "group": "extra",
 "n": "Extra 4",
 "topic": "fallos",
 "lvl": 2,
 "min": 12,
 "title": "Monitor de heartbeats",
 "statement": "<p>Cada nodo envía heartbeats. Implementa en el monitor:</p>\n <ul><li><code>void on_heartbeat(int node_id)</code>: registra el instante y, si el nodo estaba marcado como caído, lo revive avisando a <code>handle_node_recovery</code>.</li>\n <li><code>void check_nodes(int num_nodes)</code>: marca como caído a todo nodo vivo que lleve más de <code>TIMEOUT</code> segundos sin heartbeat, imprime <code>Node %d detected as DOWN (timeout: %ds)</code> y llama a <code>handle_node_failure</code>.</li></ul>\n <p>Pregunta: ¿qué problema trae un timeout muy corto? ¿y uno muy largo?</p>",
 "files": [
  "X4/heartbeats.c"
 ],
 "hints": [
  "on_heartbeat siempre actualiza last_heartbeat; la recuperación es un extra condicional.",
  "check_nodes: calcula cuánto silencio lleva cada nodo restando tiempos con time().",
  "Evita avisar de la caída varias veces: solo si is_alive es true y recién ahí lo pones en false."
 ],
 "think": [
  "Heartbeat recibido → la hora actual es el nuevo last_heartbeat. Si estaba caído, revive.",
  "En el monitor: now − last_heartbeat es el silencio. Si supera TIMEOUT y el nodo figuraba vivo → falla detectada una sola vez.",
  "Teoría: timeout corto = detección rápida pero falsos positivos (un nodo lento parece muerto). Timeout largo = pocos falsos positivos pero detección tardía. No se puede distinguir nodo caído, lento o red particionada."
 ],
 "errors": [
  "Marcar caído sin comprobar is_alive (spam de alertas).",
  "Olvidar actualizar last_heartbeat al revivir.",
  "Usar >= en vez de > cuando el enunciado dice \"más de\"."
 ],
 "rubric": [
  {
   "pts": 2,
   "t": "on_heartbeat actualiza last_heartbeat"
  },
  {
   "pts": 3,
   "t": "on_heartbeat detecta y gestiona la recuperación"
  },
  {
   "pts": 2,
   "t": "check_nodes calcula el silencio"
  },
  {
   "pts": 3,
   "t": "check_nodes evita notificar dos veces (is_alive)"
  },
  {
   "pts": 2,
   "t": "Marca caído, imprime y llama a handle_node_failure"
  },
  {
   "pts": 2,
   "t": "Trade-off de timeouts explicado"
  }
 ]
},
{
 "id": "X5",
 "group": "extra",
 "n": "Extra 5",
 "topic": "raft",
 "lvl": 3,
 "min": 15,
 "title": "Raft: otorgar o negar un voto",
 "statement": "<p>Implementa <code>bool on_request_vote(RaftNode *n, const RequestVoteArgs *args)</code> con las reglas de Raft:</p>\n <ol><li>Si el term del candidato es menor al actual, rechaza.</li><li>Si el term es mayor, el nodo actualiza su term, olvida su voto y pasa a FOLLOWER.</li>\n <li>Solo un voto por term: rechaza si ya votó por otro.</li><li>El log del candidato debe estar al menos tan actualizado (compara último term; si empatan, último índice).</li></ol>\n <p>Si concede el voto, registra <code>voted_for</code>.</p>",
 "files": [
  "X5/raft_voto.c"
 ],
 "hints": [
  "Ordena las reglas como filtros: cada if descarta un caso y retorna false.",
  "Cuando el term del candidato es mayor, primero actualizas tu estado y recién después evalúas el resto.",
  "\"Log más actualizado\": primero gana el mayor último term; si hay empate de term, gana el mayor índice."
 ],
 "think": [
  "Regla 1: term menor → false inmediato.",
  "Regla 2: term mayor → te actualizas (current_term, voted_for = -1, FOLLOWER) y sigues evaluando.",
  "Regla 3: voto único por term; si ya votaste por el mismo candidato sigue siendo válido (reintentos).",
  "Regla 4: compara logs. Esto garantiza Leader Completeness: un candidato con log desactualizado no puede ganar.",
  "Si todo pasa: voted_for = candidate_id y true."
 ],
 "errors": [
  "Comparar solo last_log_index ignorando el term.",
  "No resetear voted_for al ver un term mayor (quedas \"ya votó\" en un term nuevo).",
  "Rechazar al mismo candidato que reintenta."
 ],
 "rubric": [
  {
   "pts": 2,
   "t": "Rechaza si args->term < current_term"
  },
  {
   "pts": 3,
   "t": "Actualiza term, voted_for y estado ante term mayor"
  },
  {
   "pts": 3,
   "t": "Un voto por term (acepta reintento del mismo candidato)"
  },
  {
   "pts": 4,
   "t": "Compara último term y desempata por índice"
  },
  {
   "pts": 2,
   "t": "Registra voted_for y retorna true"
  },
  {
   "pts": 2,
   "t": "Orden lógico de las reglas"
  }
 ]
},
{
 "id": "X6",
 "group": "extra",
 "n": "Extra 6",
 "topic": "raft",
 "lvl": 3,
 "min": 15,
 "title": "Raft: consistency check de AppendEntries",
 "statement": "<p>El log de Raft usa índices desde 1; <code>log[0]</code> es un centinela con term 0. Implementa:</p>\n <ul><li><code>bool log_matches(const RaftNode *n, int prev_log_index, int prev_log_term)</code></li>\n <li><code>bool on_append_entries(RaftNode *n, const AppendEntriesArgs *args)</code>: rechaza si el term del líder es viejo o si el log no coincide; si coincide, escribe las entradas desde <code>prev_log_index + 1</code> (sobrescribiendo lo que haya) y avanza el <code>commit_index</code> sin pasarse de su último índice.</li></ul>\n <p>(Versión simplificada del curso.) Pregunta: ¿qué dice la Log Matching Property?</p>",
 "files": [
  "X6/raft_append.c"
 ],
 "hints": [
  "log_matches responde: ¿tengo esa entrada previa y su term es el que dice el líder?",
  "Primero comprueba que el índice exista (no pases el último índice) y recién después mira log[idx].term.",
  "commit_index = min(leader_commit, último índice propio)."
 ],
 "think": [
  "Consistency check: si no tengo la entrada prev_log_index, o su term difiere, rechazo (el líder retrocederá y reintentará).",
  "Con el centinela, prev_log_index = 0 siempre coincide (term 0 = 0).",
  "Al aceptar, las entradas nuevas se escriben desde prev_log_index+1; lo conflictivo se sobrescribe.",
  "Log Matching: si dos logs tienen una entrada con el mismo índice y term, entonces tienen el mismo comando y todas las entradas anteriores son idénticas."
 ],
 "errors": [
  "Leer log[prev_log_index] antes de comprobar que existe.",
  "Usar max en vez de min para el commit_index.",
  "Escribir las entradas desde prev_log_index en vez de prev_log_index + 1."
 ],
 "rubric": [
  {
   "pts": 3,
   "t": "log_matches comprueba existencia del índice"
  },
  {
   "pts": 2,
   "t": "log_matches compara el term"
  },
  {
   "pts": 2,
   "t": "Rechaza term viejo y actualiza current_term"
  },
  {
   "pts": 3,
   "t": "Rechaza si no hay coincidencia"
  },
  {
   "pts": 3,
   "t": "Escribe entradas desde prev_log_index+1 y actualiza last_log_index"
  },
  {
   "pts": 1,
   "t": "commit_index = min(leader_commit, último índice)"
  },
  {
   "pts": 2,
   "t": "Enuncia la Log Matching Property"
  }
 ]
},
{
 "id": "X7",
 "group": "extra",
 "n": "Extra 7",
 "topic": "raft",
 "lvl": 3,
 "min": 12,
 "title": "Raft: iniciar y ganar una elección",
 "statement": "<p>Implementa los dos pasos de una elección en el candidato:</p>\n <ul><li><code>void on_election_timeout(RaftNode *n)</code>: incrementa el term, se vuelve CANDIDATE, vota por sí mismo, reinicia su timeout y pide votos a todos los demás.</li>\n <li><code>void on_request_vote_reply(RaftNode *n, const RequestVoteReply *r)</code>: si sigue siendo candidato y obtiene <b>mayoría</b> de votos, se convierte en LEADER y envía heartbeats.</li></ul>\n <p>Pregunta: ¿por qué los timeouts de elección son aleatorios?</p>",
 "files": [
  "X7/raft_eleccion.c"
 ],
 "hints": [
  "Los 5 pasos de la elección están en orden en el enunciado: term, estado, voto propio, timeout, pedir votos.",
  "No te pidas el voto a ti mismo: ya votaste (votes_received empieza en 1).",
  "Mayoría estricta: votos > CLUSTER_SIZE / 2."
 ],
 "think": [
  "Timeout: term++ → CANDIDATE → votas por ti (voted_for = id, votes = 1) → reinicias timer → RequestVote a los demás.",
  "Respuesta: si ya no eres candidato (otro líder apareció) ignora. Si te dan el voto, suma. Con mayoría pasas a LEADER y mandas heartbeats de inmediato para imponer autoridad.",
  "Timeouts aleatorios (ej. 150-300 ms): reducen la probabilidad de que dos followers se vuelvan candidatos a la vez y repitan el split vote para siempre."
 ],
 "errors": [
  "Empezar votes_received en 0 (olvidar el voto propio).",
  "Usar >= CLUSTER_SIZE / 2 (con 5 nodos 2 votos no es mayoría).",
  "Enviar RequestVote a sí mismo."
 ],
 "rubric": [
  {
   "pts": 3,
   "t": "Incrementa term y pasa a CANDIDATE"
  },
  {
   "pts": 2,
   "t": "Vota por sí mismo (votes_received = 1)"
  },
  {
   "pts": 2,
   "t": "Pide votos a todos los demás"
  },
  {
   "pts": 2,
   "t": "Ignora respuestas si ya no es candidato"
  },
  {
   "pts": 3,
   "t": "Mayoría estricta y paso a LEADER con heartbeats"
  },
  {
   "pts": 2,
   "t": "Explica la aleatoriedad del timeout"
  }
 ]
}
);
