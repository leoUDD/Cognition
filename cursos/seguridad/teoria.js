/* Teoría de Seguridad y Protección de Datos: taller práctico (sesiones 1 a 6), línea jurídica (Ley 19.628 y Ley 21.719) y proyecto integrador.
   Lo que no viene de las láminas está marcado como "Complemento". */

/* =====================================================================
   FUNDAMENTOS (sesión 1)
   ===================================================================== */
teoria.push({
  id: 'fundamentos', unidad: 'Taller · Sesión 1', titulo: 'Fundamentos de seguridad de la información',
  resumen: 'Activo, amenaza, vulnerabilidad y riesgo; triángulo CIA; autenticación y no repudio; panorama de ciberseguridad en Chile.',
  intro: `El curso une dos líneas: los <b>jueves</b> el abogado ve la ley y los <b>viernes</b> el taller la traduce a controles técnicos. La idea central: <b>no basta con conocer la ley, hay que saber construir sistemas que la cumplan</b>.`,
  sub: [
    {
      id: 'curso', titulo: 'Cómo funciona el curso', resumen: 'Línea jurídica + taller práctico + proyecto integrador.',
      idea: `Cada requisito legal se traduce en un <b>control técnico concreto</b>, y el proyecto integrador lo implementa en un mismo software durante todo el trimestre.`,
      tabla: { cols: ['', 'Jueves: marco jurídico', 'Viernes: taller práctico'], filas: [['Dicta', 'Docente abogado', 'Docente de informática'], ['Contenido', 'Principios, normativa y casos jurídicos', 'Laboratorios e implementación técnica'], ['Se evalúa con', 'La mitad jurídica de cada certamen', 'La mitad práctica de cada certamen']] },
      texto: `<p><b>Roles profesionales</b> que forma el curso: el <b>Oficial de Protección de Datos (DPO)</b>, que traduce requisitos legales en controles verificables; el <b>ingeniero de seguridad</b>, que diseña e implementa los controles; el <b>arquitecto de cumplimiento</b>, que diseña sistemas "compliant" desde el diseño; y el <b>desarrollador consciente de la privacidad</b>, que aplica minimización y buenas prácticas en cada línea de código.</p>
<p><b>Evaluación:</b> Certamen 1 (30 %), Certamen 2 (30 %) y examen final (40 %), cada uno 50 % jurídico y 50 % práctico. No hay eximición.</p>
<p><b>Proyecto integrador:</b> grupos de 2 a 3 personas, uno de 4 casos, y 3 hitos técnicos al cierre de cada unidad (semanas 3, 6 y 9), con defensa final en la semana 12.</p>`
    },
    {
      id: 'conceptos', titulo: 'Activo, amenaza, vulnerabilidad y riesgo', resumen: 'Los cuatro conceptos base del curso.',
      idea: `El <b>riesgo</b> aparece cuando una <b>amenaza</b> puede explotar una <b>vulnerabilidad</b> y dañar un <b>activo</b>.`,
      tabla: { cols: ['Concepto', 'Qué es', 'Ejemplo'], filas: [['Activo', 'Cualquier elemento de valor para la organización', 'La base de datos de pacientes'], ['Amenaza', 'Evento o agente que puede causar daño', 'Un atacante, un error humano, un desastre natural'], ['Vulnerabilidad', 'Debilidad que una amenaza puede explotar', 'Una contraseña débil, un software sin parchar'], ['Riesgo', 'Probabilidad de que una amenaza explote una vulnerabilidad, más el impacto sobre el activo', 'Que roben la base por una contraseña débil del administrador']] },
      ojo: [`No confundas <b>amenaza</b> (quién o qué puede atacar) con <b>vulnerabilidad</b> (la debilidad que se aprovecha). El atacante es una amenaza; la contraseña débil, una vulnerabilidad.`,
        `El riesgo tiene <b>dos</b> componentes: probabilidad e impacto.`]
    },
    {
      id: 'cia', titulo: 'El triángulo CIA', resumen: 'Confidencialidad, integridad y disponibilidad.',
      idea: `Todo control de seguridad protege al menos uno de tres atributos: <b>confidencialidad</b>, <b>integridad</b> o <b>disponibilidad</b>.`,
      tabla: { cols: ['Atributo', 'Qué garantiza', 'Control en el proyecto'], filas: [['Confidencialidad', 'Solo quienes están autorizados acceden a la información', 'Cifrado de campos sensibles, control de acceso por rol'], ['Integridad', 'Los datos no se alteran de forma indebida, accidental o maliciosa', 'Hashes, validaciones, control de versiones de los datos'], ['Disponibilidad', 'La información y los sistemas están accesibles cuando se necesitan', 'Respaldos, planes de continuidad, monitoreo']] },
      ejemplo: `Un ransomware que cifra la base de datos de un hospital ataca la <b>disponibilidad</b>. Que alguien cambie un diagnóstico sin permiso ataca la <b>integridad</b>. Que se filtre la ficha clínica ataca la <b>confidencialidad</b>.`,
      recuerda: `Las brechas se clasifican con el mismo triángulo: de confidencialidad, de integridad o de disponibilidad (sesión 6).`
    },
    {
      id: 'autenticacion', titulo: 'Autenticación y no repudio', resumen: 'Dos principios que complementan a CIA.',
      idea: `<b>Autenticación</b>: confirmar que alguien es quien dice ser. <b>No repudio</b>: que el autor de una acción no pueda negar haberla hecho.`,
      texto: `<p>CIA no basta para explicar todo lo que hay que garantizar:</p>
<ul><li><b>Autenticación:</b> antes de dar acceso, confirmar la identidad: contraseñas, MFA (segundo factor), biometría.</li>
<li><b>No repudio:</b> que la acción quede registrada de forma que su autor no pueda negarla: firmas digitales, logs de auditoría.</li></ul>`
    },
    {
      id: 'chile', titulo: 'Panorama de ciberseguridad en Chile', resumen: 'Cifras, casos reales y los patrones que se repiten.',
      idea: `La protección de datos es un problema urgente en Chile. Los incidentes repiten cuatro patrones: <b>terceros y proveedores</b>, <b>falta de segundo factor</b>, <b>credenciales comprometidas</b> y <b>falta de cifrado en reposo</b>.`,
      tabla: { titulo: 'Casos vistos en clase', cols: ['Año', 'Caso', 'Qué pasó'], filas: [['2018', 'Banco de Chile', 'Malware distractor en más de 9.000 PCs mientras se sustraían ~US$10M vía SWIFT'], ['2018', 'Banco Consorcio', 'Robo de ~US$2 millones'], ['2019', 'Redbanc', 'Filtración de 41.593 tarjetas vía un proveedor externo'], ['2021', 'Facebook', '~7 millones de registros de usuarios chilenos expuestos'], ['2026', 'ClaveÚnica', 'Filtración por credenciales comprometidas']] },
      texto: `<p><b>Cifras de la clase</b> (ilustrativas): 8,8 billones de intentos de ciberataque en 2025; el 60 % de los hospitales reportó brechas en 2024 (salud y finanzas son los sectores más golpeados); 22.473 incidentes gestionados por el CSIRT de Gobierno en 2021. El phishing es la amenaza que más ha crecido.</p>
<p>Chile tiene una <b>madurez normativa avanzada</b> (Ley 21.663, marco de ciberseguridad), pero su capacidad operativa es desigual: <b>se es más eficiente notificando que detectando</b> tempranamente.</p>`,
      recuerda: `"¿Qué tienen en común estos casos?" → terceros/proveedores (Redbanc), ausencia de MFA, credenciales robadas o reutilizadas (el vector más común hoy) y datos sin cifrar en reposo.`
    },
    {
      id: 'desarrollador', titulo: '¿Por qué le importa a un desarrollador?', resumen: 'El código es donde la ley se cumple o se incumple.',
      idea: `Un principio legal como "minimización" o "consentimiento revocable" <b>solo existe de verdad si está implementado</b> en el sistema.`,
      texto: `<ul><li><b>La seguridad técnica es evidencia de cumplimiento:</b> cifrado, control de acceso y logs de auditoría demuestran la "debida diligencia" que exige la ley.</li>
<li><b>Los incidentes tienen consecuencias legales:</b> una brecha mal gestionada implica sanciones, indemnizaciones y pérdida de confianza, no solo un bug.</li></ul>`
    }
  ]
});

/* =====================================================================
   LEY 19.628 (línea jurídica)
   ===================================================================== */
teoria.push({
  id: 'ley19628', unidad: 'Línea jurídica', titulo: 'Ley 19.628 (1999)',
  resumen: 'La ley original de protección de la vida privada: definiciones, principios, consentimiento, derechos, sanciones y sus falencias.',
  intro: `La <b>Ley 19.628</b> sobre protección de la vida privada (1999) fue la primera ley chilena de datos personales. La Ley 21.719 la reforma casi por completo, pero sus conceptos base siguen vigentes y se preguntan.`,
  sub: [
    {
      id: 'origen', titulo: 'Origen y fundamentos', resumen: 'Moción de 1993 y los instrumentos en que se inspiró.',
      idea: `Nace de una moción de <b>1993</b> del senador <b>Eugenio Cantuarias</b> y se publica en <b>1999</b>.`,
      texto: `<p>Se funda en:</p><ul><li>Declaración Universal de Derechos Humanos (1948).</li><li>Declaración Americana de los Derechos y Deberes del Hombre.</li><li>Pacto Internacional de Derechos Civiles y Políticos (1966).</li><li>Ley Orgánica 1/1982 española (derecho al honor, intimidad e imagen).</li><li>Ley de ficheros de Francia.</li></ul>`
    },
    {
      id: 'definiciones', titulo: 'Dato personal y dato sensible', resumen: 'Las dos categorías de datos de la ley.',
      idea: `<b>Dato personal</b>: información de una persona natural identificada o identificable. <b>Dato sensible</b>: el que se refiere a características físicas o morales, o a la vida privada e intimidad.`,
      texto: `<p><b>Datos sensibles</b> según la Ley 19.628: hábitos personales, origen racial, ideologías y opiniones políticas, creencias o convicciones religiosas, estados de salud físicos o psíquicos y vida sexual.</p>`,
      ojo: [`Solo protege a <b>personas naturales</b>: los datos de una empresa (persona jurídica) no son datos personales.`]
    },
    {
      id: 'principios', titulo: 'Principios y ámbito', resumen: 'Información y consentimiento, libertad, finalidad, seguridad y calidad.',
      idea: `Principios de la Ley 19.628: <b>información y consentimiento del titular</b>, <b>libertad de tratamiento</b>, <b>finalidad</b>, <b>seguridad</b> y <b>calidad de los datos</b>.`,
      texto: `<p><b>Ámbito (art. 1):</b> el tratamiento de datos en registros o bancos de datos, por organismos públicos o particulares, de forma automatizada o manual, por personas naturales o jurídicas. <b>Excepción:</b> el tratamiento hecho en ejercicio de las libertades de emitir opinión y de informar, que regula otra ley (art. 19 N° 12 de la Constitución).</p>`
    },
    {
      id: 'consentimiento', titulo: 'Fuentes del tratamiento y consentimiento (art. 4)', resumen: 'Solo con ley o con consentimiento expreso; y las excepciones de fuente pública.',
      idea: `Los datos solo se pueden tratar cuando <b>la ley lo autoriza</b> o el <b>titular consiente expresamente</b>. El consentimiento debe ser <b>informado, expreso, escrito y revocable</b>.`,
      texto: `<p><b>Excepciones al consentimiento (fuentes de acceso público):</b> no se requiere cuando los datos:</p>
<ol><li>son de carácter económico, financiero, bancario o comercial;</li>
<li>están en listados de una categoría de personas que se limitan a indicar antecedentes;</li>
<li>son necesarios para comunicaciones comerciales de respuesta directa o ventas directas;</li>
<li>los tratan personas jurídicas para uso exclusivo suyo, de sus asociados y afiliados, con fines estadísticos, de tarificación u otros de beneficio general.</li></ol>`,
      ojo: [`Una crítica a la ley es justamente la <b>gran cantidad de excepciones</b> al consentimiento.`]
    },
    {
      id: 'finalidad-calidad', titulo: 'Finalidad, calidad y datos sensibles (arts. 9 y 10)', resumen: 'Usar los datos solo para su fin, exactos y actualizados.',
      idea: `<b>Finalidad (art. 9):</b> los datos se usan solo para los fines con que se recolectaron (salvo fuente pública). <b>Calidad:</b> deben ser exactos, actualizados y veraces.`,
      texto: `<p><b>Art. 9 inciso final:</b> se prohíben las predicciones o evaluaciones de riesgo comercial que no se basen <b>únicamente en información objetiva</b> sobre morosidades o protestos. La infracción obliga a eliminar la información e indemnizar.</p>
<p><b>Datos sensibles (art. 10):</b> no pueden tratarse, salvo que (1) la ley lo autorice, (2) exista consentimiento del titular, o (3) sean necesarios para determinar u otorgar beneficios de salud a sus titulares.</p>`
    },
    {
      id: 'derechos', titulo: 'Derechos del titular', resumen: 'Información, modificación, cancelación y bloqueo: gratuitos e irrenunciables.',
      idea: `Los derechos son <b>gratuitos</b> y <b>no pueden limitarse por acto o convención</b>.`,
      tabla: { cols: ['Derecho', 'Cuándo procede'], filas: [['Información', 'Conocer la procedencia, destinatario, finalidad y con quién se comparten regularmente los datos'], ['Modificación', 'Cuando los datos son erróneos, inexactos, equívocos o incompletos'], ['Cancelación', 'Cuando el almacenamiento carece de fundamento legal, los datos caducaron, se dieron voluntariamente o se usan para comunicaciones comerciales'], ['Bloqueo', 'Cuando la exactitud no puede establecerse o la vigencia es dudosa, y no corresponde cancelar']] }
    },
    {
      id: 'sanciones', titulo: 'Infracciones y sanciones', resumen: 'Amparo ante el juez, multa de 2 a 50 UTM e indemnización.',
      idea: `Si el responsable no se pronuncia en <b>2 días</b>, el titular puede pedir amparo al <b>Juez de Letras en lo Civil</b>. Las sanciones son <b>multa de 2 a 50 UTM</b> e <b>indemnización</b> del daño patrimonial y moral.`,
      pasos: ['El titular pide información, modificación, cancelación o bloqueo al responsable.', 'Si el responsable no responde en 2 días hábiles (o lo rechaza), el titular recurre de amparo ante el Juez de Letras en lo Civil.', 'El juez puede ordenar cumplir y aplicar multa de 2 a 50 UTM.', 'Además, el responsable indemniza el daño patrimonial y moral causado por el tratamiento indebido.'],
      recuerda: `Compara: la Ley 21.719 sube las multas a hasta 20.000 UTM y crea una Agencia que fiscaliza. Con la 19.628 no había órgano fiscalizador.`
    },
    {
      id: 'economicos', titulo: 'Datos económicos, financieros y comerciales', resumen: 'Qué se puede comunicar y qué no se puede publicar.',
      idea: `Solo se pueden comunicar obligaciones que consten en <b>documentos protestados o incumplimientos</b> de créditos; y hay deudas que <b>nunca</b> se pueden publicar.`,
      texto: `<p><b>Se puede comunicar:</b> letras y pagarés protestados; cheques protestados (falta de fondos, cuenta cerrada u otra causa); incumplimientos de mutuos hipotecarios y créditos de bancos, financieras, cooperativas, organismos públicos y casas comerciales; y otras obligaciones de dinero que fije un decreto supremo, con consentimiento expreso del deudor.</p>
<p><b>No se pueden publicar:</b> deudas con empresas de servicios básicos; deudas con concesionarias de autopistas por uso de su infraestructura; deudas pagadas, prescritas o extinguidas; protestos y morosidades originados durante la <b>cesantía</b> del deudor.</p>`
    },
    {
      id: 'publicos', titulo: 'Organismos públicos y obligaciones del responsable', resumen: 'Tratamiento sin consentimiento en su competencia; secreto, diligencia y responsabilidad.',
      idea: `Los organismos públicos tratan datos <b>sin consentimiento</b>, pero solo en las materias de su competencia. Todo responsable tiene deber de <b>secreto</b>, de <b>debida diligencia</b> y de <b>responder por los daños</b>.`,
      texto: `<p><b>Organismos públicos:</b> solo en materias de su competencia; no requieren consentimiento; no pueden comunicar condenas o infracciones una vez prescrita la acción o cumplida la pena (salvo a tribunales u otros organismos públicos). El Registro Civil lleva un registro de los bancos de datos de organismos públicos.</p>
<p><b>Obligaciones del responsable:</b> <b>secreto</b> (art. 7), <b>cuidar los datos con la debida diligencia</b> (art. 11) y <b>responder de los daños y perjuicios</b> (arts. 11 y 23).</p>`,
      recuerda: `Los arts. 7 y 11 son los que la sesión de cifrado usa para justificar legalmente el cifrado: deber de secreto y de diligencia.`
    },
    {
      id: 'falencias', titulo: 'Falencias de la Ley 19.628', resumen: 'Por qué hacía falta una ley nueva.',
      idea: `La 19.628 no tenía quién la fiscalizara ni sanciones efectivas.`,
      texto: `<ul><li>Falta de un <b>órgano administrativo fiscalizador</b>.</li><li>Inexistencia de un procedimiento de reclamo idóneo.</li><li>Ausencia de un catálogo de infracciones y sanciones efectivas.</li><li>No regulaba la <b>transferencia internacional</b> de datos.</li><li>No exigía medidas de seguridad.</li><li>Demasiadas excepciones al consentimiento.</li><li>Sin normas precisas de responsabilidad civil extracontractual.</li><li>Sin tipos penales específicos.</li></ul>`,
      recuerda: `Cada falencia tiene su respuesta en la Ley 21.719: la Agencia (fiscalizador), el catálogo de infracciones, reglas de transferencia internacional y el deber de seguridad.`
    }
  ]
});

/* =====================================================================
   LEY 21.719 (línea jurídica)
   ===================================================================== */
teoria.push({
  id: 'ley21719', unidad: 'Línea jurídica', titulo: 'Ley 21.719 (2024)',
  resumen: 'La nueva ley: directrices OCDE, principios, responsable y encargado, datos sensibles, geolocalización, biométricos, niños y la Agencia.',
  intro: `La <b>Ley 21.719</b> regula la protección y el tratamiento de los datos personales y <b>crea la Agencia de Protección de Datos Personales</b>. Reforma casi por completo la Ley 19.628 siguiendo estándares internacionales (OCDE y el reglamento europeo).`,
  sub: [
    {
      id: 'ocde', titulo: 'Origen: directrices OCDE', resumen: 'Los principios internacionales que inspiran la ley.',
      idea: `El proyecto sigue las <b>directrices de la OCDE</b> sobre protección de datos y flujo transfronterizo.`,
      texto: `<p><b>Principios OCDE:</b> limitación de recogida, calidad de los datos, especificación del propósito (finalidad), limitación de uso, salvaguardia (seguridad), transparencia, participación individual (derechos ARCO) y responsabilidad.</p>
<p><b>Flujo transfronterizo</b> (datos que cruzan fronteras): asegurar que la transmisión sea segura e ininterrumpida, y no restringirla salvo que el país de destino no tenga una protección adecuada.</p>`
    },
    {
      id: 'principios', titulo: 'Principios de la Ley 21.719', resumen: 'Licitud, finalidad, proporcionalidad, calidad, seguridad, responsabilidad e información.',
      idea: `Principios del proyecto vistos en clase: <b>licitud</b> del tratamiento, <b>finalidad</b>, <b>proporcionalidad</b>, <b>calidad</b>, <b>seguridad</b>, <b>responsabilidad</b> e <b>información</b>.`,
      tabla: { cols: ['Principio', 'En una frase', 'Cómo se ve en el sistema'], filas: [['Licitud', 'Tratar datos solo con una base legal (ley, consentimiento u otra)', 'Registrar la base de cada tratamiento'], ['Finalidad', 'Usar los datos solo para fines determinados y explícitos', 'No reutilizar datos para otro fin sin base'], ['Proporcionalidad', 'Solo los datos necesarios, por el tiempo necesario', 'Minimización y plazos de conservación'], ['Calidad', 'Datos exactos y actualizados', 'Rectificación y validaciones'], ['Seguridad', 'Medidas adecuadas al riesgo', 'Cifrado, control de acceso, respaldos'], ['Responsabilidad', 'El responsable debe cumplir y poder demostrarlo', 'Logs de auditoría, documentación'], ['Información (transparencia)', 'El titular sabe qué se hace con sus datos', 'Política de privacidad y textos de consentimiento']] },
      texto: `<p><i>Complemento:</i> el texto final de la ley agrega el principio de <b>confidencialidad</b>, con lo que suman ocho.</p>`
    },
    {
      id: 'sujetos', titulo: 'Ámbito, responsable y encargado', resumen: 'A quién se aplica y quién decide sobre los datos.',
      idea: `<b>Responsable</b>: quien <b>decide</b> sobre el tratamiento. <b>Encargado</b>: quien trata los datos <b>por cuenta</b> del responsable.`,
      texto: `<p><b>Ámbito:</b> todo tratamiento de datos personales que realicen personas naturales o jurídicas, incluidos los órganos públicos, que no esté regido por una ley especial. Para los tratamientos regulados en leyes especiales, esta ley es <b>supletoria</b>.</p>
<p><b>Responsable:</b> persona natural o jurídica, pública o privada, a quien compete decidir sobre el tratamiento, con independencia de si lo hace directamente o a través de un tercero, y de su localización.</p>`,
      ejemplo: `En tu proyecto, el <b>centro médico</b> es el responsable; un servicio de nube que aloja la base de datos sería un <b>encargado</b>.`
    },
    {
      id: 'datos', titulo: 'Dato personal y datos sensibles', resumen: 'Identificable directa o indirectamente; la lista ampliada de datos sensibles.',
      idea: `Es identificable quien puede ser identificado <b>directa o indirectamente</b> (nombre, RUT, elementos físicos, genéticos, económicos…), salvo que el esfuerzo sea <b>desproporcionado</b>.`,
      texto: `<p><b>Datos sensibles</b> en la Ley 21.719: origen étnico o racial; afiliación política, sindical o gremial; hábitos personales; convicciones ideológicas o filosóficas; creencias religiosas; datos de <b>salud</b>; <b>perfil biológico</b> humano (genéticos, proteómicos, metabólicos); datos <b>biométricos</b>; vida sexual, orientación sexual e identidad de género.</p>
<p>En clase se destacan además los datos de <b>geolocalización o movilidad</b>, que tienen reglas propias.</p>`,
      ojo: [`Comparado con la 19.628, la lista nueva agrega afiliación sindical/gremial, perfil biológico, biométricos, orientación sexual e identidad de género.`]
    },
    {
      id: 'geo-bio', titulo: 'Geolocalización y biométricos', resumen: 'Consentimiento inequívoco y deber de informar.',
      idea: `La <b>geolocalización</b> requiere consentimiento <b>inequívoco</b>. Los <b>biométricos</b> son datos sensibles y exigen informar qué sistema se usa, para qué, por cuánto tiempo y cómo ejercer derechos.`,
      tabla: { cols: ['', 'Geolocalización o movilidad', 'Biométricos'], filas: [['Qué son', 'Datos de ubicación del titular', 'Datos de características físicas, fisiológicas o conductuales que identifican a una persona (huella, iris, rostro, voz)'], ['Base', 'Consentimiento inequívoco', 'Consentimiento (dato sensible), salvo las excepciones legales'], ['Deber de informar', 'Tipo de datos, finalidad, duración y si se cederán a un tercero', 'Sistema biométrico usado, finalidad, período de uso y cómo ejercer derechos']] }
    },
    {
      id: 'nna', titulo: 'Niños, niñas y adolescentes', resumen: 'Interés superior, autonomía progresiva, y la línea de los 14 años.',
      idea: `Los datos de menores se tratan atendiendo a su <b>interés superior</b> y su <b>autonomía progresiva</b>. Bajo 14 años, consiente quien tiene su <b>cuidado personal</b>.`,
      tabla: { cols: ['', 'Niños y niñas (menores de 14)', 'Adolescentes (14 a 18)'], filas: [['Regla', 'Consentimiento específico, expreso y previo de quien tiene su cuidado personal (salvo que la ley autorice otra cosa)', 'Regla general de datos personales'], ['Excepción', '—', 'Datos sensibles: tratamiento reforzado']] },
      texto: `<p><b>Autonomía progresiva:</b> a medida que el niño desarrolla sus capacidades, toma control sobre más ámbitos y puede decidir cuándo y cómo ejercer sus derechos. Funciona como un límite a la autoridad de los padres: los niños son sujetos de derechos distintos de sus progenitores.</p>
<p><b>Obligación especial</b> de establecimientos educacionales y de toda entidad que trate datos de menores (incluidos sus cuidadores): velar por el uso lícito y la protección de esa información.</p>`
    },
    {
      id: 'agencia', titulo: 'Agencia, sanciones y vigencia (complemento)', resumen: 'Lo que la ley crea para que se cumpla.',
      idea: `<i>Complemento, no está en las láminas.</i> La ley crea la <b>Agencia de Protección de Datos Personales</b>, clasifica las infracciones en <b>leves, graves y gravísimas</b> y entra en vigencia el <b>1 de diciembre de 2026</b>.`,
      texto: `<ul><li><b>Publicación:</b> 13 de diciembre de 2024. <b>Vigencia:</b> el primer día del mes 24 tras su publicación (1 de diciembre de 2026).</li>
<li><b>La Agencia:</b> organismo autónomo que fiscaliza, sanciona, resuelve reclamos de los titulares y administra el Registro Nacional de Sanciones y Cumplimiento. Responde a la falencia de la 19.628: no había fiscalizador.</li>
<li><b>Multas:</b> leves hasta 5.000 UTM, graves hasta 10.000 UTM y gravísimas hasta 20.000 UTM; en reincidencia pueden calcularse como un porcentaje de los ingresos anuales.</li>
<li><b>Derechos:</b> ARCO más portabilidad y bloqueo (y el derecho frente a decisiones automatizadas). Respuesta en 30 días corridos, prorrogables una vez.</li>
<li><b>Brechas:</b> el responsable debe informar a la Agencia las vulneraciones de seguridad que representen riesgo, por los medios más expeditos posibles; los plazos exactos los ve la línea jurídica.</li>
<li><b>Contexto:</b> la Ley 21.096 (2018) elevó la protección de datos a garantía constitucional (art. 19 N° 4).</li></ul>`
    },
    {
      id: 'comparacion', titulo: 'Ley 19.628 vs Ley 21.719', comparacion: true, resumen: 'Qué cambia con la ley nueva.',
      idea: `La 21.719 mantiene la base de la 19.628, pero agrega <b>quién fiscaliza</b>, <b>sanciones reales</b>, <b>más derechos</b> y más categorías de datos sensibles.`,
      tabla: { cols: ['', 'Ley 19.628 (1999)', 'Ley 21.719 (2024)'], filas: [['Nombre', 'Protección de la vida privada', 'Protección de los datos personales'], ['Fiscalizador', 'No hay (amparo ante juez civil)', 'Agencia de Protección de Datos Personales'], ['Sanciones', 'Multa de 2 a 50 UTM e indemnización', 'Leves, graves y gravísimas: hasta 20.000 UTM'], ['Derechos', 'Información, modificación, cancelación, bloqueo', 'ARCO + portabilidad, bloqueo y decisiones automatizadas'], ['Datos sensibles', 'Hábitos, raza, ideologías, religión, salud, vida sexual', 'Se agregan perfil biológico, biométricos, afiliación sindical, orientación sexual, identidad de género'], ['Consentimiento', 'Informado, expreso, escrito, revocable; muchas excepciones', 'Más exigente; reglas especiales para geolocalización, biométricos y menores'], ['Transferencia internacional', 'No regulada', 'Regulada'], ['Seguridad', 'No exigía medidas', 'Principio de seguridad y deber de reportar brechas']] }
    }
  ]
});

/* =====================================================================
   CIFRADO (sesión 2)
   ===================================================================== */
teoria.push({
  id: 'cifrado', unidad: 'Taller · Sesión 2', titulo: 'Cifrado, hashing y tokenización',
  resumen: 'Qué técnica usar para cada dato, simétrico vs asimétrico, hashing de contraseñas, gestión de llaves y la cadena de decisión documentada.',
  intro: `Cifrar es la medida técnica más directa para cumplir el deber de <b>secreto</b> y <b>debida diligencia</b>. Pero no todo dato se protege igual: la clave es elegir la técnica correcta y <b>justificarla</b>.`,
  sub: [
    {
      id: 'definiciones', titulo: 'Definiciones básicas', resumen: 'Texto plano, texto cifrado, algoritmo y llave.',
      idea: `Cifrar = transformar <b>texto plano</b> en <b>texto cifrado</b> con un <b>algoritmo</b> y una <b>llave</b>. Sin la llave, el texto cifrado no se puede leer.`,
      tabla: { cols: ['Término', 'Qué es'], filas: [['Texto plano (plaintext)', 'El dato original, legible'], ['Texto cifrado (ciphertext)', 'El dato transformado, ilegible sin la llave'], ['Algoritmo', 'El procedimiento matemático (AES, RSA…); es público'], ['Llave', 'El secreto que permite cifrar y descifrar; si se filtra, el cifrado no sirve']] },
      ojo: [`La seguridad está en la <b>llave</b>, no en esconder el algoritmo. Por eso nunca hay que inventar algoritmos propios.`]
    },
    {
      id: 'tecnicas', titulo: 'Cifrado vs hashing vs tokenización', comparacion: true, resumen: 'La pregunta clave: ¿necesito recuperar el dato original?',
      idea: `<b>Cifrado</b> es reversible con la llave. <b>Hashing</b> es irreversible. <b>Tokenización</b> reemplaza el dato por un token y guarda el original en una bóveda aparte.`,
      tabla: { cols: ['', 'Cifrado', 'Hashing', 'Tokenización'], filas: [['¿Se recupera el original?', 'Sí, con la llave', 'No (una sola vía)', 'Sí, consultando la bóveda'], ['Para qué sirve', 'Proteger datos que se deben volver a leer', 'Verificar sin guardar el dato (contraseñas, integridad)', 'Que el sistema opere sin tocar el dato real'], ['Ejemplo', 'Ficha clínica, diagnóstico', 'Contraseña de usuario', 'Número de tarjeta de crédito']] },
      recuerda: `Pregunta que decide: <b>¿necesito volver a leer el dato?</b> Sí → cifrado (o tokenización si es muy crítico y lo maneja un tercero). No, solo comparar → hashing.`
    },
    {
      id: 'donde', titulo: 'Dónde cifrar: reposo, tránsito y uso', resumen: 'Los tres estados del dato.',
      idea: `Un dato debe protegerse <b>en reposo</b> (guardado), <b>en tránsito</b> (viajando por la red) y <b>en uso</b> (en memoria, siendo procesado).`,
      tabla: { cols: ['Estado', 'Dónde está', 'Cómo se protege'], filas: [['En reposo', 'Base de datos, disco, respaldos', 'Cifrado de campos o de disco (AES)'], ['En tránsito', 'Viajando entre cliente y servidor', 'TLS / HTTPS'], ['En uso', 'En memoria mientras se procesa', 'Es el más difícil: minimizar exposición, control de acceso, enclaves seguros']] },
      ojo: [`"Uso" es el estado más difícil de proteger: para procesar un dato, normalmente hay que descifrarlo.`]
    },
    {
      id: 'por-que', titulo: '¿Por qué cifrar?', resumen: 'Razones legales, técnicas y de negocio.',
      idea: `Cifrar se justifica por tres razones: <b>legal</b> (cumplir la ley), <b>técnica</b> (defensa en profundidad) y de <b>negocio</b> (confianza y menor costo de una brecha).`,
      texto: `<ul><li><b>Legal:</b> Ley 19.628 arts. 7 (secreto) y 11 (debida diligencia); Ley 21.719 exige medidas de seguridad <b>adecuadas al riesgo</b>. La ley no dice "usa AES-256": exige protección proporcional, y tú decides y justificas la técnica.</li>
<li><b>Técnica:</b> defensa en profundidad. Si un atacante entra a la base de datos, los campos cifrados siguen siendo ilegibles.</li>
<li><b>Negocio:</b> confianza de los clientes y menor impacto si hay brecha (datos cifrados con llaves bien guardadas no se pueden leer).</li></ul>`
    },
    {
      id: 'simetrico', titulo: 'Simétrico, asimétrico e híbrido', comparacion: true, resumen: 'AES vs RSA/ECC, y cómo TLS combina ambos.',
      idea: `<b>Simétrico</b>: una misma llave cifra y descifra (rápido). <b>Asimétrico</b>: par de llaves pública/privada (lento, pero resuelve el intercambio de llaves). <b>Híbrido</b>: usa asimétrico para acordar una llave y simétrico para los datos (así funciona TLS).`,
      tabla: { cols: ['', 'Simétrico', 'Asimétrico'], filas: [['Llaves', 'Una sola llave compartida', 'Par: pública (cifra) y privada (descifra)'], ['Algoritmos', 'AES (estándar actual); 3DES es legado', 'RSA, ECC (curvas elípticas)'], ['Velocidad', 'Rápido, sirve para grandes volúmenes', 'Lento'], ['Problema', '¿Cómo comparto la llave de forma segura?', 'Muy lento para cifrar datos grandes'], ['Uso típico', 'Cifrar campos en la base de datos', 'Intercambiar llaves, firmas digitales']] },
      ejemplo: `En tu proyecto, los campos sensibles se cifran con <b>AES-GCM</b> (simétrico) y la comunicación con el navegador viaja por <b>HTTPS</b> (híbrido).`
    },
    {
      id: 'hashing', titulo: 'Hashing: integridad y contraseñas', resumen: 'SHA-256 para integridad; bcrypt o Argon2 para contraseñas.',
      idea: `Un hash es una "huella" de tamaño fijo que no se puede revertir. <b>SHA-256</b> sirve para integridad; para contraseñas se usan funciones <b>lentas y con sal</b>: <b>bcrypt</b> o <b>Argon2</b>.`,
      texto: `<p><b>¿Por qué no SHA-256 para contraseñas?</b> Porque es muy rápido: un atacante puede probar miles de millones de contraseñas por segundo. bcrypt y Argon2 son <b>lentos a propósito</b> y usan <b>sal</b> (un valor aleatorio por usuario), así dos usuarios con la misma contraseña tienen hashes distintos.</p>
<p><b>Cómo se verifica un login:</b> se calcula el hash de la contraseña ingresada y se compara con el guardado. Nunca se "descifra" la contraseña.</p>`,
      ojo: [`Error típico: <b>"cifrar" contraseñas</b>. Si la contraseña está cifrada, alguien con la llave la puede leer. Las contraseñas se <b>hashean</b>.`]
    },
    {
      id: 'tokenizacion', titulo: 'Tokenización', resumen: 'Reemplazar el dato por un token sin valor.',
      idea: `El dato real se guarda en una <b>bóveda</b> (vault) separada y el sistema trabaja con un <b>token</b> que no revela nada.`,
      texto: `<p>A diferencia del cifrado, el token <b>no se calcula</b> a partir del dato: es un valor aleatorio, y la relación token ↔ dato solo existe en la bóveda. Así se reduce el alcance: los sistemas que solo ven tokens no manejan el dato sensible.</p>`,
      ejemplo: `Pagos con tarjeta: tu sistema guarda <code>tok_8f3a…</code>; el número real lo guarda el proveedor de pagos. Si roban tu base de datos, los tokens no sirven.`
    },
    {
      id: 'llaves', titulo: 'Gestión de llaves', resumen: 'Cifrar bien no sirve si la llave está mal guardada.',
      idea: `La llave es el punto más débil. Nunca junto a los datos ni en el código.`,
      texto: `<ul><li><b>Nunca junto a los datos:</b> si roban la base y la llave está ahí, el cifrado no sirvió.</li>
<li><b>Nunca en el código</b> (hardcodeada en el repositorio): usar variables de entorno (<code>.env</code> fuera del repositorio) o un gestor de secretos.</li>
<li><b>Rotación</b> periódica de llaves.</li>
<li><b>Separación</b>: llaves distintas para distintos propósitos.</li>
<li><b>Acceso mínimo</b> a las llaves y <b>auditoría</b> de quién las usa.</li></ul>`,
      ojo: [`Errores típicos de la clase: "cifrar" contraseñas, llaves hardcodeadas, inventar algoritmos propios y usar la misma técnica para todo.`]
    },
    {
      id: 'decision', titulo: 'La cadena de decisión documentada', resumen: 'Dato → necesidad → técnica → herramienta → llaves → evidencia.',
      idea: `Cada decisión de protección se documenta con una cadena: <b>dato → necesidad → técnica → herramienta → gestión de llaves → evidencia</b>.`,
      tabla: { titulo: 'Ejemplos de la clase', cols: ['Dato', '¿Se necesita leer?', 'Técnica', 'Herramienta'], filas: [['Ficha clínica', 'Sí, el médico la lee', 'Cifrado simétrico', 'AES'], ['Contraseña', 'No, solo verificar', 'Hashing lento con sal', 'bcrypt / Argon2'], ['Tarjeta de crédito', 'No la necesita el sistema', 'Tokenización', 'Proveedor de pagos'], ['Comunicación web', 'Sí, en tránsito', 'Cifrado híbrido', 'TLS / HTTPS']] },
      recuerda: `El entregable de la sesión es una <b>tabla por campo</b> con esta cadena. La "evidencia" es lo que demuestra que el control existe (código, prueba, captura).`
    }
  ]
});

/* =====================================================================
   PRIVACIDAD DESDE EL DISEÑO (sesiones 3 y 4)
   ===================================================================== */
teoria.push({
  id: 'privacidad', unidad: 'Taller · Sesiones 3 y 4', titulo: 'Privacidad desde el diseño y control de acceso',
  resumen: 'Los 7 principios, privacidad por defecto, minimización, seudonimización vs anonimización, mínimo privilegio y RBAC.',
  intro: `La privacidad no se agrega al final: se <b>diseña desde el inicio</b>, en el esquema de la base de datos, en las APIs y en los permisos.`,
  sub: [
    {
      id: 'pbd', titulo: 'Privacidad desde el diseño: 7 principios', resumen: 'Proactivo, por defecto, incrustado, suma positiva, ciclo completo, transparencia, centrado en el usuario.',
      idea: `<b>Privacy by design</b>: la privacidad se incorpora en el sistema desde su concepción, no como parche.`,
      tabla: { cols: ['#', 'Principio', 'Qué significa'], filas: [['1', 'Proactivo, no reactivo', 'Prevenir antes de que ocurra el problema'], ['2', 'Privacidad por defecto', 'La opción más privada viene activada sin que el usuario haga nada'], ['3', 'Incrustada en el diseño', 'Parte de la arquitectura, no un agregado'], ['4', 'Funcionalidad total (suma positiva)', 'Privacidad y funcionalidad no se excluyen'], ['5', 'Seguridad de extremo a extremo', 'Protección durante todo el ciclo de vida del dato'], ['6', 'Visibilidad y transparencia', 'Se puede verificar qué se hace con los datos'], ['7', 'Respeto por el usuario', 'Centrado en los intereses del titular']] }
    },
    {
      id: 'defecto', titulo: 'Privacidad por defecto', resumen: 'La configuración inicial debe ser la más protectora.',
      idea: `Si el usuario no toca nada, el sistema debe tratar <b>el mínimo de datos</b> con la <b>menor exposición</b>.`,
      texto: `<p>Es el principio 2 de la privacidad desde el diseño llevado a la configuración: el usuario no tiene que "defenderse" del sistema; si quiere compartir más, lo activa él.</p>`,
      ejemplo: `Perfil privado por defecto; casillas de marketing <b>desmarcadas</b>; compartir ubicación desactivado hasta que el usuario lo active.`
    },
    {
      id: 'minimizacion', titulo: 'Minimización en el esquema y en las APIs', resumen: 'Recolectar y exponer solo lo necesario.',
      idea: `<b>Minimización</b>: solo los datos <b>necesarios para la finalidad</b>. Se aplica en la base de datos (qué columnas existen) y en las APIs (qué campos se devuelven).`,
      texto: `<ul><li><b>En el esquema:</b> por cada campo preguntar "¿para qué lo necesito?". Si no hay finalidad, no se recolecta. Ejemplo FitClub: fecha de nacimiento completa vs solo verificar mayoría de edad.</li>
<li><b>En las APIs:</b> usar <b>DTOs</b> (objetos de respuesta) que devuelven solo los campos necesarios, no el modelo completo.</li>
<li><b>No poner datos sensibles en URLs</b> (quedan en logs, historial y caché).</li>
<li><b>No registrar datos sensibles en logs.</b></li></ul>`,
      recuerda: `Un dato que no recolectas es un dato que no te pueden robar.`
    },
    {
      id: 'seudo-anon', titulo: 'Seudonimización vs anonimización', comparacion: true, resumen: 'Reversible con información adicional vs irreversible.',
      idea: `<b>Seudonimizar</b>: reemplazar identificadores por seudónimos; se puede reidentificar con información adicional guardada aparte, así que <b>sigue siendo dato personal</b>. <b>Anonimizar</b>: de forma irreversible; <b>deja de ser dato personal</b>.`,
      tabla: { cols: ['', 'Seudonimización', 'Anonimización'], filas: [['¿Reversible?', 'Sí, con la tabla de correspondencia o la llave', 'No'], ['¿Sigue siendo dato personal?', 'Sí, aplica la ley', 'No'], ['Técnicas', 'Seudónimo, hash con sal / HMAC', 'Supresión, generalización, agregación'], ['Cuándo usar', 'Procesos internos que luego necesitan volver a la persona', 'Estadísticas, publicación, investigación']] },
      texto: `<p><b>Riesgo de reidentificación:</b> los <b>cuasi-identificadores</b> (fecha de nacimiento, comuna, sexo) combinados pueden identificar a alguien aunque no esté el nombre. Por eso se generaliza (edad en rangos, región en vez de dirección) o se agrega.</p>`,
      ojo: [`Quitar el nombre <b>no</b> es anonimizar si quedan cuasi-identificadores que permiten reidentificar.`]
    },
    {
      id: 'authz', titulo: 'Autenticación vs autorización', resumen: '¿Quién eres? vs ¿qué puedes hacer?',
      idea: `<b>Autenticación</b>: verificar la identidad. <b>Autorización</b>: decidir qué puede hacer esa identidad.`,
      tabla: { cols: ['', 'Autenticación', 'Autorización'], filas: [['Pregunta', '¿Quién eres?', '¿Qué puedes hacer?'], ['Ocurre', 'Primero (login)', 'Después, en cada acción'], ['Ejemplo', 'Contraseña + segundo factor', 'Solo el médico tratante ve la ficha']] }
    },
    {
      id: 'rbac', titulo: 'Mínimo privilegio, separación de funciones y RBAC', resumen: 'Cada rol accede solo a lo que necesita.',
      idea: `<b>Mínimo privilegio</b>: cada usuario tiene solo los permisos necesarios para su trabajo. <b>Separación de funciones</b>: ninguna persona controla sola un proceso crítico. <b>RBAC</b>: los permisos se asignan a <b>roles</b>, y los usuarios reciben roles.`,
      tabla: { titulo: 'Ejemplo de matriz de roles (FitClub)', cols: ['Rol', 'Datos de contacto', 'Datos de salud', 'Pagos'], filas: [['Recepción', 'Ver', '—', 'Ver estado'], ['Entrenador', 'Ver', 'Ver de sus alumnos', '—'], ['Administración', 'Ver/editar', '—', 'Ver/editar'], ['Socio', 'Los suyos', 'Los suyos', 'Los suyos']] },
      ojo: [`Errores típicos: un rol "admin" que ve todo; validar permisos solo en el frontend (ocultar el botón no es control de acceso); no revisar permisos de usuarios que cambiaron de cargo.`],
      recuerda: `El permiso se valida <b>en el servidor</b>, en cada petición.`
    }
  ]
});

/* =====================================================================
   CONSENTIMIENTO (sesión 4)
   ===================================================================== */
teoria.push({
  id: 'consentimiento', unidad: 'Taller · Sesión 4', titulo: 'Consentimiento en el sistema',
  resumen: 'Informado, expreso, escrito y revocable llevados a código: registro, granularidad por finalidad, revocación y menores.',
  intro: `La ley dice que el consentimiento debe ser <b>informado, expreso, escrito y revocable</b>. El taller responde: ¿cómo se ve eso en la base de datos y en la interfaz?`,
  sub: [
    {
      id: 'requisitos', titulo: 'De la ley al sistema', resumen: 'Cada requisito legal se traduce en una función.',
      idea: `Cada adjetivo de la ley se convierte en una característica del sistema.`,
      tabla: { cols: ['Requisito legal', 'Cómo se implementa'], filas: [['Informado', 'Texto claro de la finalidad antes de aceptar, con versión del texto'], ['Expreso', 'Acción afirmativa: casilla desmarcada que el usuario marca (no pre-marcada, no "al usar aceptas")'], ['Escrito', 'Registro persistente y verificable en la base de datos'], ['Revocable', 'Botón para retirar el consentimiento, tan fácil como darlo']] }
    },
    {
      id: 'registro', titulo: 'Qué registrar', resumen: 'El consentimiento es una evidencia, no un booleano.',
      idea: `Para poder <b>demostrar</b> el consentimiento se guarda un registro, no solo <code>acepto = true</code>.`,
      texto: `<p>Guardar: <b>quién</b> (titular), <b>para qué finalidad</b>, <b>qué versión del texto</b> aceptó, <b>cuándo</b> (fecha y hora), <b>por qué medio</b>, y si se <b>revocó</b> y cuándo.</p>`,
      ejemplo: `Tabla <code>consentimiento(id, titular_id, finalidad, version_texto, otorgado_en, revocado_en)</code>. Revocar no borra la fila: llena <code>revocado_en</code>, así queda la evidencia.`
    },
    {
      id: 'granular', titulo: 'Granularidad por finalidad', resumen: 'Un consentimiento por cada propósito.',
      idea: `No vale un "acepto todo". Cada <b>finalidad</b> distinta (servicio, marketing, compartir con terceros) tiene su propio consentimiento.`,
      texto: `<p>En la base de datos: una fila de consentimiento <b>por titular y por finalidad</b>. En la interfaz: una casilla por finalidad, todas desmarcadas salvo las estrictamente necesarias para prestar el servicio (que en realidad se basan en el contrato, no en el consentimiento).</p>`,
      ejemplo: `ClubLector: "usar mis datos para préstamos" (necesario para el servicio), "enviarme recomendaciones" y "compartir con editoriales" son tres consentimientos separados. Rechazar el marketing no impide usar el servicio.`
    },
    {
      id: 'revocacion', titulo: 'Revocación', resumen: 'Retirar el consentimiento es un derecho y debe tener efecto real.',
      idea: `Al revocar, el sistema debe <b>dejar de tratar</b> los datos para esa finalidad desde ese momento (no tiene efecto retroactivo sobre lo ya hecho).`,
      texto: `<p>El código que usa datos para una finalidad debe <b>consultar el consentimiento vigente</b> antes de actuar (por ejemplo, antes de enviar un correo de marketing).</p>`
    },
    {
      id: 'menores', titulo: 'Consentimiento de menores', resumen: 'Bajo 14 años consiente quien tiene el cuidado personal.',
      idea: `Si el titular tiene <b>menos de 14 años</b>, el consentimiento lo da quien tiene su <b>cuidado personal</b>. Entre 14 y 18 rige la regla general, salvo datos sensibles.`,
      texto: `<p>En el sistema: pedir la fecha de nacimiento (o verificar edad), y si es menor de 14, registrar el consentimiento del adulto responsable y su relación con el menor.</p>`
    }
  ]
});

/* =====================================================================
   DERECHOS DEL TITULAR (sesiones 4 y 5)
   ===================================================================== */
teoria.push({
  id: 'derechos', unidad: 'Taller · Sesiones 4 y 5', titulo: 'Derechos del titular (ARCO+) y sus mecanismos',
  resumen: 'Acceso, rectificación, supresión, oposición, portabilidad y bloqueo: el ciclo de una solicitud y cómo implementar cada derecho.',
  intro: `Los derechos solo existen si el sistema permite ejercerlos. Esta sesión diseña el <b>mecanismo</b>: canal, verificación de identidad, localización de los datos, ejecución y respuesta dentro de plazo.`,
  sub: [
    {
      id: 'arco', titulo: 'Los derechos ARCO+', resumen: 'Qué permite cada uno.',
      idea: `<b>ARCO</b> = Acceso, Rectificación, Cancelación (supresión), Oposición; el "+" agrega <b>portabilidad</b> y <b>bloqueo</b>. Son gratuitos y no se pueden limitar por contrato.`,
      tabla: { cols: ['Derecho', 'El titular puede…'], filas: [['Acceso', 'Saber qué datos suyos se tratan, de dónde vienen, para qué y con quién se comparten'], ['Rectificación', 'Corregir datos inexactos o incompletos'], ['Supresión', 'Pedir que se eliminen sus datos'], ['Oposición', 'Oponerse a un tratamiento específico (por ejemplo, marketing)'], ['Portabilidad', 'Recibir sus datos en formato estructurado para llevarlos a otro servicio'], ['Bloqueo', 'Suspender temporalmente el tratamiento mientras se resuelve algo']] }
    },
    {
      id: 'ciclo', titulo: 'Ciclo de una solicitud', resumen: 'Recibida → en verificación → en ejecución → respondida (o rechazada/parcial).',
      idea: `Cada solicitud es un registro con <b>estado</b> y <b>plazo</b>.`,
      pasos: ['<b>Recibida:</b> llega por un canal accesible (formulario, correo); se registra con fecha y se calcula el plazo.', '<b>En verificación:</b> se confirma que quien pide es el titular (o su representante).', '<b>En ejecución:</b> se localizan los datos en todos los lugares y se aplica el derecho.', '<b>Respondida:</b> se comunica el resultado al titular. Si no procede, queda <b>rechazada</b> o <b>parcial</b>, con fundamento.'],
      texto: `<p><b>Plazos:</b> guardar la fecha límite y generar alertas antes de que venza. <i>Complemento:</i> la Ley 21.719 fija 30 días corridos, prorrogables una vez.</p>`
    },
    {
      id: 'identidad', titulo: 'Verificar identidad y localizar los datos', resumen: 'Proporcional al riesgo; buscar en todas partes.',
      idea: `La verificación debe ser <b>proporcional</b>: no pedir más datos de los que ya tienes. Y los datos hay que buscarlos <b>en todos lados</b>.`,
      texto: `<p><b>Verificar:</b> sesión iniciada + segundo factor, confirmación al contacto registrado, o preguntas sobre datos que ya existen. Si actúa un <b>representante</b>, verificar el poder o la relación.</p>
<p><b>Localizar:</b> tablas principales, adjuntos y archivos, respaldos y cachés, y datos enviados a <b>terceros</b> (encargados). Tener un <b>identificador único</b> del titular facilita encontrar todo.</p>`
    },
    {
      id: 'acceso-port', titulo: 'Acceso y portabilidad', resumen: 'Qué se entrega y en qué formato.',
      idea: `<b>Acceso</b>: los datos, su origen, la finalidad, los destinatarios y el plazo de conservación. <b>Portabilidad</b>: los datos en formato estructurado y legible por máquina.`,
      texto: `<ul><li>Formato: <b>JSON o CSV</b>.</li><li>Entrega por un <b>enlace temporal de un solo uso</b>.</li><li>Si contiene datos sensibles, el archivo va <b>cifrado</b>.</li></ul>`
    },
    {
      id: 'rect-sup', titulo: 'Rectificación y supresión', resumen: 'Registrar el cambio; borrado lógico vs físico; retención legal.',
      idea: `<b>Rectificar</b> deja registro del valor anterior y nuevo y de quién lo cambió. <b>Suprimir</b> puede ser lógico o físico, y debe propagarse.`,
      tabla: { cols: ['', 'Borrado lógico', 'Borrado físico'], filas: [['Qué hace', 'Marca el registro como eliminado (flag)', 'Elimina el registro de la base'], ['¿El dato sigue existiendo?', 'Sí', 'No'], ['Ventaja', 'Reversible, mantiene integridad referencial', 'Cumple realmente la supresión'], ['Riesgo', 'Si no se excluye en todas las consultas, el dato "eliminado" sigue apareciendo', 'Romper relaciones; olvidar respaldos y terceros']] },
      texto: `<p><b>Propagación:</b> la supresión debe llegar a respaldos, cachés y terceros. <b>Retención legal:</b> si una ley obliga a conservar el dato (por ejemplo, la ficha clínica), no se borra: se <b>bloquea</b> y se informa al titular el motivo.</p>`
    },
    {
      id: 'oposicion-bloqueo', titulo: 'Oposición y bloqueo', resumen: 'Excluir de una finalidad; suspender el tratamiento.',
      idea: `<b>Oposición</b>: un flag de exclusión <b>por finalidad</b>; a diferencia de la revocación, procede aunque la base no sea el consentimiento. <b>Bloqueo</b>: un estado "restringido" en que el dato se conserva pero no se usa.`,
      tabla: { cols: ['', 'Revocar consentimiento', 'Oposición', 'Bloqueo'], filas: [['Qué hace', 'Retira el consentimiento dado', 'Excluye al titular de una finalidad', 'Suspende el tratamiento, el dato se conserva'], ['Procede cuando', 'La base era el consentimiento', 'Aunque la base no sea el consentimiento', 'Exactitud dudosa, reclamo en curso o retención legal'], ['En el sistema', 'Llenar revocado_en', 'Flag de exclusión por finalidad', 'Estado "restringido"']] },
      ojo: [`Errores típicos: sin canal claro, verificación excesiva, no buscar en respaldos ni terceros, borrado lógico que sigue apareciendo, no controlar el plazo.`]
    }
  ]
});

/* =====================================================================
   TRAZABILIDAD E INCIDENTES (sesión 6)
   ===================================================================== */
teoria.push({
  id: 'incidentes', unidad: 'Taller · Sesión 6', titulo: 'Trazabilidad, monitoreo e incidentes',
  resumen: 'Log de auditoría vs log de aplicación, las 5 preguntas, protección de logs, alertas, evento vs incidente vs brecha y el ciclo de respuesta.',
  intro: `Si no queda registro, no puedes demostrar que cumpliste (responsabilidad) ni investigar una brecha. Esta sesión diseña los <b>logs de auditoría</b> y el <b>plan de respuesta a incidentes</b>.`,
  sub: [
    {
      id: 'logs', titulo: 'Log de aplicación vs log de auditoría', comparacion: true, resumen: 'Para depurar vs para rendir cuentas.',
      idea: `El <b>log de aplicación</b> sirve para depurar el sistema. El <b>log de auditoría</b> registra <b>quién hizo qué sobre qué datos</b> para rendir cuentas.`,
      tabla: { cols: ['', 'Log de aplicación', 'Log de auditoría'], filas: [['Propósito', 'Depurar errores y rendimiento', 'Trazabilidad y responsabilidad'], ['Contenido', 'Errores, tiempos, trazas técnicas', 'Acciones de usuarios sobre datos personales'], ['Lector', 'Desarrolladores', 'Auditoría, DPO, investigación de incidentes'], ['Retención', 'Corta', 'Más larga, definida por política']] }
    },
    {
      id: 'cinco', titulo: 'Las 5 preguntas de un log de auditoría', resumen: 'Quién, qué, sobre qué, cuándo y desde dónde, resultado.',
      idea: `Cada evento auditable responde: <b>¿quién?</b>, <b>¿qué acción?</b>, <b>¿sobre qué dato o titular?</b>, <b>¿cuándo y desde dónde?</b> y <b>¿con qué resultado?</b>`,
      ejemplo: `<code>2026-10-30 10:42 · usuario=dra.perez · acción=VER_FICHA · titular=paciente#381 · ip=10.0.3.7 · resultado=OK</code>`,
      texto: `<p><b>Eventos a auditar:</b> inicios de sesión (exitosos y fallidos), accesos a datos sensibles, cambios y eliminaciones, exportaciones, cambios de permisos y de consentimiento, solicitudes de derechos.</p>
<p><b>Qué NO registrar:</b> contraseñas, tokens de sesión, el contenido de datos sensibles (diagnósticos, números de tarjeta). Se registra el <b>identificador</b>, no el dato.</p>`
    },
    {
      id: 'proteger', titulo: 'Proteger los logs', resumen: 'Un log que se puede borrar no prueba nada.',
      idea: `Los logs de auditoría deben ser <b>inalterables</b> y de acceso restringido.`,
      texto: `<ul><li>Acceso restringido (solo auditoría).</li><li><b>Separación</b>: guardados fuera del sistema auditado.</li><li><b>Solo escritura</b> (append-only): nadie los edita ni borra.</li><li><b>Relojes sincronizados</b> para poder reconstruir la secuencia.</li><li><b>Retención</b> definida.</li></ul>`
    },
    {
      id: 'monitoreo', titulo: 'Monitoreo y alertas', resumen: 'Señales que indican que algo anda mal.',
      idea: `Los logs sirven si alguien (o algo) los mira: se definen <b>señales</b> y <b>alertas</b>.`,
      texto: `<p><b>Señales típicas:</b> muchos logins fallidos, accesos fuera de horario, un usuario que ve muchas fichas en poco tiempo, exportaciones masivas, accesos desde ubicaciones inusuales, cambios de permisos.</p>
<p><b>Una buena alerta</b> tiene un umbral, un responsable que la recibe y una acción esperada (evitar el ruido que hace que se ignoren).</p>`
    },
    {
      id: 'evento', titulo: 'Evento vs incidente vs brecha', resumen: 'No todo evento es un incidente, no todo incidente es una brecha.',
      idea: `<b>Evento</b>: algo observable que ocurre. <b>Incidente</b>: un evento que compromete o amenaza la seguridad. <b>Brecha</b>: un incidente que afecta <b>datos personales</b> (su confidencialidad, integridad o disponibilidad).`,
      tabla: { cols: ['Tipo de brecha', 'Ejemplo'], filas: [['De confidencialidad', 'Fichas clínicas expuestas a terceros'], ['De integridad', 'Alguien modifica diagnósticos sin autorización'], ['De disponibilidad', 'Ransomware cifra la base y no hay acceso a los datos']] }
    },
    {
      id: 'ciclo', titulo: 'Ciclo de respuesta a incidentes', resumen: 'Preparación, detección, contención, erradicación, recuperación y lecciones aprendidas.',
      idea: `Seis fases: <b>preparación → detección y análisis → contención → erradicación → recuperación → lecciones aprendidas</b>.`,
      pasos: ['<b>Preparación:</b> plan, roles, contactos, herramientas listas antes del incidente.', '<b>Detección y análisis:</b> ¿qué pasó?, ¿desde cuándo?, ¿qué datos y cuántos titulares?, ¿sigue ocurriendo?', '<b>Contención:</b> limitar el daño (bloquear cuentas, aislar sistemas) <b>preservando la evidencia</b>.', '<b>Erradicación:</b> eliminar la causa (parchar, rotar credenciales y llaves).', '<b>Recuperación:</b> restaurar el servicio con normalidad y vigilar.', '<b>Lecciones aprendidas:</b> qué falló y qué se cambia.'],
      ojo: [`Errores típicos: borrar logs o reinstalar antes de preservar evidencia, no notificar a tiempo, no saber quién decide, no tener plan.`]
    },
    {
      id: 'notificacion', titulo: 'Notificación de brechas', resumen: 'A la Agencia y, si hay riesgo, a los titulares.',
      idea: `Ante una brecha con riesgo, se notifica a la <b>autoridad</b> y, cuando corresponda, a los <b>titulares afectados</b>.`,
      texto: `<p><b>Contenido de la notificación:</b> qué ocurrió y cuándo, qué datos y cuántos titulares, consecuencias probables, medidas adoptadas y recomendadas al titular, y un contacto.</p>
<p><b>El plan de respuesta</b> incluye: roles y responsables, contactos, criterios de clasificación, procedimientos por fase y plantillas de notificación.</p>`
    }
  ]
});

/* =====================================================================
   PROYECTO INTEGRADOR
   ===================================================================== */
teoria.push({
  id: 'proyecto', unidad: 'Proyecto integrador', titulo: 'Proyecto integrador: cómo relacionarlo en el examen',
  resumen: 'Qué pedía cada hito y cómo usar tu proyecto como ejemplo en las preguntas de desarrollo.',
  intro: `El examen pide "cuando corresponda, relacionen el concepto con un ejemplo o con su proyecto". Esta sección te deja los ejemplos listos, usando tu proyecto (<b>Centro Médico Altavida</b>).`,
  sub: [
    {
      id: 'hitos', titulo: 'Los tres hitos', resumen: 'Cifrado; privacidad y acceso; derechos e incidentes.',
      idea: `Cada hito implementa una unidad del taller en el mismo sistema.`,
      tabla: { cols: ['Hito', 'Unidad', 'Entregables'], filas: [['Hito 1 (S3)', 'Cifrado', 'Inventario de datos, tabla de decisión por campo, cifrado y hashing implementados, gestión de llaves'], ['Hito 2 (S6)', 'Privacidad y acceso', 'Minimización del esquema y APIs, seudonimización donde aplica, matriz RBAC, consentimiento'], ['Hito 3 (S9)', 'Derechos e incidentes', 'Mecanismos ARCO+, logs de auditoría, plan de respuesta a incidentes'], ['Defensa (S12)', 'Todo', 'Explicar y justificar cada decisión']] }
    },
    {
      id: 'altavida', titulo: 'Ejemplos con tu proyecto', resumen: 'Frases listas para las preguntas de desarrollo.',
      idea: `Fórmula para desarrollo: <b>concepto (definición) → norma que lo exige → cómo lo implementamos en el proyecto → por qué así</b>.`,
      texto: `<p>Lo seguro en tu proyecto: Django con SQLite, campos sensibles cifrados con <b>AES-GCM</b> y contraseñas con <b>Argon2</b>. Las demás filas son ejemplos de cómo se aplicaría cada concepto: <b>ajústalas a lo que tu grupo implementó de verdad</b>, porque en el examen conviene contar lo que hicieron.</p>`,
      tabla: { cols: ['Concepto', 'En Altavida'], filas: [['Dato sensible', 'Diagnósticos y fichas clínicas (datos de salud)'], ['Cifrado en reposo', 'Campos sensibles cifrados con AES-GCM; la llave en variable de entorno, fuera del repositorio'], ['Hashing de contraseñas', 'Argon2, nunca cifradas'], ['Responsable / encargado', 'El centro médico es responsable; un proveedor de nube sería encargado'], ['RBAC', 'Roles médico, recepción y administrador; el médico solo ve fichas de sus pacientes'], ['Minimización', 'Recepción ve datos de contacto y agenda, no diagnósticos'], ['Supresión con retención', 'La ficha clínica debe conservarse por ley: se bloquea en vez de borrarse'], ['Log de auditoría', 'Registro de quién vio o modificó cada ficha, sin guardar el diagnóstico en el log'], ['Incidente', 'Ante acceso indebido: contener (bloquear la cuenta), preservar logs, evaluar y notificar']] },
      recuerda: `Si una pregunta dice "relacione con su proyecto", <b>nombra un dato concreto</b> (ficha clínica), <b>la técnica</b> (AES-GCM) y <b>la razón legal</b> (dato sensible, deber de seguridad).`
    }
  ]
});
