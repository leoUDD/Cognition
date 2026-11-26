/* Banco de preguntas del examen final (50 preguntas: selección múltiple, verdadero o falso y desarrollo).
   Mitad línea jurídica, mitad taller práctico, igual que los certámenes.
   Selección múltiple: la PRIMERA alternativa es la correcta (se barajan al mostrar).
   V/F: un enunciado es verdadero solo si TODO lo que afirma lo es.
   Desarrollo: se autoevalúa marcando las ideas clave que cubriste. */
Object.assign(examen, {
  titulo: 'Examen final', preguntas: 50, minutos: 120, exigencia: 0.6, meta: 0.7,
  indicaciones: '<b>Indicaciones del examen:</b> lee cada pregunta completa antes de responder. En selección múltiple, elige la alternativa <b>más correcta</b>. En verdadero o falso, un enunciado es verdadero <b>solo si todo lo que afirma lo es</b>. En desarrollo, responde de forma clara y fundamentada y, cuando corresponda, relaciona el concepto con un ejemplo o con tu proyecto.',
  secciones: [
    { id: 'ley19628', titulo: 'Ley 19.628', peso: 12, teoria: 'ley19628', tema: 'ley19628' },
    { id: 'ley21719', titulo: 'Ley 21.719', peso: 13, teoria: 'ley21719', tema: 'ley21719' },
    { id: 'fundamentos', titulo: 'Fundamentos de seguridad', peso: 4, teoria: 'fundamentos', tema: 'fundamentos' },
    { id: 'cifrado', titulo: 'Cifrado, hashing y tokenización', peso: 6, teoria: 'cifrado', tema: 'cifrado' },
    { id: 'privacidad', titulo: 'Privacidad desde el diseño y acceso', peso: 5, teoria: 'privacidad', tema: 'privacidad' },
    { id: 'derechos', titulo: 'Consentimiento y derechos', peso: 5, teoria: 'derechos', tema: 'derechos' },
    { id: 'incidentes', titulo: 'Trazabilidad e incidentes', peso: 4, teoria: 'incidentes', tema: 'incidentes' },
    { id: 'proyecto', titulo: 'Proyecto integrador', peso: 1, teoria: 'proyecto' }
  ]
});
const Q = (sec, id, q, ops, exp) => preguntas.push({ sec, id, q, ops, exp });
const VF = (sec, id, q, v, exp) => preguntas.push({ sec, id, q, tipo: 'vf', ops: v ? ['Verdadero', 'Falso'] : ['Falso', 'Verdadero'], exp });
const DEV = (sec, id, q, modelo, claves) => preguntas.push({ sec, id, q, tipo: 'dev', modelo, claves });

/* =================== LEY 19.628 =================== */
Q('ley19628', 'a01', 'Según la Ley 19.628, ¿cuándo se pueden tratar datos personales?',
  ['Cuando la ley lo autoriza o el titular consiente expresamente', 'Siempre que el responsable los mantenga en secreto', 'Solo cuando el titular es mayor de edad y chileno', 'Cuando los datos están en una base de datos automatizada y registrada'],
  'Art. 4: el tratamiento solo procede cuando <b>la ley lo autoriza</b> o el <b>titular consiente expresamente</b>. El secreto es una obligación adicional, no una base para tratar.');
Q('ley19628', 'a02', '¿Qué características debe tener el consentimiento en la Ley 19.628?',
  ['Informado, expreso, escrito y revocable', 'Verbal, tácito, gratuito y permanente', 'Escrito, notarial, anual y renovable', 'Informado, tácito, digital, gratuito y definitivo'],
  'Debe ser <b>informado</b> (se sabe para qué), <b>expreso</b> (no se presume), <b>escrito</b> (queda constancia) y <b>revocable</b> (se puede retirar).');
Q('ley19628', 'a03', '¿Cuál de estos es un <b>dato sensible</b> según la Ley 19.628?',
  ['El estado de salud físico o psíquico de una persona', 'El número de teléfono celular personal de contacto', 'La dirección de correo electrónico institucional', 'El cargo y la remuneración que tiene en su empresa'],
  'Son sensibles los datos sobre características físicas o morales o la vida privada: hábitos, origen racial, ideologías, creencias religiosas, <b>estados de salud</b> y vida sexual. Teléfono, correo y cargo son datos personales, pero no sensibles.');
Q('ley19628', 'a04', '¿Qué derechos reconoce la Ley 19.628 al titular?',
  ['Información, modificación, cancelación y bloqueo', 'Acceso, portabilidad, olvido y oposición', 'Información, indemnización, apelación y bloqueo', 'Rectificación, portabilidad, cancelación y reclamo'],
  'La 19.628 reconoce <b>información, modificación, cancelación y bloqueo</b>. La portabilidad y la oposición son propias del estándar moderno que incorpora la Ley 21.719.');
Q('ley19628', 'a05', 'Si el responsable no responde una solicitud del titular, ¿qué puede hacer este según la Ley 19.628?',
  ['Recurrir de amparo ante el Juez de Letras en lo Civil', 'Reclamar ante la Agencia de Protección de Datos', 'Presentar un recurso de protección ante la Contraloría General', 'Denunciar ante el CSIRT de Gobierno'],
  'Con la 19.628 no existía un órgano fiscalizador: el titular acudía al <b>Juez de Letras en lo Civil</b> (amparo) si no había respuesta en 2 días. La Agencia la crea la Ley 21.719.');
Q('ley19628', 'a06', '¿Qué multa contempla la Ley 19.628 por infracciones?',
  ['De 2 a 50 UTM, además de la indemnización', 'Hasta 20.000 UTM según la gravedad', 'Un porcentaje de las ventas anuales', 'De 100 a 500 UTM, sin derecho a indemnización'],
  'Multa de <b>2 a 50 UTM</b> más indemnización del daño patrimonial y moral. Las multas de hasta 20.000 UTM son de la Ley 21.719.');
Q('ley19628', 'a07', '¿Cuál de estas deudas <b>no</b> se puede publicar según la Ley 19.628?',
  ['Una deuda con una empresa de servicios básicos', 'Un cheque protestado por falta de fondos en la cuenta corriente', 'Un pagaré protestado', 'Un crédito bancario impago'],
  'Se pueden comunicar letras, pagarés y cheques protestados y créditos impagos. <b>No</b> se publican deudas con servicios básicos o autopistas, deudas pagadas o prescritas, ni las originadas durante la cesantía.');
Q('ley19628', 'a08', '¿Qué prohíbe el art. 9 inciso final de la Ley 19.628?',
  ['Predicciones de riesgo comercial no basadas solo en información objetiva de morosidad', 'Tratar datos personales para cualquier finalidad comercial o publicitaria', 'Comunicar deudas protestadas a bancos y entidades financieras', 'Guardar datos económicos del deudor por más de un año completo'],
  'Prohíbe predicciones o evaluaciones de riesgo comercial que <b>no se basen únicamente en información objetiva</b> de morosidades o protestos. Si se infringe, hay que eliminar la información e indemnizar.');
Q('ley19628', 'a09', 'Según el art. 10, ¿cuándo se pueden tratar datos sensibles?',
  ['Si la ley lo autoriza, hay consentimiento o son necesarios para beneficios de salud', 'Solo cuando el responsable es un organismo público con competencia en salud', 'Cuando el responsable los cifra antes de guardarlos en su base de datos', 'Nunca: la ley prohíbe tratarlos en todos los casos, sin ninguna excepción'],
  'Regla general: no se tratan, <b>salvo</b> que (1) la ley lo autorice, (2) el titular consienta, o (3) sean necesarios para determinar u otorgar <b>beneficios de salud</b>.');
Q('ley19628', 'a10', '¿Cuál de estas <b>no</b> es una falencia de la Ley 19.628?',
  ['Exigir el consentimiento del titular para tratar datos', 'No tener un órgano administrativo fiscalizador', 'No regular la transferencia internacional de datos personales a otros países', 'No tener un catálogo de sanciones efectivas'],
  'Exigir consentimiento es uno de sus principios. Las falencias son: sin fiscalizador, sin procedimiento de reclamo, sin sanciones efectivas, sin regular transferencia internacional, sin exigir seguridad y <b>demasiadas excepciones</b> al consentimiento.');
Q('ley19628', 'a11', '¿Qué obligaciones tiene el responsable según la Ley 19.628?',
  ['Secreto, debida diligencia y responder por los daños', 'Registrarse ante la Agencia y nombrar un DPO', 'Notificar toda brecha de seguridad en 72 horas a los titulares afectados', 'Cifrar todos los datos con AES y rotar las llaves'],
  'Arts. 7, 11 y 23: deber de <b>secreto</b>, cuidar los datos con <b>debida diligencia</b> y <b>responder</b> por los daños. La ley no imponía técnicas específicas ni registro ante una agencia.');
Q('ley19628', 'a12', '¿Qué tratamiento queda <b>fuera</b> del ámbito de la Ley 19.628 (art. 1)?',
  ['El hecho en ejercicio de las libertades de opinión e información', 'El que realizan los organismos públicos en las materias de su competencia legal', 'El tratamiento manual en registros de papel', 'El que realizan personas jurídicas privadas'],
  'La ley se aplica a registros automatizados o manuales, públicos o privados. Se excluye el tratamiento en ejercicio de las <b>libertades de emitir opinión y de informar</b>, regulado por otra ley.');
Q('ley19628', 'a13', '¿Quién presentó la moción que dio origen a la Ley 19.628 y en qué año?',
  ['El senador Eugenio Cantuarias, en 1993', 'El Ministerio de Economía, en 1999', 'El senador Eugenio Cantuarias, en 1999', 'La Contraloría General, en 1993'],
  'La moción es de <b>1993</b>, del senador <b>Eugenio Cantuarias</b>; la ley se publicó en <b>1999</b>.');
Q('ley19628', 'a14', 'Respecto de los organismos públicos, la Ley 19.628 establece que:',
  ['Pueden tratar datos sin consentimiento, solo en materias de su competencia', 'Necesitan el consentimiento escrito de cada titular', 'Pueden comunicar a cualquier interesado las condenas ya prescritas o cumplidas', 'Quedan totalmente excluidos de la ley'],
  'Tratan datos <b>sin consentimiento</b> pero <b>solo en su competencia</b>, y no pueden comunicar condenas o infracciones prescritas (salvo a tribunales u otros organismos públicos).');
VF('ley19628', 'v01', 'La Ley 19.628 protege los datos de personas naturales y también los de personas jurídicas.', false,
  'Falso: protege datos de <b>personas naturales</b>. Los datos de una empresa no son datos personales.');
VF('ley19628', 'v02', 'Los derechos del titular en la Ley 19.628 son gratuitos y no pueden limitarse por acto o convención.', true,
  'Verdadero: ambas cosas las establece la ley. Un contrato no puede quitarle al titular sus derechos.');
VF('ley19628', 'v03', 'En la Ley 19.628, el consentimiento puede ser tácito si el titular usa el servicio.', false,
  'Falso: debe ser <b>expreso</b> y <b>escrito</b>. Usar un servicio no equivale a consentir.');
VF('ley19628', 'v04', 'Según la Ley 19.628, no requieren consentimiento los datos de fuentes de acceso público de carácter económico, financiero, bancario o comercial.', true,
  'Verdadero: es una de las excepciones del art. 4. La gran cantidad de excepciones es justamente una de las críticas a la ley.');
VF('ley19628', 'v05', 'La Ley 19.628 creó un órgano fiscalizador y exigió medidas de seguridad específicas, como el cifrado.', false,
  'Falso: <b>ninguna</b> de las dos. La falta de fiscalizador y de medidas de seguridad exigidas están entre sus falencias.');
VF('ley19628', 'v06', 'Se pueden publicar los protestos originados mientras el deudor estaba cesante, si la deuda sigue impaga.', false,
  'Falso: los protestos y morosidades originados durante la <b>cesantía</b> no se pueden publicar.');
VF('ley19628', 'v07', 'El principio de finalidad de la Ley 19.628 indica que los datos solo pueden usarse para los fines con que se recolectaron, salvo que provengan de fuentes de acceso público.', true,
  'Verdadero: es el art. 9, con su excepción de fuentes de acceso público.');
VF('ley19628', 'v08', 'El derecho de bloqueo procede cuando la exactitud de los datos no puede establecerse o su vigencia es dudosa, y no corresponde cancelarlos.', true,
  'Verdadero: el bloqueo suspende el tratamiento sin eliminar el dato.');
DEV('ley19628', 'w01', 'Explica tres falencias de la Ley 19.628 y cómo la Ley 21.719 responde a cada una.',
  '<b>1. Sin órgano fiscalizador:</b> el titular debía ir a un juez civil. La 21.719 crea la <b>Agencia de Protección de Datos Personales</b>, que fiscaliza, sanciona y resuelve reclamos.<br><b>2. Sanciones débiles:</b> multa de 2 a 50 UTM. La 21.719 clasifica infracciones en leves, graves y gravísimas, con multas de hasta 20.000 UTM.<br><b>3. Sin transferencia internacional ni medidas de seguridad:</b> la 21.719 regula la transferencia internacional, establece el principio de seguridad y el deber de reportar brechas.',
  ['Nombra al menos tres falencias concretas (fiscalizador, sanciones, transferencia, seguridad, excepciones)', 'Menciona la Agencia de Protección de Datos como respuesta a la falta de fiscalizador', 'Compara las multas (2 a 50 UTM vs hasta 20.000 UTM)', 'Relaciona otra falencia con su solución (transferencia internacional o deber de seguridad)']);
DEV('ley19628', 'w02', 'Un titular pide a una empresa que corrija su dirección y la empresa no responde. Explica qué derecho ejerce y qué puede hacer según la Ley 19.628.',
  'Ejerce el derecho de <b>modificación</b>, que procede cuando los datos son erróneos, inexactos o incompletos. Es <b>gratuito</b> y no se puede limitar por contrato. Si el responsable no se pronuncia en <b>2 días</b>, puede recurrir de <b>amparo ante el Juez de Letras en lo Civil</b>, que puede ordenar la modificación, aplicar multa de 2 a 50 UTM, además de la indemnización por los daños.',
  ['Identifica el derecho de modificación (rectificación)', 'Indica que es gratuito o no limitable', 'Menciona el amparo ante el Juez de Letras en lo Civil', 'Menciona el plazo (2 días) o la sanción (multa o indemnización)']);

/* =================== LEY 21.719 =================== */
Q('ley21719', 'b01', '¿Qué organismo crea la Ley 21.719?',
  ['La Agencia de Protección de Datos Personales', 'El Consejo para la Transparencia', 'La Superintendencia de Ciberseguridad', 'El Registro Nacional de Bancos de Datos del Registro Civil'],
  'Crea la <b>Agencia de Protección de Datos Personales</b>: fiscaliza, sanciona, resuelve reclamos y administra el Registro Nacional de Sanciones y Cumplimiento.');
Q('ley21719', 'b02', '¿En qué se inspira principalmente el proyecto de la Ley 21.719?',
  ['En las directrices de la OCDE sobre protección de datos', 'En la Constitución de 1980 en su texto original', 'En la Ley de ficheros francesa de 1984', 'En la Ley 21.663, marco de ciberseguridad e infraestructura crítica'],
  'El proyecto sigue las <b>directrices de la OCDE</b> (limitación de recogida, calidad, especificación del propósito, limitación de uso, salvaguardia, transparencia, participación individual y responsabilidad).');
Q('ley21719', 'b03', '¿Qué es el <b>responsable</b> del tratamiento?',
  ['Quien decide sobre el tratamiento, directamente o a través de un tercero', 'Quien trata los datos por cuenta de otro, siguiendo sus instrucciones', 'El titular de los datos, que dio su consentimiento para tratarlos', 'El funcionario de la Agencia que fiscaliza el cumplimiento de la ley'],
  'El <b>responsable</b> decide sobre el tratamiento, con independencia de si lo hace él mismo o mediante un <b>encargado</b>, que trata los datos por su cuenta.');
Q('ley21719', 'b04', 'Un centro médico guarda sus fichas en un servicio de nube contratado. ¿Qué rol tiene el proveedor de nube?',
  ['Encargado del tratamiento', 'Responsable del tratamiento', 'Titular de los datos', 'Corresponsable con el paciente'],
  'El centro médico decide (responsable); el proveedor de nube trata los datos <b>por cuenta</b> del centro: es <b>encargado</b>.');
Q('ley21719', 'b05', '¿Cuál de estos datos es sensible en la Ley 21.719 pero <b>no</b> estaba en la lista de la Ley 19.628?',
  ['Los datos biométricos', 'Los estados de salud', 'Las creencias religiosas', 'La vida sexual'],
  'La 21.719 amplía la lista con <b>biométricos</b>, perfil biológico, afiliación sindical o gremial, orientación sexual e identidad de género. Salud, religión y vida sexual ya estaban en la 19.628.');
Q('ley21719', 'b06', 'Para tratar datos de un niño de 12 años, ¿quién debe consentir?',
  ['Quien tiene su cuidado personal', 'El propio niño, si entiende el texto', 'El establecimiento educacional', 'La Agencia de Protección de Datos'],
  'Bajo <b>14 años</b>, el consentimiento lo da quien tiene su <b>cuidado personal</b> (salvo que la ley autorice otra cosa).');
Q('ley21719', 'b07', 'Para un adolescente de 16 años, ¿qué regla aplica?',
  ['La regla general, salvo para sus datos sensibles', 'Siempre consienten sus padres o tutores', 'Sus datos no se pueden tratar hasta los 18', 'Solo puede consentir con autorización previa de un juez de familia'],
  'Entre 14 y 18 rige la <b>regla general</b>, con excepción de los <b>datos sensibles</b>, que tienen un tratamiento reforzado. Refleja la <b>autonomía progresiva</b>.');
Q('ley21719', 'b08', '¿Qué significa la <b>autonomía progresiva</b> de niños, niñas y adolescentes?',
  ['A medida que desarrollan sus capacidades, deciden sobre más ámbitos de sus derechos', 'Sus padres deciden sobre todos sus datos hasta los 18 años, sin excepciones', 'Pueden consentir cualquier tratamiento de sus datos desde los 10 años', 'El Estado decide por ellos cada vez que se trata de datos sensibles'],
  'El niño va tomando control de más ámbitos según su desarrollo. Funciona como un límite a la autoridad de los padres: son sujetos de derechos distintos de sus progenitores.');
Q('ley21719', 'b09', '¿Qué exige la ley para tratar datos de <b>geolocalización</b>?',
  ['Consentimiento inequívoco e informar tipo de dato, finalidad, duración y cesión', 'Solo un aviso general incluido en los términos y condiciones del servicio', 'Una autorización previa de la Agencia para cada una de las aplicaciones que la usen', 'Nada especial: son datos personales comunes, sin reglas propias'],
  'Requiere consentimiento <b>inequívoco</b> e informar el tipo de datos, la finalidad, la duración y si se cederán a terceros.');
Q('ley21719', 'b10', '¿Qué debe informar quien usa un sistema biométrico?',
  ['El sistema usado, su finalidad, el período de uso y cómo ejercer los derechos', 'Solo el nombre del fabricante y el modelo del lector biométrico instalado', 'La fórmula matemática que usa el sistema para comparar las huellas', 'El listado completo con los nombres de todas las personas registradas en el sistema'],
  'Debe informar el <b>sistema biométrico</b>, la <b>finalidad</b>, el <b>período</b> de uso y la forma de <b>ejercer los derechos</b>.');
Q('ley21719', 'b11', '¿Cuál es la multa máxima para infracciones gravísimas en la Ley 21.719?',
  ['Hasta 20.000 UTM', 'Hasta 50 UTM', 'Hasta 5.000 UTM', 'Hasta 1.000 UTM'],
  'Leves hasta 5.000 UTM, graves hasta 10.000 y <b>gravísimas hasta 20.000 UTM</b>. 50 UTM era el máximo de la 19.628.');
Q('ley21719', 'b12', '¿Cuál es el ámbito de aplicación de la Ley 21.719?',
  ['Todo tratamiento por personas naturales o jurídicas, incluidos órganos públicos', 'Solo el tratamiento automatizado que hacen las empresas privadas en Chile', 'Solo los órganos públicos que administran bases de datos de ciudadanos', 'Solo los datos sensibles de salud, biométricos y de geolocalización'],
  'Se aplica a todo tratamiento de datos personales de personas naturales o jurídicas, <b>incluidos los órganos públicos</b>, que no esté regido por una ley especial (para esos, es supletoria).');
Q('ley21719', 'b13', 'Que la Ley 21.719 sea <b>supletoria</b> significa que:',
  ['Se aplica en lo que no regule una ley especial sobre ese tratamiento', 'Reemplaza a todas las leyes especiales que existan', 'Solo se aplica si el titular lo solicita expresamente ante la Agencia', 'Rige únicamente mientras no exista reglamento'],
  'Si una ley especial regula un tratamiento, esa ley manda; la 21.719 <b>llena los vacíos</b>.');
Q('ley21719', 'b14', '¿Cuál de estos <b>no</b> es un principio de la Ley 21.719?',
  ['Libre circulación', 'Proporcionalidad', 'Responsabilidad', 'Calidad de los datos'],
  'Principios: licitud, finalidad, <b>proporcionalidad</b>, <b>calidad</b>, seguridad, <b>responsabilidad</b>, información (y confidencialidad). "Libre circulación sin restricciones" no es un principio: la transferencia se limita si el destino no protege adecuadamente.');
Q('ley21719', 'b15', 'El principio de <b>proporcionalidad</b> exige que:',
  ['Se traten solo los datos necesarios, por el tiempo necesario', 'Las multas sean proporcionales a las ventas anuales de la empresa infractora', 'Cada titular reciba un trato igual en el sistema', 'El cifrado tenga una llave proporcional al dato'],
  'Proporcionalidad = <b>solo lo necesario para la finalidad</b> y solo por el tiempo necesario. En el taller se implementa como <b>minimización</b> y plazos de conservación.');
Q('ley21719', 'b16', '¿Cuándo entra en vigencia la Ley 21.719?',
  ['El 1 de diciembre de 2026', 'El 13 de diciembre de 2024', 'El 1 de enero de 2025', 'El 1 de diciembre de 2025'],
  'Se publicó el 13 de diciembre de 2024 y entra en vigencia el primer día del mes 24 tras su publicación: <b>1 de diciembre de 2026</b>. (Complemento, no está en las láminas.)');
VF('ley21719', 'x01', 'Con la Ley 21.719, un dato seudonimizado deja de ser dato personal.', false,
  'Falso: si se puede reidentificar con información adicional, la persona sigue siendo <b>identificable</b>. Solo los datos anonimizados de forma irreversible dejan de ser personales.');
VF('ley21719', 'x02', 'Una persona es identificable si puede determinarse su identidad directa o indirectamente, salvo que ello requiera un esfuerzo desproporcionado.', true,
  'Verdadero: es la definición de la ley. Identificadores indirectos: elementos físicos, genéticos, económicos, culturales o sociales.');
VF('ley21719', 'x03', 'El encargado del tratamiento es quien decide los fines del tratamiento, y el responsable lo ejecuta por su cuenta.', false,
  'Falso: está al revés. El <b>responsable</b> decide; el <b>encargado</b> trata por cuenta del responsable.');
VF('ley21719', 'x04', 'La Ley 21.719 agrega los datos biométricos y el perfil biológico humano a la categoría de datos sensibles.', true,
  'Verdadero: ambos están en la lista ampliada de datos sensibles.');
VF('ley21719', 'x05', 'Los establecimientos educacionales tienen una obligación especial de velar por el uso lícito de los datos de los niños, niñas y adolescentes.', true,
  'Verdadero: la ley lo establece para establecimientos educacionales y toda entidad que trate datos de menores, incluidos sus cuidadores.');
VF('ley21719', 'x06', 'Las directrices de la OCDE promueven restringir siempre el flujo transfronterizo de datos.', false,
  'Falso: buscan que el flujo sea <b>seguro e ininterrumpido</b>, y solo restringirlo si el país de destino no tiene protección adecuada.');
VF('ley21719', 'x07', 'La Ley 21.719 solo se aplica a empresas privadas; los órganos públicos se rigen únicamente por la Ley 19.628.', false,
  'Falso: la 21.719 incluye a los <b>órganos públicos</b>. Además, reforma la 19.628, no convive con ella como ley separada.');
VF('ley21719', 'x08', 'El principio de responsabilidad implica que el responsable debe cumplir la ley y además poder demostrarlo.', true,
  'Verdadero: por eso son importantes los logs de auditoría, los registros de consentimiento y la documentación de decisiones.');
DEV('ley21719', 'y01', 'Compara la Ley 19.628 con la Ley 21.719 en al menos tres aspectos.',
  '<b>Fiscalización:</b> la 19.628 no tenía fiscalizador (amparo ante juez civil); la 21.719 crea la <b>Agencia</b>.<br><b>Sanciones:</b> 2 a 50 UTM vs infracciones leves, graves y gravísimas hasta <b>20.000 UTM</b>.<br><b>Datos sensibles:</b> la 21.719 agrega biométricos, perfil biológico, afiliación sindical, orientación sexual e identidad de género.<br><b>Derechos:</b> de información, modificación, cancelación y bloqueo a ARCO más <b>portabilidad</b>.<br><b>Otros:</b> regula transferencia internacional, reglas para menores, geolocalización y biométricos, deber de seguridad.',
  ['Compara la fiscalización (juez civil vs Agencia)', 'Compara las sanciones (50 UTM vs 20.000 UTM)', 'Compara los datos sensibles o los derechos', 'Menciona un tercer aspecto concreto (transferencia, menores, seguridad, biométricos)']);
DEV('ley21719', 'y02', 'Explica la diferencia entre responsable y encargado del tratamiento y aplícala a tu proyecto.',
  '<b>Responsable:</b> persona natural o jurídica que <b>decide</b> sobre el tratamiento (para qué y cómo), aunque lo haga a través de otro. <b>Encargado:</b> trata los datos <b>por cuenta</b> del responsable, siguiendo sus instrucciones.<br><b>Proyecto:</b> el centro médico (la clínica) es el responsable: decide qué datos de pacientes recolecta y para qué. Si las fichas se alojan en un proveedor de nube, o un laboratorio externo procesa exámenes por encargo, ese proveedor es encargado. El responsable sigue respondiendo por el cumplimiento.',
  ['Define responsable como quien decide', 'Define encargado como quien trata por cuenta del responsable', 'Da un ejemplo concreto del proyecto', 'Indica que el responsable sigue respondiendo aunque delegue']);
DEV('ley21719', 'y03', 'Una app de un colegio quiere guardar la ubicación en tiempo real de sus alumnos (entre 10 y 17 años). ¿Qué exige la ley?',
  '<b>Geolocalización:</b> requiere consentimiento <b>inequívoco</b> e informar tipo de datos, finalidad, duración y si se ceden a terceros.<br><b>Menores de 14:</b> consiente quien tiene su <b>cuidado personal</b>. <b>De 14 a 18:</b> regla general, salvo datos sensibles.<br><b>Interés superior y autonomía progresiva:</b> el tratamiento debe beneficiar al niño.<br><b>Colegio:</b> tiene la obligación especial de velar por el uso lícito de esos datos. Además aplica proporcionalidad: ¿es necesaria la ubicación en tiempo real o basta saber si llegó al colegio?',
  ['Consentimiento inequívoco e informar finalidad y duración para la geolocalización', 'Distingue menores de 14 (cuidado personal) y de 14 a 18', 'Menciona interés superior o autonomía progresiva', 'Menciona la obligación especial del colegio o la proporcionalidad']);

/* =================== FUNDAMENTOS =================== */
Q('fundamentos', 'c01', 'Una contraseña débil del administrador es un ejemplo de:',
  ['Vulnerabilidad', 'Amenaza', 'Activo', 'Riesgo'],
  'Es una <b>debilidad</b> que una amenaza (un atacante) puede explotar: vulnerabilidad. El riesgo sería la probabilidad de que la exploten por el impacto.');
Q('fundamentos', 'c02', 'Un ransomware que cifra la base de datos de un hospital afecta principalmente:',
  ['La disponibilidad', 'La confidencialidad', 'La integridad', 'El no repudio'],
  'El hospital pierde <b>acceso</b> a sus datos: es un ataque a la disponibilidad. (Si además los filtran, también afecta la confidencialidad.)');
Q('fundamentos', 'c03', '¿Qué garantiza el <b>no repudio</b>?',
  ['Que el autor de una acción no pueda negar haberla realizado', 'Que solo los usuarios autorizados puedan leer la información guardada en el sistema', 'Que los datos estén disponibles cuando se necesiten', 'Que nadie pueda modificar los datos sin permiso'],
  'No repudio: la acción queda registrada de forma que el autor no la puede negar (firma digital, log de auditoría). Las otras alternativas son confidencialidad, disponibilidad e integridad.');
Q('fundamentos', 'c04', '¿Qué tuvo en común el caso Redbanc (2019) con otros incidentes vistos en clase?',
  ['La entrada fue a través de un tercero o proveedor', 'Fue un ataque de ransomware dirigido a los hospitales públicos del país', 'Se originó por un error del Registro Civil', 'Afectó solo la disponibilidad de los cajeros'],
  'Redbanc filtró 41.593 tarjetas <b>vía un proveedor externo</b>. Los patrones comunes: terceros, sin MFA, credenciales comprometidas y sin cifrado en reposo.');
VF('fundamentos', 'u01', 'El riesgo se define solo por la probabilidad de que ocurra un ataque, sin importar el activo afectado.', false,
  'Falso: el riesgo combina <b>probabilidad</b> e <b>impacto</b> sobre el activo.');
VF('fundamentos', 'u02', 'Que un usuario cambie un diagnóstico médico sin autorización es una falla de integridad.', true,
  'Verdadero: los datos fueron alterados de forma indebida.');
VF('fundamentos', 'u03', 'Según la clase, Chile es más eficiente detectando tempranamente los incidentes que notificándolos.', false,
  'Falso: es al revés. Chile tiene madurez normativa, pero es <b>más eficiente notificando que detectando</b>.');
DEV('fundamentos', 'z01', 'Explica el triángulo CIA y da un ejemplo de control para cada atributo en tu proyecto.',
  '<b>Confidencialidad:</b> solo los autorizados acceden. Control: cifrado AES-GCM de los campos sensibles y control de acceso por rol.<br><b>Integridad:</b> los datos no se alteran indebidamente. Control: validaciones, permisos de edición y registro de quién modificó qué (AES-GCM además detecta si el dato cifrado fue alterado).<br><b>Disponibilidad:</b> los datos están cuando se necesitan. Control: respaldos periódicos y plan de recuperación.',
  ['Define confidencialidad con un control (cifrado o acceso)', 'Define integridad con un control', 'Define disponibilidad con un control (respaldos)', 'Relaciona los ejemplos con el proyecto']);

/* =================== CIFRADO =================== */
Q('cifrado', 'e01', '¿Qué técnica corresponde para guardar las contraseñas de los usuarios?',
  ['Hashing lento con sal, como bcrypt o Argon2', 'Cifrado simétrico con AES y la llave en el servidor', 'Hashing rápido con SHA-256 sin sal', 'Tokenización con un proveedor externo'],
  'Las contraseñas no se necesitan leer, solo verificar: <b>hash</b>. Y debe ser <b>lento con sal</b> para resistir fuerza bruta. Cifrarlas permite que quien tenga la llave las lea.');
Q('cifrado', 'e02', '¿Qué técnica corresponde para una ficha clínica que el médico necesita leer?',
  ['Cifrado simétrico, como AES', 'Hashing con Argon2', 'Anonimización irreversible', 'Hashing con SHA-256 y sal aleatoria'],
  'El médico necesita <b>recuperar</b> el contenido: cifrado reversible. Un hash no se puede revertir.');
Q('cifrado', 'e03', '¿Cuál es la diferencia principal entre cifrado y hashing?',
  ['El cifrado es reversible con la llave; el hashing no se puede revertir', 'El hashing es reversible con la llave; el cifrado no se puede revertir', 'El cifrado solo sirve en tránsito; el hashing solo en reposo', 'Ambos son reversibles, pero el hashing es más rápido'],
  'Pregunta clave: ¿necesito volver a leer el dato? Sí → <b>cifrado</b>. Solo comparar → <b>hash</b>.');
Q('cifrado', 'e04', '¿Por qué el cifrado asimétrico no se usa para cifrar grandes volúmenes de datos?',
  ['Porque es mucho más lento que el simétrico', 'Porque no permite descifrar los datos', 'Porque obliga a compartir la llave privada con el receptor', 'Porque solo funciona con contraseñas'],
  'RSA y ECC son <b>lentos</b>. Por eso TLS es híbrido: asimétrico para acordar una llave y simétrico (AES) para los datos.');
Q('cifrado', 'e05', '¿Dónde debe guardarse la llave de cifrado de una aplicación?',
  ['En variables de entorno o un gestor de secretos, fuera del repositorio', 'En el código fuente, junto a la función que cifra, para que no se pierda', 'En la misma tabla que los datos cifrados, para encontrarla rápido', 'En un comentario del archivo de configuración del repositorio'],
  'Nunca junto a los datos ni en el código. Si roban la base con la llave al lado, el cifrado no sirvió.');
Q('cifrado', 'e06', '¿Qué protege TLS/HTTPS?',
  ['Los datos en tránsito entre cliente y servidor', 'Los datos en reposo guardados dentro de la base de datos del servidor', 'Los datos en uso dentro de la memoria', 'Las contraseñas guardadas en la base'],
  'TLS cifra la <b>comunicación</b>. Al llegar al servidor, el dato se descifra: para protegerlo en reposo se necesita cifrado de campos o de disco.');
Q('cifrado', 'e07', '¿Qué técnica conviene para números de tarjeta de crédito que el sistema no necesita ver?',
  ['Tokenización', 'Hashing con bcrypt', 'Cifrado asimétrico con RSA', 'Seudonimización con el RUT'],
  'El sistema guarda un <b>token</b> sin valor y el número real queda en la bóveda del proveedor de pagos. Si roban la base, los tokens no sirven.');
Q('cifrado', 'e08', '¿Por qué la Ley 21.719 no dice "use AES-256"?',
  ['Exige medidas adecuadas al riesgo y el responsable elige y justifica la técnica', 'Porque AES-256 está prohibido en Chile por la Ley 21.663 de ciberseguridad', 'Porque la ley no exige ninguna medida de seguridad a los responsables', 'Porque la Agencia publica cada año el único algoritmo que es obligatorio'],
  'La ley exige protección <b>proporcional al riesgo</b>; la técnica la decide y la <b>documenta</b> el responsable (por eso la cadena de decisión).');
Q('cifrado', 'e09', '¿Qué es la "sal" en el hashing de contraseñas?',
  ['Un valor aleatorio por usuario que hace distintos los hashes de contraseñas iguales', 'La llave secreta que permite revertir el hash cuando el usuario la olvida', 'Un segundo hash de la contraseña que se guarda en otra tabla aparte', 'El número de intentos que tiene el usuario antes de bloquear la cuenta'],
  'Con sal, dos usuarios con la misma contraseña tienen hashes distintos, y las tablas precalculadas no sirven. No permite revertir el hash.');
VF('cifrado', 'f01', 'SHA-256 es adecuado para guardar contraseñas porque es irreversible y rápido.', false,
  'Falso: es irreversible, pero que sea <b>rápido</b> es justamente el problema: permite probar millones de contraseñas por segundo.');
VF('cifrado', 'f02', 'En el cifrado simétrico se usa la misma llave para cifrar y descifrar, y AES es el estándar actual.', true,
  'Verdadero: ambas afirmaciones son correctas. 3DES es legado.');
VF('cifrado', 'f03', 'El estado más difícil de proteger es el dato en uso, porque normalmente hay que descifrarlo para procesarlo.', true,
  'Verdadero: en reposo y en tránsito el dato puede estar cifrado; para procesarlo, normalmente no.');
VF('cifrado', 'f04', 'Si los datos están cifrados con AES, da lo mismo dónde se guarde la llave.', false,
  'Falso: la seguridad está en la llave. Si se filtra junto con los datos, el cifrado no protege nada.');
VF('cifrado', 'f05', 'Una buena práctica es crear un algoritmo de cifrado propio para que los atacantes no lo conozcan.', false,
  'Falso: inventar criptografía es un error típico. Los algoritmos estándar son públicos y la seguridad está en la llave.');
DEV('cifrado', 'g01', 'Para tu proyecto, elige tres datos y justifica qué técnica de protección usarías en cada uno (cadena de decisión).',
  'Cadena: <b>dato → necesidad → técnica → herramienta → gestión de llaves → evidencia</b>.<br><b>Ficha clínica / diagnóstico:</b> el médico necesita leerlo → cifrado simétrico → AES-GCM → llave en variable de entorno, fuera del repositorio → prueba de que en la base se ve cifrado.<br><b>Contraseña:</b> solo verificar → hash lento con sal → Argon2 → no hay llave → la base guarda solo el hash.<br><b>Comunicación con el navegador:</b> en tránsito → cifrado híbrido → HTTPS/TLS.',
  ['Usa la pregunta "¿necesito leer el dato?" para decidir', 'Cifrado (AES) para un dato que se debe leer, como la ficha', 'Hash lento (Argon2/bcrypt) para contraseñas', 'Menciona la gestión de la llave (fuera del código y de la base)']);
DEV('cifrado', 'g02', 'Explica la diferencia entre cifrado simétrico, asimétrico e híbrido, y dónde se usa cada uno.',
  '<b>Simétrico:</b> una misma llave cifra y descifra; rápido (AES). Se usa para cifrar datos en reposo, como campos de la base.<br><b>Asimétrico:</b> par de llaves pública y privada; lento (RSA, ECC). Resuelve cómo compartir una llave sin enviarla y permite firmas digitales.<br><b>Híbrido:</b> usa el asimétrico para acordar una llave simétrica y luego cifra los datos con ella. Así funciona TLS/HTTPS.',
  ['Simétrico: una llave, rápido, AES', 'Asimétrico: pública y privada, lento, RSA o ECC', 'Híbrido combina ambos (TLS)', 'Indica un uso concreto de cada uno']);

/* =================== PRIVACIDAD Y ACCESO =================== */
Q('privacidad', 'h01', 'Una app trae marcada por defecto la casilla "compartir mis datos con socios comerciales". ¿Qué principio infringe?',
  ['Privacidad por defecto', 'Disponibilidad', 'Tokenización', 'Separación de funciones'],
  'Por defecto, la opción debe ser la <b>más protectora</b>. Además, un consentimiento con casilla pre-marcada no es expreso.');
Q('privacidad', 'h02', '¿Cuál es la diferencia entre seudonimizar y anonimizar?',
  ['Seudonimizar se puede revertir con información adicional; anonimizar es irreversible', 'Anonimizar se puede revertir con la llave; seudonimizar es irreversible', 'Son lo mismo, pero seudonimizar se usa en bases de datos', 'Seudonimizar elimina los datos; anonimizar los cifra'],
  'Por eso el dato seudonimizado <b>sigue siendo personal</b> y el anonimizado no.');
Q('privacidad', 'h03', 'Un dataset sin nombres incluye fecha de nacimiento, comuna y sexo. ¿Cuál es el riesgo?',
  ['Reidentificar personas combinando esos cuasi-identificadores', 'Ninguno, sin nombres los datos ya están anonimizados', 'Que el dataset ocupe demasiado espacio', 'Que los datos pierdan integridad al compartirse'],
  'Los <b>cuasi-identificadores</b> combinados pueden identificar a una persona. Hay que generalizar (rangos de edad, región) o agregar.');
Q('privacidad', 'h04', '¿Qué es el principio de mínimo privilegio?',
  ['Cada usuario tiene solo los permisos necesarios para su trabajo', 'Los administradores tienen todos los permisos del sistema', 'Los usuarios nuevos empiezan sin ningún permiso y nunca reciben uno nuevo', 'Se guardan los mínimos datos posibles del usuario'],
  'Limita el daño si una cuenta se compromete. Guardar los mínimos datos es <b>minimización</b>, un principio distinto.');
Q('privacidad', 'h05', 'Ocultar el botón "ver ficha" en el frontend para la recepcionista, ¿es suficiente control de acceso?',
  ['No, el permiso debe validarse en el servidor en cada petición', 'Sí, si el botón no aparece no puede acceder', 'Sí, siempre que la ficha clínica esté cifrada con AES en la base de datos', 'No, hay que ocultar también la URL en el navegador'],
  'Cualquiera puede llamar a la API directamente. La autorización se valida <b>en el servidor</b>.');
Q('privacidad', 'h06', 'Una API devuelve el objeto completo del paciente (con diagnóstico) cuando la pantalla solo muestra nombre y hora de la cita. ¿Qué se debería hacer?',
  ['Usar un DTO que devuelva solo los campos necesarios', 'Cifrar la respuesta completa con RSA', 'Ocultar el campo del diagnóstico con CSS en el frontend de la aplicación', 'Mover el diagnóstico a otra tabla de la base'],
  '<b>Minimización en las APIs:</b> la respuesta debe contener solo lo que la pantalla necesita. Ocultarlo en la interfaz no evita que viaje.');
Q('privacidad', 'h07', '¿Qué es RBAC?',
  ['Control de acceso basado en roles: los permisos se asignan a roles y estos a usuarios', 'Un algoritmo de cifrado por bloques que se usa en las bases de datos', 'Un registro de auditoría con los accesos de cada usuario a cada tabla', 'Una técnica de anonimización que generaliza los datos en rangos'],
  '<b>Role-Based Access Control.</b> Facilita aplicar mínimo privilegio: se definen roles (médico, recepción) con sus permisos.');
VF('privacidad', 'j01', 'La privacidad desde el diseño significa agregar controles de privacidad al final del desarrollo, antes de publicar.', false,
  'Falso: significa incorporarla <b>desde el inicio</b>, de forma proactiva, no como parche.');
VF('privacidad', 'j02', 'Poner el RUT del paciente en la URL (por ejemplo /pacientes/12345678-9) es una mala práctica de minimización.', true,
  'Verdadero: las URLs quedan en logs, historial y cachés. Mejor usar un identificador interno.');
VF('privacidad', 'j03', 'Un hash con sal del RUT es una técnica de anonimización, por lo que el dato deja de ser personal.', false,
  'Falso: es <b>seudonimización</b>. Quien tenga la sal (o la tabla) puede volver a la persona.');
VF('privacidad', 'j04', 'La separación de funciones busca que ninguna persona controle sola un proceso crítico.', true,
  'Verdadero: por ejemplo, quien aprueba un pago no es quien lo ejecuta.');
DEV('privacidad', 'k01', 'Diseña una matriz de roles (RBAC) para tu proyecto aplicando mínimo privilegio. Justifica al menos dos decisiones.',
  'Ejemplo para un centro médico:<br><b>Médico:</b> ve y edita las fichas clínicas de <b>sus</b> pacientes.<br><b>Recepción:</b> ve datos de contacto y agenda; <b>no</b> ve diagnósticos.<br><b>Administrador:</b> gestiona usuarios y roles; no necesita leer fichas.<br><b>Paciente:</b> ve sus propios datos.<br>Justificación: recepción no necesita el diagnóstico para agendar (minimización y mínimo privilegio); el administrador técnico no debe leer datos de salud (separación de funciones). El permiso se valida en el servidor.',
  ['Define al menos tres roles con sus permisos', 'Aplica mínimo privilegio (ej.: recepción no ve diagnósticos)', 'Justifica al menos dos decisiones', 'Menciona validar en el servidor o separación de funciones']);

/* =================== CONSENTIMIENTO Y DERECHOS =================== */
Q('derechos', 'm01', '¿Cómo se implementa que un consentimiento sea <b>expreso</b>?',
  ['Con una casilla desmarcada que el usuario marca activamente', 'Con un aviso que dice "al usar el sitio aceptas"', 'Con una casilla que viene marcada por defecto', 'Con un correo electrónico informativo enviado después de completar el registro'],
  'Expreso = acción afirmativa del titular. Las casillas pre-marcadas o el "al usar aceptas" no son consentimiento expreso.');
Q('derechos', 'm02', '¿Qué conviene guardar como registro de consentimiento?',
  ['Titular, finalidad, versión del texto, fecha y si fue revocado', 'Solo un campo booleano acepta = true', 'La contraseña del usuario al momento de aceptar', 'Una copia escaneada del documento de identidad del titular, por ambos lados'],
  'Para poder <b>demostrarlo</b> (responsabilidad) se registra quién, para qué, qué texto, cuándo y la revocación.');
Q('derechos', 'm03', '¿Qué significa que el consentimiento sea granular?',
  ['Un consentimiento separado por cada finalidad', 'Un único consentimiento que cubre todos los usos', 'Que se renueva automáticamente cada mes', 'Que solo lo puede dar un adulto'],
  'Servicio, marketing y compartir con terceros son finalidades distintas; rechazar una no debe impedir usar el servicio.');
Q('derechos', 'm04', 'Un paciente pide eliminar su ficha clínica, pero la ley obliga a conservarla. ¿Qué corresponde?',
  ['Bloquearla e informar al titular el motivo', 'Eliminarla físicamente de inmediato', 'Rechazar la solicitud sin responderle, porque no procede', 'Anonimizarla y dejarla para estadísticas'],
  'Con <b>retención legal</b>, no se borra: se <b>bloquea</b> (no se usa para otros fines) y se informa al titular por qué.');
Q('derechos', 'm05', '¿Qué derecho permite recibir los datos en un formato estructurado para llevarlos a otro servicio?',
  ['Portabilidad', 'Rectificación', 'Oposición', 'Bloqueo'],
  'Portabilidad: datos en JSON o CSV, entregados por un enlace temporal de un solo uso y cifrados si son sensibles.');
Q('derechos', 'm06', '¿Cuál es un riesgo del borrado lógico?',
  ['Que el dato "eliminado" siga apareciendo si una consulta no lo excluye', 'Que se pierdan las relaciones entre las tablas que lo referencian', 'Que no se pueda revertir si la eliminación fue un error del operador o del titular', 'Que el titular no reciba la respuesta dentro del plazo legal'],
  'El borrado lógico solo marca el registro: hay que excluirlo en <b>todas</b> las consultas. Romper relaciones e irreversibilidad son riesgos del borrado <b>físico</b>.');
Q('derechos', 'm07', 'Para verificar la identidad de quien pide acceso a sus datos, lo adecuado es:',
  ['Una verificación proporcional, como sesión iniciada con segundo factor', 'Exigir siempre una copia notarial del carnet de identidad del titular', 'No verificar nada, porque los derechos del titular son gratuitos', 'Pedirle que envíe su contraseña actual por correo electrónico para compararla'],
  'Verificación <b>proporcional</b>: suficiente para no entregar datos a otra persona, sin pedir más datos de los que ya tienes.');
Q('derechos', 'm08', '¿En qué se diferencia la oposición de la revocación del consentimiento?',
  ['La oposición procede aunque la base del tratamiento no sea el consentimiento', 'La oposición obliga a borrar todos los datos del titular del sistema', 'La revocación solo la puede pedir un representante legal del titular', 'No hay diferencia: son el mismo derecho con dos nombres distintos'],
  'Revocar retira un consentimiento dado. La <b>oposición</b> excluye al titular de una finalidad aunque se trate con otra base (por ejemplo, interés legítimo).');
VF('derechos', 'n01', 'Al revocar un consentimiento, lo correcto es borrar la fila del registro de consentimiento.', false,
  'Falso: se marca la <b>fecha de revocación</b> y se conserva la fila como evidencia de cuándo hubo y no hubo consentimiento.');
VF('derechos', 'n02', 'La supresión de datos debe propagarse a respaldos, cachés y terceros que recibieron los datos.', true,
  'Verdadero: si no, el dato sigue existiendo en otro lado.');
VF('derechos', 'n03', 'Si un niño de 12 años se registra en una plataforma, basta con que él marque la casilla de consentimiento.', false,
  'Falso: bajo 14 años consiente quien tiene su <b>cuidado personal</b>.');
VF('derechos', 'n04', 'Cada solicitud de derechos debería registrarse con su estado y una fecha límite de respuesta, con alertas antes de que venza.', true,
  'Verdadero: estados recibida, en verificación, en ejecución, respondida (o rechazada/parcial) y control del plazo.');
DEV('derechos', 'o01', 'Describe el ciclo de vida de una solicitud de derechos ARCO+ y cómo lo implementarías en tu proyecto.',
  '<b>1. Recibida:</b> llega por un canal accesible (formulario en el sistema); se registra con fecha y plazo.<br><b>2. En verificación:</b> se confirma la identidad de forma proporcional (sesión + segundo factor, contacto registrado) o el poder del representante.<br><b>3. En ejecución:</b> se localizan los datos en tablas, adjuntos, respaldos y terceros, y se aplica el derecho (exportar, corregir, bloquear…).<br><b>4. Respondida</b> (o rechazada/parcial con fundamento).<br><b>Proyecto:</b> un modelo <code>Solicitud</code> con tipo, estado, fecha límite y responsable; si se pide suprimir la ficha clínica, se bloquea por retención legal.',
  ['Menciona los estados (recibida, verificación, ejecución, respondida)', 'Verificación de identidad proporcional', 'Localizar los datos en todos lados (respaldos, terceros)', 'Control del plazo o ejemplo concreto del proyecto']);
DEV('derechos', 'o02', 'Explica cómo se traducen en el sistema los cuatro requisitos del consentimiento (informado, expreso, escrito y revocable).',
  '<b>Informado:</b> texto claro de la finalidad antes de aceptar, guardando la versión del texto.<br><b>Expreso:</b> casilla desmarcada que el titular marca (acción afirmativa), una por finalidad.<br><b>Escrito:</b> registro en la base: titular, finalidad, versión, fecha y medio.<br><b>Revocable:</b> opción para retirarlo, tan fácil como darlo; se registra la fecha de revocación y el sistema deja de usar los datos para esa finalidad.',
  ['Informado: texto claro y versión', 'Expreso: casilla desmarcada o acción afirmativa', 'Escrito: registro en la base de datos', 'Revocable: retirarlo fácil y que el sistema deje de usar los datos']);

/* =================== TRAZABILIDAD E INCIDENTES =================== */
Q('incidentes', 'p01', '¿Cuál es la diferencia entre un log de aplicación y un log de auditoría?',
  ['El de aplicación sirve para depurar; el de auditoría registra quién hizo qué sobre qué datos', 'El de auditoría sirve para depurar; el de aplicación registra quién hizo qué sobre qué datos', 'Son iguales, pero el de auditoría se guarda cifrado', 'El de aplicación lo lee la Agencia; el de auditoría, los desarrolladores'],
  'Log de aplicación: errores y rendimiento, para desarrolladores. Log de auditoría: trazabilidad y responsabilidad.');
Q('incidentes', 'p02', '¿Qué <b>no</b> debe registrarse en un log de auditoría?',
  ['La contraseña o el texto del diagnóstico', 'El usuario que realizó la acción', 'La fecha, la hora y la IP de origen', 'El resultado de la operación realizada (éxito o denegada)'],
  'Se registra el <b>identificador</b> del dato, no su contenido. Nunca contraseñas, tokens ni datos sensibles.');
Q('incidentes', 'p03', '¿Qué característica deben tener los logs de auditoría para servir como evidencia?',
  ['Ser de solo escritura y de acceso restringido', 'Poder editarse para corregir errores', 'Guardarse en la misma base de datos que auditan, para consultarlos rápido', 'Borrarse cada día para ahorrar espacio'],
  'Un log que se puede alterar no prueba nada: <b>append-only</b>, separado del sistema auditado, acceso restringido y relojes sincronizados.');
Q('incidentes', 'p04', '¿Qué es una brecha de seguridad?',
  ['Un incidente que afecta la confidencialidad, integridad o disponibilidad de datos personales', 'Cualquier evento que quede registrado en los logs de la aplicación', 'Un intento de inicio de sesión fallido de un usuario del sistema', 'Una alerta de monitoreo que todavía nadie del equipo ha revisado'],
  'Evento → algo observable. Incidente → compromete la seguridad. <b>Brecha</b> → incidente que afecta <b>datos personales</b>.');
Q('incidentes', 'p05', 'En la fase de contención de un incidente, lo más importante es:',
  ['Limitar el daño preservando la evidencia', 'Reinstalar todo el sistema de inmediato', 'Borrar los logs comprometidos', 'Esperar a tener el informe final completo antes de actuar'],
  'Contener (bloquear cuentas, aislar) <b>sin destruir evidencia</b>. Reinstalar o borrar logs antes de preservarlos es un error típico.');
Q('incidentes', 'p06', '¿Cuál es el orden correcto del ciclo de respuesta a incidentes?',
  ['Preparación, detección, contención, erradicación, recuperación, lecciones', 'Detección, preparación, erradicación, contención, lecciones, recuperación', 'Contención, detección, preparación, recuperación, erradicación, lecciones', 'Preparación, contención, detección, recuperación, lecciones, erradicación'],
  'Primero se prepara; luego se detecta, se contiene, se elimina la causa, se recupera y se aprende.');
VF('incidentes', 'q01', 'Todo evento registrado en los logs es un incidente de seguridad.', false,
  'Falso: la mayoría de los eventos son normales. Un incidente compromete o amenaza la seguridad.');
VF('incidentes', 'q02', 'Un usuario que consulta cientos de fichas en pocos minutos es una señal que debería generar una alerta.', true,
  'Verdadero: accesos masivos, fuera de horario o desde ubicaciones inusuales son señales típicas.');
VF('incidentes', 'q03', 'Una notificación de brecha debe indicar qué ocurrió y qué datos se afectaron, pero no las medidas adoptadas.', false,
  'Falso: también debe incluir las <b>medidas adoptadas</b> y las recomendadas al titular, las consecuencias probables y un contacto.');
DEV('incidentes', 'r01', 'Se detecta que una cuenta de recepción descargó todas las fichas clínicas un domingo a las 3 AM. Explica qué harías en cada fase de respuesta.',
  '<b>Detección y análisis:</b> confirmar con los logs de auditoría qué se descargó, cuántos pacientes, desde qué IP y si sigue ocurriendo.<br><b>Contención:</b> bloquear la cuenta y cerrar sesiones, <b>preservando los logs</b> como evidencia.<br><b>Erradicación:</b> encontrar la causa (credenciales robadas, falta de MFA, permiso excesivo) y corregirla: rotar credenciales, quitar a recepción el acceso a fichas.<br><b>Recuperación:</b> volver a operar con normalidad vigilando.<br><b>Notificación:</b> es una brecha de confidencialidad de datos sensibles: informar a la autoridad y a los titulares (qué pasó, datos afectados, medidas, contacto).<br><b>Lecciones:</b> agregar alerta por descargas masivas y fuera de horario.',
  ['Analiza con los logs qué pasó y qué datos se afectaron', 'Contiene (bloquear la cuenta) preservando evidencia', 'Erradica la causa (credenciales, MFA, permisos)', 'Menciona la notificación a la autoridad o titulares', 'Propone una lección aprendida (alerta, mínimo privilegio)']);
DEV('incidentes', 'r02', 'Diseña el log de auditoría para el acceso a fichas clínicas en tu proyecto: qué registrarías, qué no y cómo lo protegerías.',
  '<b>Registrar (5 preguntas):</b> quién (usuario), qué acción (ver, editar, exportar), sobre qué (id de la ficha / paciente), cuándo y desde dónde (fecha, hora, IP), y resultado (éxito o denegado).<br><b>No registrar:</b> el contenido del diagnóstico, contraseñas ni tokens.<br><b>Proteger:</b> tabla o archivo de solo escritura, separado del sistema, acceso restringido, relojes sincronizados y retención definida.',
  ['Registra quién, qué acción y sobre qué dato', 'Registra cuándo, desde dónde y el resultado', 'No guarda contenido sensible ni contraseñas', 'Protege el log (solo escritura, acceso restringido, separado)']);

/* =================== PROYECTO INTEGRADOR =================== */
Q('proyecto', 's01', 'En el proyecto integrador, ¿qué se entregaba en el Hito 1?',
  ['Inventario de datos y tabla de decisión de cifrado y hashing por campo', 'Los mecanismos ARCO+ y el plan de respuesta a incidentes', 'Solo la defensa oral del proyecto completo ante la comisión evaluadora del curso', 'La matriz de roles RBAC y los textos de consentimiento'],
  'Cada hito cierra una unidad: Hito 1 cifrado; Hito 2 privacidad, acceso y consentimiento; Hito 3 derechos e incidentes.');
DEV('proyecto', 't01', 'Elige un principio legal (por ejemplo, minimización, seguridad o responsabilidad) y explica cómo lo implementó tu grupo en el proyecto.',
  'Estructura: <b>principio (definición) → norma → implementación → por qué</b>.<br>Ejemplo con <b>seguridad</b>: la Ley 21.719 exige medidas adecuadas al riesgo (y la 19.628, debida diligencia). Las fichas clínicas son datos sensibles de salud, así que el proyecto cifra esos campos con <b>AES-GCM</b>, con la llave en una variable de entorno fuera del repositorio, y guarda las contraseñas con <b>Argon2</b>. Así, si se filtra la base, los datos de salud siguen ilegibles y las contraseñas no se pueden recuperar.',
  ['Define el principio elegido', 'Lo relaciona con la ley (19.628 o 21.719)', 'Describe una implementación concreta del proyecto', 'Justifica por qué esa implementación cumple el principio']);
