const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys')

const qrcode = require('qrcode-terminal')
const fs = require('fs')

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function pausaHumana(sock, usuario) {

    try {

        await sock.sendPresenceUpdate(
            'composing',
            usuario
        )

    } catch (error) {
        console.log(
            'Error presencia:',
            error.message
        )
    }

    const tiempo =
        Math.floor(
            Math.random() * 1000
        ) + 300

    await delay(tiempo)
}

// ======================
// ESTADOS TEMPORALES
// ======================

const estados = {}

// ======================
// ARCHIVOS JSON
// ======================

function cargarUsuarios() {

try {

        return JSON.parse(
            fs.readFileSync(
                './database/usuarios.json',
                'utf8'
            )
        )

    } catch {

        return {}

    }


}

function guardarUsuarios(data) {

    fs.writeFileSync(
        './database/usuarios.json',
        JSON.stringify(data, null, 2)
    )

}

function cargarDirecciones() {

try {

        return JSON.parse(
            fs.readFileSync(
                './database/direcciones.json',
                'utf8'
            )
        )

    } catch {

        return []

    }

}

function cargarPolicias() {

    try {

        return JSON.parse(
            fs.readFileSync(
                './database/policias.json',
                'utf8'
            )
        )

    } catch {

        return [
            'Sgto. 2.° Gavilanes Roger',
            'Policía Guamán Lucas',
            'Policía Martínez Josué'
        ]
    }

}

function guardarPolicias(data) {

    fs.writeFileSync(
        './database/policias.json',
        JSON.stringify(data, null, 2)
    )

}

function guardarDirecciones(data) {
    fs.writeFileSync(
        './database/direcciones.json',
        JSON.stringify(data, null, 2)
    )

}

// ======================
// FORMACIONES JSON
// ======================

function cargarFormaciones() {

    try {

        return JSON.parse(
            fs.readFileSync(
                './database/formacion.json',
                'utf8'
            )
        )

    } catch {

        return {}

    }

}

function guardarFormaciones(data) {

    fs.writeFileSync(
        './database/formacion.json',
        JSON.stringify(data, null, 2)
    )

}

function cargarRadioperadores() {
    if (!fs.existsSync('./database/radioperadores.json')) {
        return {}
    }

    return JSON.parse(
        fs.readFileSync('./database/radioperadores.json', 'utf8')
    )
}

function esRadioperador(usuario) {
    const radioperadores = cargarRadioperadores()
    return !!radioperadores[usuario]
}

function cargarCodigos() {
    if (!fs.existsSync('./database/codigos.json')) {
        return {
            codigos: {},
            usados: [],
            intentos: {},
            bloqueados: {},
            accesosTemporales: {}
        }
    }

    const data = JSON.parse(
        fs.readFileSync('./database/codigos.json', 'utf8')
    )

    data.codigos = data.codigos || {}
    data.usados = data.usados || []
    data.intentos = data.intentos || {}
    data.bloqueados = data.bloqueados || {}
    data.accesosTemporales = data.accesosTemporales || {}

    return data
}

function guardarCodigos(data) {
    fs.writeFileSync(
        './database/codigos.json',
        JSON.stringify(data, null, 2)
    )
}
function generarCodigoTemporal() {
    const caracteres =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let codigo = ''

    for (let i = 0; i < 5; i++) {
        codigo += caracteres.charAt(
            Math.floor(
                Math.random() * caracteres.length
            )
        )
    }

    return codigo
}

function crearCodigoUnico() {
    const data =
        cargarCodigos()

    let codigo

    do {
        codigo =
            generarCodigoTemporal()
    } while (
        data.codigos[codigo] ||
        data.usados.includes(codigo)
    )

    data.codigos[codigo] = {
        creado: Date.now(),
        vence: Date.now() + (5 * 60 * 1000),
        usado: false
    }

    guardarCodigos(data)

    return codigo
}
// ======================
// FECHA
// ======================

function obtenerFecha() {

    const fecha = new Date()

    return fecha.toLocaleDateString('es-EC')

}

// ======================
// HORA +1 MIN
// ======================

function obtenerHoraMas5() {

    const fecha = new Date()

    fecha.setMinutes(
        fecha.getMinutes() + 1
    )

    return fecha.toLocaleTimeString(
        'es-EC',
        {
            hour: '2-digit',
            minute: '2-digit'
        }
    )

}

// ======================
// SALUDO SEGUN LA HORA
// ======================

function obtenerSaludo() {

    const hora = new Date().getHours()

    if (hora >= 5 && hora < 12) {

        return 'Muy buenos días'

    }

    if (hora >= 12 && hora < 18) {

        return 'Muy buenas tardes'

    }

    return 'Muy buenas noches'

}

// ======================
// JORNADA AUTOMATICA
// ======================

function obtenerJornadaAutomatica() {

    const hora =
        new Date().getHours()

    if (
        hora >= 6 &&
        hora < 14
    ) {

        return {
            jornada: 'MATUTINA',
            horario: '06:00 A 14:30',
            entrada: '06:00',
            salida: '14:30'
        }
    }

    if (
        hora >= 14 &&
        hora < 22
    ) {

        return {
            jornada: 'VESPERTINA',
            horario: '14:00 A 22:30',
            entrada: '14:00',
            salida: '22:30'
        }
    }

    return {
        jornada: 'AMANECIDA',
        horario: '22:00 A 06:30',
        entrada: '22:00',
        salida: '06:30'
    }
}

// ======================
// GENERADOR CARTILLA
// ======================
async function generarCartilla(
    sock,
    usuario,
    procedimiento
) {

    const usuarios = cargarUsuarios()

    const datos = usuarios[usuario]

    if (!datos) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text: '❌ Error cargando datos del usuario'
            }
        )

        return

    }

    const cartilla =
`*CUERPO DE AGENTES DE CONTROL MUNICIPAL*

*DISTRITO*: MODELO
*CIRCUITO*: EAS 12 - CEIBOS
*HORARIO*: ${datos.horario}
*HORA*: ${obtenerHoraMas5()}
*FECHA*: ${obtenerFecha()}
*DIRECCION*: ${datos.direccion}

*CAUSA*: ${datos.causa}

*PROCEDIMIENTO*:
${obtenerSaludo()}, Sr. Maldonado Cabrera Freddy Jefe de Control Municipal muy respetuosamente me permito informarle que a la altura de la calle "${datos.direccion}" ${procedimiento}

Notifico novedades para fines correspondientes.

${datos.movil}

*REPORTA*:
*CP:* ${datos.cp}
*JP:* ${datos.jp}
${datos.policia ? `*POLICIA:* ${datos.policia}` : ''}

*"Lealtad, Valor y Orden"*

Adjunto fotografía`

await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: cartilla
        }
    )

}

async function generarFormacion(
    sock,
    usuario,
    tipo
) {

    const formaciones =
        cargarFormaciones()

    const datos =
        formaciones[usuario]

    if (!datos) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'❌ No existen datos de formación guardados'
            }
        )

        return
    }

const jornadaActual =
    obtenerJornadaAutomatica()

const horaFormacion =
    tipo === 'entrante'
        ? jornadaActual.entrada
        : jornadaActual.salida

const causa =
    tipo === 'entrante'
        ? 'FORMACION ENTRANTE'
        : 'FORMACION SALIENTE'

    const accion =
        tipo === 'entrante'
            ? 'INICIA LA JORNADA LABORAL'
            : 'CULMINA LA JORNADA LABORAL'

    const personal =
        tipo === 'entrante'
            ? 'Forma Personal entrante'
            : 'Forma Personal Saliente'

    const cantidadRadio =
        String(datos.radioOperadores.length)
            .padStart(2, '0')

    const cantidadOperativos =
        String(datos.operativos)
            .padStart(2, '0')

const bloquePolicia =
    datos.policias &&
    datos.policias.length > 0
        ? `\n${String(datos.policias.length).padStart(2, '0')} Personal Policial\n${datos.policias.join('\n')}`
        : ''

            const moviles =
        datos.moviles.join('-')

    const reporta =
        datos.radioOperadores
            .map(nombre => `ACM: ${nombre}`)
            .join('\n')

    const novedades =
        datos.novedadMoviles
            ? `${datos.novedades}\n${datos.novedadMoviles}`
            : datos.novedades

    const cartilla =
`*CUERPO AGENTE DE CONTROL MUNICIPAL*
*REPORTE DE FORMACIÓN DE RADIO-OPERADORES*
*Distrito #5 MODELO*
*Circuito:* EAS 12 CEIBOS
*Dirección:* Calle 15 ava y Dr Alberto Dacach Saman
*Horario:* ${jornadaActual.horario}
*Hora:* ${horaFormacion}
*Fecha:* ${obtenerFecha()}
*Causa:* ${causa}

${obtenerSaludo()}, permiso Sr. Jefe de Control Municipal Maldonado Cabrera Freddy Muy respetuosamente, le informo que:
Al momento *${personal} de Radio Operadores del EAS CEIBOS, ACM JP y CONDUCTORES,* se notifican novedades para fines pertinentes, quedando así en constancia que se ${accion} como se establece la distribución.

*NOVEDADES:*
${novedades}

*Personal participante:*
${cantidadRadio} ACM Radio operadores
${cantidadOperativos} ACM Operativos${bloquePolicia}

*Móviles en circulación:*
${moviles}

*Reporta:*
${reporta}

*“Lealtad, Valor y Orden”*

*Adjunto Fotografía:*`
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: cartilla
        }
    )

}

// ======================
// GENERADOR CONSOLIDADO
// ======================

async function generarConsolidado(
    sock,
    usuario
) {

    const datos =
        estados[usuario]
            .consolidado

    const formaciones =
        cargarFormaciones()

    const formacion =
        formaciones[usuario]

    if (!formacion) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'❌ No existen datos de formación registrados'
            }
        )

        return
    }

    const jornadaActual =
        obtenerJornadaAutomatica()

    const reporta =
        formacion.radioOperadores
            .map(nombre => `*ACM:* ${nombre}`)
            .join('\n')

    const consolidado =
`*REPORTE DE RADIOOPERADORES CIRCUITO ${jornadaActual.jornada} ECO 12 "CEIBOS"*

*AGENTES ENCARGADOS:*
${reporta}

*FECHA:* ${obtenerFecha()}

*OPERATIVOS*
TOTAL: ${String(datos.operativos || 0).padStart(2,'0')}

*REQUERIMIENTOS*
TOTAL: ${String(datos.requerimientos || 0).padStart(2,'0')}

*RETIROS TEMPORALES*
TOTAL: ${String(datos.retirosTemporales || 0).padStart(2,'0')}

*LEVANTAMIENTOS DE INDIGENTES*
TOTAL: ${String(datos.indigentes || 0).padStart(2,'0')}

*RETENIDOS*
TOTAL: ${String(datos.retenidos || 0).padStart(2,'0')}

*RESCATE ANIMAL*
TOTAL: ${String(datos.rescateAnimal || 0).padStart(2,'0')}

*RETIRO DE COVACHAS*
TOTAL: ${String(datos.retiroCovachas || 0).padStart(2,'0')}

*ACM HERIDOS*
TOTAL: ${String(datos.acmHeridos || 0).padStart(2,'0')}

*RUIDOS MOLESTOS*
TOTAL: ${String(datos.ruidosMolestos || 0).padStart(2,'0')}

*MALA DISPOSICIÓN DE BASURA*
TOTAL: ${String(datos.malaDisposicionBasura || 0).padStart(2,'0')}

*ATENCIÓN PARAMÉDICA*
TOTAL: ${String(datos.atencionParamedica || 0).padStart(2,'0')}

*DESALOJOS DE LIBADORES CONSUMIDORES*
TOTAL: ${String(datos.desalojosLibadores || 0).padStart(2,'0')}

*COLABORACIÓN CON OTRAS INSTITUCIONES*
TOTAL: ${String(datos.colaboracionInstituciones || 0).padStart(2,'0')}

*NOTIFICACIÓN / COORDINACIÓN POR MALA DISPOSICIÓN DE DESECHOS*
TOTAL: ${String(datos.notificacionDesechos || 0).padStart(2,'0')}`
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: consolidado
        }
    )

}

// ======================
// GENERADOR CONSOLIDADO MOVIL
// ======================

async function generarConsolidadoMovil(
    sock,
    usuario
) {

    const usuarios =
        cargarUsuarios()

    const datos =
        usuarios[usuario]

    if (!datos) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'❌ No existen datos guardados para generar el consolidado.'
            }
        )

        return
    }

    const estado =
        estados[usuario]

    let jp =
        datos.jp

    let cp =
        datos.cp

    let auxiliar =
        estado.auxiliar

    if (datos.policia) {

        auxiliar =
            datos.jp

        jp =
            datos.policia
    }

    const bloqueAuxiliar =
        auxiliar
            ? `*Aux:* ${auxiliar}\n`
            : ''

            const cantidades =
`*OPERATIVOS*
TOTAL: ${String(estado.cantidadesMovil?.operativos || 0).padStart(2,'0')}

*REQUERIMIENTOS*
TOTAL: ${String(estado.cantidadesMovil?.requerimientos || 0).padStart(2,'0')}

*RETIROS TEMPORALES*
TOTAL: ${String(estado.cantidadesMovil?.retirosTemporales || 0).padStart(2,'0')}

*LEVANTAMIENTOS DE INDIGENTES*
TOTAL: ${String(estado.cantidadesMovil?.indigentes || 0).padStart(2,'0')}

*RETENIDOS*
TOTAL: ${String(estado.cantidadesMovil?.retenidos || 0).padStart(2,'0')}

*RESCATE ANIMAL*
TOTAL: ${String(estado.cantidadesMovil?.rescateAnimal || 0).padStart(2,'0')}

*RETIRO DE COVACHA*
TOTAL: ${String(estado.cantidadesMovil?.retiroCovachas || 0).padStart(2,'0')}

*ACM HERIDOS*
TOTAL: ${String(estado.cantidadesMovil?.acmHeridos || 0).padStart(2,'0')}

*RUIDOS MOLESTOS*
TOTAL: ${String(estado.cantidadesMovil?.ruidosMolestos || 0).padStart(2,'0')}

*MALA DISPOSICION DE BASURA*
TOTAL: ${String(estado.cantidadesMovil?.malaDisposicionBasura || 0).padStart(2,'0')}

*ATENCIÓN PARAMÉDICA*
TOTAL: ${String(estado.cantidadesMovil?.atencionParamedica || 0).padStart(2,'0')}

*DESALOJOS DE LIBADORES CONSUMIDORES*
TOTAL: ${String(estado.cantidadesMovil?.desalojosLibadores || 0).padStart(2,'0')}

*COLABORACIÓN CON OTRA INSTITUCIONES*
TOTAL: ${String(estado.cantidadesMovil?.colaboracionInstituciones || 0).padStart(2,'0')}

*NOTIFICACION / COORDINACION POR MALA DISPOSICION DE DESECHOS*
TOTAL: ${String(estado.cantidadesMovil?.notificacionDesechos || 0).padStart(2,'0')}`

    const novedadesFinal =
    estado.novedadesExtra
        ? estado.novedadesExtra
        : 'Sin novedades'

    const consolidado =
`*CONSOLIDADO CIRCUITO EAS CEIBOS*

*AGENTES ENCARGADOS:*
*JP:* ${jp}
*COND:* ${cp}
${bloqueAuxiliar}*MOVIL:* ${datos.movil}
*KILO:* ${estado.kilo}
*GOLFO:* ${estado.golfo}

*FECHA:* ${obtenerFecha()}

${cantidades}

*NOVEDADES:*
${novedadesFinal}`
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: consolidado
        }
    )
}

// ======================
// PREGUNTAS INCIDENCIA
// ======================

async function enviarPregInc(
    sock,
    usuario
) {

    const inc =
        estados[usuario].inc

    const preguntas = {
        'ROBO A MANO ARMADA': [
            ['bienes', 'Indique qué bienes le robaron:'],
            ['valor', 'Indique el valor total de los bienes robados:']
        ],

        'PERDIDA DE BIEN INMUEBLE': [
            ['bienes', 'Indique qué bienes se perdieron:'],
            ['valor', 'Indique el valor total de los bienes perdidos:']
        ],

        'EXTORSION A LOCAL': [
            ['local', 'Ingrese el nombre del local comercial:'],
            ['refLocal', 'Ingrese una referencia del local:'],
            ['motivo', 'Indique por qué motivo es la extorsión:']
        ],

        'AMENAZAS': [
            ['amenazaNom', 'Ingrese el nombre de la persona que está amenazando:'],
            ['amenazaCed', 'Ingrese la cédula de la persona que está amenazando:'],
            ['textoAmenaza', 'Ingrese la frase o texto que indica que fue una amenaza:']
        ],

        'DESAPARICION DE PERSONA': [
            ['desapNom', 'Ingrese el nombre de la persona desaparecida:'],
            ['ultimaVez', 'Ingrese la ubicación donde fue vista por última vez:'],
            ['desapCed', 'Ingrese la cédula de la persona desaparecida:'],
            ['vestimenta', 'Indique la vestimenta o accesorios que llevaba:'],
            ['antecedente', 'Indique si hubo algún antecedente de amenaza anterior o no:']
        ],

        'SECTOR O NICHO CONFLICTIVO': [
            ['motivoConf', 'Indique el motivo por el cual el sector es conflictivo:'],
            ['requiere', 'Indique qué requiere el ciudadano denunciante:']
        ],

        'AGRESION': [
            ['agresor', 'Ingrese el nombre del agresor:'],
            ['objeto', 'Indique el objeto con el que agredió:'],
            ['detalleHerida', 'Detalle cómo el objeto provocó la herida y en qué parte:']
        ],

        'VISUALIZAR CAMARAS': [
    [
        'motivoCam',
        'Describa el motivo de la visualización de cámaras:'
    ]
],

'COLABORACION EN EVENTO': [
    [
        'evento',
        'Ingrese el nombre del evento:'
    ],
    [
        'horaEvento',
        'Ingrese la hora del evento:'
    ],
    [
        'fechaEvento',
        'Ingrese la fecha del evento:'
    ],
    [
        'motivoEvento',
        'Describa el motivo de la colaboración:'
    ]
],

'RESGUARDO DE PERSONAL': [
    [
        'motivoResguardo',
        'Indique el motivo del resguardo:'
    ]
],

'COLABORACION DE ATM': [
    [
        'motivoAtm',
        'Indique el motivo de la presencia de ATM:'
    ]
],

    }

    inc.preguntas =
        preguntas[inc.tipo]

    inc.i =
        0
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
                inc.preguntas[0][1]
        }
    )
}

// ======================
// GENERAR INCIDENCIA EAS
// ======================

async function genIncEas(
    sock,
    usuario
) {

    const estado =
        estados[usuario]

    const inc =
        estado.inc

    const formaciones =
        cargarFormaciones()

    const datosFormacion =
        formaciones[usuario]

    const jornadaActual =
        obtenerJornadaAutomatica()

    const reporta =
        datosFormacion?.radioOperadores?.length
            ? datosFormacion.radioOperadores
                .map(nombre => `ACM. ${nombre}`)
                .join('\n')
            : 'No registra radioperadores'

    let relato = ''

    if (inc.tipo === 'ROBO A MANO ARMADA') {

        relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS debido a un caso de robo a mano armada suscitado en ${inc.lugar}.

El ciudadano manifiesta que le fueron sustraídos los siguientes bienes: ${inc.bienes}. Asimismo, indica que el valor aproximado de los bienes robados asciende a ${inc.valor}.`
    }

if (
    inc.tipo ===
    'PERDIDA DE BIEN INMUEBLE'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS debido a la pérdida de bienes ocurrida en ${inc.lugar}.

El ciudadano manifiesta haber extraviado los siguientes bienes: ${inc.bienes}. Asimismo, indica que el valor aproximado de los bienes perdidos asciende a ${inc.valor}.`
}

if (
    inc.tipo ===
    'EXTORSION A LOCAL'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS debido a una presunta extorsión a local comercial, suscitada en ${inc.lugar}.

El ciudadano manifiesta que el local comercial denominado ${inc.local}, ubicado como referencia en ${inc.refLocal}, estaría siendo objeto de presunta extorsión por el siguiente motivo: ${inc.motivo}.`
}

if (
    inc.tipo ===
    'AMENAZAS'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS debido a una presunta amenaza suscitada en ${inc.lugar}.

El ciudadano manifiesta estar siendo víctima de amenazas por parte de ${inc.amenazaNom}, portador de la cédula de ciudadanía No. ${inc.amenazaCed}, quien presuntamente habría expresado el siguiente texto o frase intimidatoria:

"${inc.textoAmenaza}"

Por lo expuesto, el ciudadano solicita que se deje constancia de lo manifestado para los fines correspondientes.`
}

if (
    inc.tipo ===
    'DESAPARICION DE PERSONA'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS debido a la desaparición de una persona.

El ciudadano manifiesta que la persona desaparecida responde a los nombres de ${inc.desapNom}, con cédula de ciudadanía No. ${inc.desapCed}, quien fue vista por última vez en ${inc.ultimaVez}. Asimismo, indica que al momento de su desaparición vestía o portaba lo siguiente: ${inc.vestimenta}.

Respecto a antecedentes de amenazas anteriores, el ciudadano indica: ${inc.antecedente}.`
}

if (
    inc.tipo ===
    'SECTOR O NICHO CONFLICTIVO'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS para informar una novedad relacionada con un sector conflictivo ubicado en ${inc.lugar}.

El ciudadano manifiesta que el sector presenta la siguiente problemática: ${inc.motivoConf}.

Asimismo, solicita lo siguiente por parte de las autoridades competentes: ${inc.requiere}.`
}

if (
    inc.tipo ===
    'AGRESION'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS debido a una presunta agresión suscitada en ${inc.lugar}.

El ciudadano manifiesta que fue agredido por ${inc.agresor}, quien habría utilizado ${inc.objeto} para ocasionar la lesión.

De acuerdo con lo manifestado, la agresión se produjo de la siguiente manera: ${inc.detalleHerida}.`
}

if (
    inc.tipo ===
    'VISUALIZAR CAMARAS'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS solicitando la visualización de cámaras por una novedad suscitada en ${inc.lugar}.

El ciudadano manifiesta que requiere la revisión del sistema de videovigilancia debido a lo siguiente: ${inc.motivoCam}.`
}

if (
    inc.tipo ===
    'COLABORACION EN EVENTO'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS solicitando colaboración institucional para un evento a desarrollarse en ${inc.lugar}.

El ciudadano informa que el evento denominado ${inc.evento} se llevará a cabo el día ${inc.fechaEvento} a las ${inc.horaEvento}, indicando que la colaboración es requerida debido a: ${inc.motivoEvento}.`
}

if (
    inc.tipo ===
    'RESGUARDO DE PERSONAL'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS solicitando resguardo de personal en ${inc.lugar}.

El ciudadano manifiesta que requiere el acompañamiento o resguardo respectivo debido a: ${inc.motivoResguardo}.`
}

if (
    inc.tipo ===
    'COLABORACION DE ATM'
) {

    relato =
`Muy respetuosamente me permito informarle que al momento se acerca el ciudadano ${inc.nombre}, con cédula de ciudadanía No. ${inc.cedula} y número de celular ${inc.celular}, a la base EAS CEIBOS solicitando colaboración de ATM en ${inc.lugar}.

El ciudadano manifiesta que requiere la presencia de personal de ATM debido a: ${inc.motivoAtm}.`
}

if (
    inc.tipoP ===
    'NOVEDADES EN EAS CEIBOS'
) {

    relato =
`Muy respetuosamente me permito informarle que en las instalaciones de EAS CEIBOS se registra la siguiente novedad:

${inc.detalle}`
}

    const cartilla =
`*CUERPO AGENTE DE CONTROL MUNICIPAL*
*REPORTE DE RADIOOPERADORES EAS CEIBOS*

*Distrito:* #5 MODELO
*Circuito:* EAS 12 CEIBOS
*Dirección:* Calle 15 ava y Dr Alberto Dacach Saman
*Horario:* ${jornadaActual.horario}
*Hora:* ${obtenerHoraMas5()}
*Fecha:* ${obtenerFecha()}
*Causa:* ${
    inc.tipo
        ? `${inc.tipoP} - ${inc.tipo}`
        : inc.tipoP
}

${obtenerSaludo()}, permiso Sr. Maldonado Cabrera Freddy Jefe de Control Municipal.

${relato}

Así mismo, se le informó a la Central para que registre la novedad.

Información puesta en conocimiento para los fines pertinentes.

*Reporta:*
${reporta}

*"Lealtad Valor Orden"*

*Adjunto Fotografía:*`
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: cartilla
        }
    )
}

// ======================
// STARTBOT
// ======================

async function startBot() {

    const { state, saveCreds } =
        await useMultiFileAuthState('auth')

const sock = makeWASocket({
    auth: state,
    syncFullHistory: false
})

    sock.ev.on(
        'creds.update',
        saveCreds
    )

    sock.ev.on(
        'connection.update',
        async (update) => {

            const {
                connection,
                lastDisconnect,
                qr
            } = update

            if (qr) {

                qrcode.generate(qr, {
                    small: true
                })

            }

            if (connection === 'open') {

                console.log(
                    '✅ BOT CONECTADO'
                )

            }

if (connection === 'close') {
console.log(
        JSON.stringify(
            lastDisconnect,
            null,
            2
        )
    )
    console.log('❌ Conexión cerrada')

    const statusCode =
        lastDisconnect?.error
            ?.output?.statusCode

    const errorText =
        lastDisconnect?.error?.message || ''

    // EVITAR BUCLE POR CONFLICT
    if (
        errorText.includes('conflict')
    ) {

        console.log(
            '⚠️ Sesión reemplazada. Cerrando bot...'
        )

        return
    }

    const shouldReconnect =
        statusCode !==
        DisconnectReason.loggedOut

    if (shouldReconnect) {

        console.log(
            '🔄 Reconectando...'
        )

        startBot()

    }

}

        }
    )

    sock.ev.on(
        'messages.upsert',
        async ({ messages }) => {

            try {

                const msg = messages[0]
const ahora = Math.floor(Date.now() / 1000)

if (
    msg.messageTimestamp &&
    ahora - msg.messageTimestamp > 60
) {
    return
}
                if (!msg.message) return

                if (msg.key.fromMe) return

const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.buttonsResponseMessage
        ?.selectedButtonId ||
    msg.message?.templateButtonReplyMessage
        ?.selectedId

if (!text) return

let mensaje =
    text.trim().toLowerCase()

const usuario =
    msg.key.remoteJid

const codigosData =
    cargarCodigos()

const codigoIngresado =
    mensaje.toUpperCase()

if (
    codigosData.bloqueados[usuario] &&
    Date.now() < codigosData.bloqueados[usuario].vence
) {
    return
}

if (
    codigosData.bloqueados[usuario] &&
    Date.now() >= codigosData.bloqueados[usuario].vence
) {
    delete codigosData.bloqueados[usuario]
    delete codigosData.intentos[usuario]
    guardarCodigos(codigosData)
}

if (
    !esRadioperador(usuario) &&
    !codigosData.accesosTemporales[usuario]
) {

    if (
        codigosData.codigos[codigoIngresado] &&
        !codigosData.codigos[codigoIngresado].usado &&
        Date.now() <= codigosData.codigos[codigoIngresado].vence
    ) {

        delete codigosData.codigos[codigoIngresado]

        codigosData.usados.push(codigoIngresado)

        codigosData.accesosTemporales[usuario] = true

        delete codigosData.intentos[usuario]

        guardarCodigos(codigosData)

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`✅ Acceso temporal habilitado.


🤖 *SAC - SISTEMA AUTOMATIZADO DE CARTILLAS* 🤖

Seleccione una opción:

a) Cartillas de novedades
b) Radioperadores
c) Consolidado
d) Restart`
            }
        )

        return
    }

    codigosData.intentos[usuario] =
        (codigosData.intentos[usuario] || 0) + 1

    if (codigosData.intentos[usuario] >= 3) {

        codigosData.bloqueados[usuario] = {
            inicio: Date.now(),
            vence: Date.now() + (72 * 60 * 60 * 1000)
        }

        delete codigosData.intentos[usuario]

        guardarCodigos(codigosData)

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`🔒 BOT bloqueado.

Número bloqueado por seguridad durante 72 horas.

Solicite una nueva clave al radioperador.`
            }
        )

        return
    }

    guardarCodigos(codigosData)

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`🔐 Ingrese código de acceso temporal.

Intentos restantes: ${3 - codigosData.intentos[usuario]}`
        }
    )

    return
}

const usuarios =
    cargarUsuarios()

console.log(
    '📩',
    mensaje
)

console.log(
    'PASO ACTUAL:',
    estados[usuario]?.paso
)

// ======================
// MENU PRINCIPAL
// ======================
if (
    mensaje === 'hola' ||
    mensaje === 'menu' ||
    mensaje === 'menú' ||
    mensaje === '.'
) {

    delete estados[usuario]
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`🤖 SAC - SISTEMA AUTOMATIZADO DE CARTILLAS 🤖

Seleccione una opción:

a) Cartillas de novedades
b) Radioperadores
c) Consolidado
d) Restart`
        }
    )

    return
}

// ======================
// RESPUESTA MENU
// ======================

if (
    mensaje === 'a' &&
    !estados[usuario]
) {

    mensaje = '/cartilla'

}

if (
    mensaje === 'b' &&
    !estados[usuario]
) {

    estados[usuario] = {
        paso: 'menu_radioperadores'
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
text:
`📡 RADIOOPERADORES

a) Formación Entrante
b) Formación Saliente
c) Datos Guardados
d) Cartillas Incidencia EAS
e) Generar código
f) Desbloquear número
g) Volver`
        }
    )

    return
}

if (
    mensaje === 'd' &&
    !estados[usuario]
) {

    mensaje = '/restart'

}

if (
    mensaje === 'c' &&
    !estados[usuario]
) {

    estados[usuario] = {
        paso: 'menu_consolidado',
        consolidado: {
            operativos: 0,
            requerimientos: 0,
            retirosTemporales: 0,
            indigentes: 0,
            retenidos: 0,
            rescateAnimal: 0,
            retiroCovachas: 0,
            acmHeridos: 0,
            ruidosMolestos: 0,
            malaDisposicionBasura: 0,
            atencionParamedica: 0,
            desalojosLibadores: 0,
            colaboracionInstituciones: 0,
            notificacionDesechos: 0
        }
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`📊 CONSOLIDADO

Seleccione el tipo de consolidado:

a) Consolidado de radioperadores
b) Consolidado de móvil`
        }
    )
    return

}

// ======================
// RESTART
// ======================

if (
    mensaje === '/restart' ||
    mensaje === 'clear'
) {

    // BORRAR ESTADO TEMPORAL
    delete estados[usuario]

    // BORRAR DATOS GUARDADOS
    delete usuarios[usuario]

    guardarUsuarios(
        usuarios
    )
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`✅ Conversación reiniciada correctamente`,

        footer:
'Seleccione una opción',

        templateButtons: [

            {
                index: 1,
                quickReplyButton: {
                    displayText:
'📋 NUEVA CARTILLA',
                    id: '/cartilla'
                }
            },

            {
                index: 2,
                quickReplyButton: {
                    displayText:
'🔄 REINICIAR',
                    id: '/restart'
                }
            }

        ]
    }
)

    return

}

// ======================
// OTRA CARTILLA
// ======================

if (
    estados[usuario]?.paso ===
    'otra_cartilla'
) {

    // NUEVA CARTILLA
    if (mensaje === '1') {

        estados[usuario] = {
            paso: 'direccion'
        }

        const direcciones =
            cargarDirecciones()

        let lista = ''

        direcciones.forEach(
            (d, i) => {

                lista +=
`${i + 1}. ${d}\n`

            }
        )
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione dirección guardada o escriba una nueva:

${lista}`
            }
        )

        return
    }

    // FINALIZAR
    if (mensaje === '2') {

        delete estados[usuario]
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'✅ Registro finalizado correctamente'
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'❌ Opción inválida, escriba 1 o 2'
        }
    )

    return
}

// ======================
// MENU CONSOLIDADO
// ======================

if (
    estados[usuario]?.paso ===
    'menu_consolidado'
) {

    if (mensaje === 'a') {

        estados[usuario].paso =
            'menu_consolidado_radioperadores'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione el dato a registrar:

a) Operativos
b) Requerimientos
c) Retiros temporales
d) Levantamientos de indigentes
e) Retenidos
f) Rescate animal
g) Retiro de covachas
h) ACM heridos
i) Ruidos molestos
j) Mala disposición de basura
k) Atención paramédica
l) Desalojos de libadores consumidores
m) Colaboración con otras instituciones
n) Notificación / coordinación por mala disposición de desechos
o) Finalizar consolidado`
            }
        )

        return
    }

    if (mensaje === 'b') {

        estados[usuario].paso =
            'consolidado_movil_kilo'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese el kilometraje del móvil:'
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Seleccione el tipo de consolidado:

a) Consolidado de radioperadores
b) Consolidado de móvil`
        }
    )

    return
}

// ======================
// MENU CONSOLIDADO RADIOPERADORES
// ======================

if (
    estados[usuario]?.paso ===
    'menu_consolidado_radioperadores'
) {

    const opciones = {
        a: 'operativos',
        b: 'requerimientos',
        c: 'retirosTemporales',
        d: 'indigentes',
        e: 'retenidos',
        f: 'rescateAnimal',
        g: 'retiroCovachas',
        h: 'acmHeridos',
        i: 'ruidosMolestos',
        j: 'malaDisposicionBasura',
        k: 'atencionParamedica',
        l: 'desalojosLibadores',
        m: 'colaboracionInstituciones',
        n: 'notificacionDesechos'
    }

    if (mensaje === 'o') {

        await generarConsolidado(
            sock,
            usuario
        )

        delete estados[usuario]

        return
    }

    if (!opciones[mensaje]) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Operativos
b) Requerimientos
c) Retiros temporales
d) Levantamientos de indigentes
e) Retenidos
f) Rescate animal
g) Retiro de covachas
h) ACM heridos
i) Ruidos molestos
j) Mala disposición de basura
k) Atención paramédica
l) Desalojos de libadores consumidores
m) Colaboración con otras instituciones
n) Notificación / coordinación por mala disposición de desechos
o) Finalizar consolidado`
            }
        )

        return
    }

    estados[usuario].campoConsolidado =
        opciones[mensaje]

    estados[usuario].paso =
        'cantidad_consolidado'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese la cantidad a registrar'
        }
    )

    return
}

// ======================
// CANTIDAD CONSOLIDADO
// ======================

if (
    estados[usuario]?.paso ===
    'cantidad_consolidado'
) {

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 0
    ) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese una cantidad válida'
            }
        )

        return
    }

    const campo =
        estados[usuario]
            .campoConsolidado

    if (!estados[usuario].consolidado) {
        estados[usuario].consolidado = {}
    }

    if (!estados[usuario].consolidado[campo]) {
        estados[usuario].consolidado[campo] = 0
    }

    estados[usuario]
        .consolidado[campo] +=
        cantidad

    estados[usuario].paso =
        'menu_consolidado_radioperadores'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Registro agregado.

Seleccione una opción:

a) Operativos
b) Requerimientos
c) Retiros temporales
d) Levantamientos de indigentes
e) Retenidos
f) Rescate animal
g) Retiro de covachas
h) ACM heridos
i) Ruidos molestos
j) Mala disposición de basura
k) Atención paramédica
l) Desalojos de libadores consumidores
m) Colaboración con otras instituciones
n) Notificación / coordinación por mala disposición de desechos
o) Finalizar consolidado`
        }
    )

    return
}

// ======================
// CONSOLIDADO MOVIL KILO
// ======================

if (
    estados[usuario]?.paso ===
    'consolidado_movil_kilo'
) {

    estados[usuario].kilo =
        text

    estados[usuario].paso =
        'consolidado_movil_golfo'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Seleccione nivel del tanque de combustible:

a) 1/4
b) 1/2
c) 3/4
d) FULL`
        }
    )

    return
}

// ======================
// CONSOLIDADO MOVIL GOLFO
// ======================

if (
    estados[usuario]?.paso ===
    'consolidado_movil_golfo'
) {

    let golfo = ''

    if (mensaje === 'a') {
        golfo = '1/4'
    }

    else if (mensaje === 'b') {
        golfo = '1/2'
    }

    else if (mensaje === 'c') {
        golfo = '3/4'
    }

    else if (mensaje === 'd') {
        golfo = 'FULL'
    }

    else {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

Seleccione nivel del tanque de combustible:

a) 1/4
b) 1/2
c) 3/4
d) FULL`
            }
        )

        return
    }

    estados[usuario].golfo =
        golfo

    estados[usuario].paso =
        'consolidado_movil_auxiliar'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`¿Hubo auxiliar?

a) Sí
b) No`
        }
    )

    return
}

// ======================
// CONSOLIDADO MOVIL AUXILIAR
// ======================

if (
    estados[usuario]?.paso ===
    'consolidado_movil_auxiliar'
) {

    if (
        mensaje === 'a' ||
        mensaje === 'si' ||
        mensaje === 'sí'
    ) {

        estados[usuario].paso =
            'consolidado_movil_nombre_auxiliar'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese el nombre del auxiliar:'
            }
        )

        return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

        estados[usuario].auxiliar =
            ''

       if (!estados[usuario].cantidadesMovil) {

    estados[usuario].cantidadesMovil = {
        operativos: 0,
        requerimientos: 0,
        retirosTemporales: 0,
        indigentes: 0,
        retenidos: 0,
        rescateAnimal: 0,
        retiroCovachas: 0,
        acmHeridos: 0,
        ruidosMolestos: 0,
        malaDisposicionBasura: 0,
        atencionParamedica: 0,
        desalojosLibadores: 0,
        colaboracionInstituciones: 0,
        notificacionDesechos: 0
    }

}

estados[usuario].paso =
    'menu_consolidado_movil'
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`📊 CONSOLIDADO MOVIL

Seleccione una opción:

a) Operativos
b) Requerimientos
c) Retiros temporales
d) Levantamientos de indigentes
e) Retenidos
f) Rescate animal
g) Retiro de covachas
h) ACM heridos
i) Ruidos molestos
j) Mala disposición de basura
k) Atención paramédica
l) Desalojos de libadores consumidores
m) Colaboración con otras instituciones
n) Notificación / coordinación por mala disposición de desechos
o) Finalizar consolidado`
    }
)
return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Sí
b) No`
        }
    )

    return
}

// ======================
// CONSOLIDADO MOVIL NOMBRE AUXILIAR
// ======================

if (
    estados[usuario]?.paso ===
    'consolidado_movil_nombre_auxiliar'
) {

    estados[usuario].auxiliar =
        text

        if (!estados[usuario].cantidadesMovil) {

    estados[usuario].cantidadesMovil = {
        operativos: 0,
        requerimientos: 0,
        retirosTemporales: 0,
        indigentes: 0,
        retenidos: 0,
        rescateAnimal: 0,
        retiroCovachas: 0,
        acmHeridos: 0,
        ruidosMolestos: 0,
        malaDisposicionBasura: 0,
        atencionParamedica: 0,
        desalojosLibadores: 0,
        colaboracionInstituciones: 0,
        notificacionDesechos: 0
    }

}

estados[usuario].paso =
    'menu_consolidado_movil'
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`📊 CONSOLIDADO MOVIL

Seleccione una opción:

a) Operativos
b) Requerimientos
c) Retiros temporales
d) Levantamientos de indigentes
e) Retenidos
f) Rescate animal
g) Retiro de covachas
h) ACM heridos
i) Ruidos molestos
j) Mala disposición de basura
k) Atención paramédica
l) Desalojos de libadores consumidores
m) Colaboración con otras instituciones
n) Notificación / coordinación por mala disposición de desechos
o) Finalizar consolidado`
    }
)

return

    }

// ======================
// MENU CONSOLIDADO MOVIL
// ======================

if (
    estados[usuario]?.paso ===
    'menu_consolidado_movil'
) {

    const opciones = {
        a: 'operativos',
        b: 'requerimientos',
        c: 'retirosTemporales',
        d: 'indigentes',
        e: 'retenidos',
        f: 'rescateAnimal',
        g: 'retiroCovachas',
        h: 'acmHeridos',
        i: 'ruidosMolestos',
        j: 'malaDisposicionBasura',
        k: 'atencionParamedica',
        l: 'desalojosLibadores',
        m: 'colaboracionInstituciones',
        n: 'notificacionDesechos'
    }

    if (mensaje === 'o') {

        estados[usuario].paso =
            'consolidado_movil_agregar_novedad'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`¿Desea agregar novedades?

a) Sí
b) No`
            }
        )

        return
    }

    if (!opciones[mensaje]) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Operativos
b) Requerimientos
c) Retiros temporales
d) Levantamientos de indigentes
e) Retenidos
f) Rescate animal
g) Retiro de covachas
h) ACM heridos
i) Ruidos molestos
j) Mala disposición de basura
k) Atención paramédica
l) Desalojos de libadores consumidores
m) Colaboración con otras instituciones
n) Notificación / coordinación por mala disposición de desechos
o) Finalizar consolidado`
            }
        )

        return
    }

    estados[usuario].campoConsolidadoMovil =
        opciones[mensaje]

    estados[usuario].paso =
        'cantidad_consolidado_movil'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese la cantidad a registrar'
        }
    )

    return
}

// ======================
// MENU RADIOPERADORES
// ======================

if (
    estados[usuario]?.paso ===
    'menu_radioperadores'
) {

    if (
        mensaje === 'a' ||
        mensaje === 'b' ||
        mensaje === 'c'
    ) {

        estados[usuario].paso =
            'menu_formacion'

    }

    else if (mensaje === 'd') {

        estados[usuario] = {
            paso: 'inc_eas_menu',
            inc: {}
        }

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`*CARTILLAS INCIDENCIA EAS*

a) Denuncias Ciudadanas
b) Requerimientos Ciudadanos
c) Incidencias del EAS
d) Volver`
            }
        )

        return
    }

else if (mensaje === 'e') {

    if (!esRadioperador(usuario)) {

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'❌ Solo los radioperadores registrados pueden generar códigos temporales.'
            }
        )

        return
    }

    const data =
        cargarCodigos()

    data.accesosTemporales = {}

    guardarCodigos(data)

    const codigo =
        crearCodigoUnico()

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`Código temporal generado:

${codigo}

Vigencia: 8 horas.
Código de un solo uso.

Se invalidaron los accesos temporales anteriores.`
        }
    )

    return
}

    else if (mensaje === 'f') {

        if (!esRadioperador(usuario)) {

            await pausaHumana(sock, usuario)

            await sock.sendMessage(
                usuario,
                {
                    text:
'❌ Solo los radioperadores registrados pueden desbloquear números.'
                }
            )

            return
        }

        const data =
            cargarCodigos()

        const bloqueados =
            Object.keys(data.bloqueados || {})

        if (bloqueados.length === 0) {

            await pausaHumana(sock, usuario)

            await sock.sendMessage(
                usuario,
                {
                    text:
'No existen números bloqueados.'
                }
            )

            return
        }

        estados[usuario] = {
            paso: 'desbloquear_numero',
            bloqueados
        }

        let lista =
            'Números bloqueados:\n\n'

        bloqueados.forEach((num, index) => {
            lista += `${index + 1}) ${num.replace('@s.whatsapp.net', '').replace('@lid', '')}\n`
        })

        lista +=
            '\nSeleccione el número a desbloquear:'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text: lista
            }
        )

        return
    }

    else if (mensaje === 'g') {

        delete estados[usuario]

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'Escriba MENU para volver al menú principal'
            }
        )

        return
    }

    else {

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Formación Entrante
b) Formación Saliente
c) Datos Guardados
d) Cartillas Incidencia EAS
e) Generar código
f) Desbloquear número
g) Volver`
            }
        )

        return
    }
}

// ======================
// MENU INCIDENCIA EAS
// ======================

if (
    estados[usuario]?.paso ===
    'inc_eas_menu'
) {

    if (mensaje === 'a') {

        estados[usuario].inc = {
            tipoP:
                'DENUNCIAS CIUDADANAS'
        }

        estados[usuario].paso =
            'inc_den_menu'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`*DENUNCIAS CIUDADANAS*

a) Robo a mano armada
b) Pérdida de bien inmueble
c) Extorsión a local
d) Amenazas
e) Desaparición de persona
f) Sector o nicho conflictivo
g) Agresión`
            }
        )

        return
    }

    if (mensaje === 'b') {

        estados[usuario].inc = {
            tipoP:
                'REQUERIMIENTOS CIUDADANOS'
        }

        estados[usuario].paso =
            'inc_req_menu'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`*REQUERIMIENTOS CIUDADANOS*

a) Visualizar cámaras
b) Colaboración en evento
c) Resguardo de personal
d) Colaboración de ATM`
            }
        )

        return
    }

if (mensaje === 'c') {

    if (estados[usuario].desdeColaboracionCiudadana) {

        estados[usuario].paso =
            'causa'

        delete estados[usuario].desdeColaboracionCiudadana

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione la causa:

a) Desalojo de vendedores
b) Retiro temporal
c) Requerimiento
d) Rondas disuasivas
e) Punto martillo
f) Colaboración con otras entidades
g) Colaboración ciudadana
h) Accidente
i) Permiso de ausentismo`
            }
        )

        return
    }

    estados[usuario].inc = {
        tipoP:
            'NOVEDADES EN EAS CEIBOS'
    }

    estados[usuario].paso =
        'inc_eas_det'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Describa el motivo de la novedad:'
        }
    )

    return
}

if (
    mensaje === 'd' &&
    !estados[usuario].desdeColaboracionCiudadana
) {

    estados[usuario] = {
        paso:
            'menu_radioperadores'
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`📡 RADIOOPERADORES

a) Formación Entrante
b) Formación Saliente
c) Datos Guardados
d) Cartillas Incidencia EAS
e) Generar código
f) Desbloquear número
g) Volver`
        }
    )

    return
}

await sock.sendMessage(
    usuario,
    {
        text:
estados[usuario].desdeColaboracionCiudadana
    ? `Opción inválida.

a) Denuncias Ciudadanas
b) Requerimientos Ciudadanos
c) Volver`
    : `Opción inválida.

a) Denuncias Ciudadanas
b) Requerimientos Ciudadanos
c) Incidencias del EAS
d) Volver`
    }
)
    return
}

// ======================
// DESBLOQUEAR NUMERO
// ======================

if (
    estados[usuario]?.paso ===
    'desbloquear_numero'
) {

    const seleccion =
        parseInt(mensaje)

    const bloqueados =
        estados[usuario].bloqueados

    if (
        isNaN(seleccion) ||
        seleccion < 1 ||
        seleccion > bloqueados.length
    ) {

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'❌ Selección inválida. Ingrese un número de la lista.'
            }
        )

        return
    }

    const numeroDesbloquear =
        bloqueados[seleccion - 1]

    const data =
        cargarCodigos()

    delete data.bloqueados[numeroDesbloquear]
    delete data.intentos[numeroDesbloquear]

    guardarCodigos(data)

    estados[usuario] = {
        paso: 'menu_radioperadores'
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Número desbloqueado correctamente.

📡 RADIOOPERADORES

a) Formación Entrante
b) Formación Saliente
c) Datos Guardados
d) Cartillas Incidencia EAS
e) Generar código
f) Desbloquear número
g) Volver`
        }
    )

    return
}

// ======================
// MENU DENUNCIAS
// ======================

if (
    estados[usuario]?.paso ===
    'inc_den_menu'
) {

    const opciones = {

        a: 'ROBO A MANO ARMADA',

        b: 'PERDIDA DE BIEN INMUEBLE',

        c: 'EXTORSION A LOCAL',

        d: 'AMENAZAS',

        e: 'DESAPARICION DE PERSONA',

        f: 'SECTOR O NICHO CONFLICTIVO',

        g: 'AGRESION'
    }

    if (!opciones[mensaje]) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Robo a mano armada
b) Pérdida de bien inmueble
c) Extorsión a local
d) Amenazas
e) Desaparición de persona
f) Sector o nicho conflictivo
g) Agresión`
            }
        )

        return
    }

    estados[usuario].inc.tipo =
        opciones[mensaje]

    estados[usuario].paso =
        'inc_nom'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese el nombre del ciudadano:'
        }
    )

    return
}

// ======================
// MENU REQUERIMIENTOS
// ======================

if (
    estados[usuario]?.paso ===
    'inc_req_menu'
) {

    const opciones = {
        a: 'VISUALIZAR CAMARAS',
        b: 'COLABORACION EN EVENTO',
        c: 'RESGUARDO DE PERSONAL',
        d: 'COLABORACION DE ATM'
    }

    if (!opciones[mensaje]) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Visualizar cámaras
b) Colaboración en evento
c) Resguardo de personal
d) Colaboración de ATM`
            }
        )

        return
    }

    estados[usuario].inc.tipo =
        opciones[mensaje]

    estados[usuario].paso =
        'inc_nom'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese el nombre del ciudadano:'
        }
    )

    return
}

// ======================
// NOMBRE CIUDADANO
// ======================

if (
    estados[usuario]?.paso ===
    'inc_nom'
) {

    estados[usuario].inc.nombre =
        text

    estados[usuario].paso =
        'inc_ced'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese el número de cédula:'
        }
    )

    return
}

// ======================
// RESPUESTAS INCIDENCIA
// ======================

if (
    estados[usuario]?.paso ===
    'inc_preg'
) {

    const inc =
        estados[usuario].inc

    const campo =
        inc.preguntas[inc.i][0]

    inc[campo] =
        text

    inc.i++

    if (
        inc.i <
        inc.preguntas.length
    ) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
                    inc.preguntas[inc.i][1]
            }
        )

        return
    }

await genIncEas(
    sock,
    usuario
)

estados[usuario] = {
    paso: 'inc_eas_menu',
    inc: {}
}
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`¿Desea generar otra cartilla de incidencia?

a) Denuncias Ciudadanas
b) Requerimientos Ciudadanos
c) Incidencias del EAS
d) Volver`
    }
)

return
}

// ======================
// INCIDENCIA EAS DETALLE
// ======================

if (
    estados[usuario]?.paso ===
    'inc_eas_det'
) {

    estados[usuario].inc.detalle =
        text

    await genIncEas(
        sock,
        usuario
    )

    estados[usuario] = {
        paso: 'inc_eas_menu',
        inc: {}
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea generar otra cartilla de incidencia?

a) Denuncias Ciudadanas
b) Requerimientos Ciudadanos
c) Incidencias del EAS
d) Volver`
        }
    )

    return
}

// ======================
// CEDULA CIUDADANO
// ======================

if (
    estados[usuario]?.paso ===
    'inc_ced'
) {

    estados[usuario].inc.cedula =
        text

    estados[usuario].paso =
        'inc_cel'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese el número de celular:'
        }
    )

    return
}

// ======================
// CELULAR CIUDADANO
// ======================

if (
    estados[usuario]?.paso ===
    'inc_cel'
) {

    estados[usuario].inc.celular =
        text

    estados[usuario].paso =
        'inc_lug'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese el lugar de la novedad:'
        }
    )

    return
}

// ======================
// LUGAR NOVEDAD
// ======================

if (
    estados[usuario]?.paso ===
    'inc_lug'
) {

    estados[usuario].inc.lugar =
        text

    estados[usuario].paso =
        'inc_preg'

    await enviarPregInc(
        sock,
        usuario
    )

    return
}



// ======================
// CANTIDAD CONSOLIDADO MOVIL
// ======================

if (
    estados[usuario]?.paso ===
    'cantidad_consolidado_movil'
) {

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 0
    ) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese una cantidad válida'
            }
        )

        return
    }

    const campo =
        estados[usuario]
            .campoConsolidadoMovil

    estados[usuario]
        .cantidadesMovil[campo] =
        cantidad

    estados[usuario].paso =
        'menu_consolidado_movil'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Registro agregado.

Seleccione una opción:

a) Operativos
b) Requerimientos
c) Retiros temporales
d) Levantamientos de indigentes
e) Retenidos
f) Rescate animal
g) Retiro de covachas
h) ACM heridos
i) Ruidos molestos
j) Mala disposición de basura
k) Atención paramédica
l) Desalojos de libadores consumidores
m) Colaboración con otras instituciones
n) Notificación / coordinación por mala disposición de desechos
o) Finalizar consolidado`
        }
    )

    return
}

// ======================
// CONSOLIDADO MOVIL NOVEDADES
// ======================

if (
    estados[usuario]?.paso ===
    'consolidado_movil_agregar_novedad'
) {

    if (
        mensaje === 'a' ||
        mensaje === 'si' ||
        mensaje === 'sí'
    ) {

        estados[usuario].paso =
            'consolidado_movil_detalle_novedad'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Detalle las novedades suscitadas en el turno:'
            }
        )

        return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

        estados[usuario].novedadesExtra =
            ''

        await generarConsolidadoMovil(
            sock,
            usuario
        )

        delete estados[usuario]

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Sí
b) No`
        }
    )

    return
}

// ======================
// DETALLE NOVEDAD CONSOLIDADO MOVIL
// ======================

if (
    estados[usuario]?.paso ===
    'consolidado_movil_detalle_novedad'
) {

    estados[usuario].novedadesExtra =
        text

    await generarConsolidadoMovil(
        sock,
        usuario
    )

    delete estados[usuario]

    return
}



// ======================
// MENU FORMACION 
// ======================

if (
    estados[usuario]?.paso ===
    'menu_formacion'
) {

    if (mensaje === 'a') {

        const formaciones =
            cargarFormaciones()

        formaciones[usuario] = {
            tipo: 'entrante',
            radioOperadores: [],
            operativos: 0,
            policias: [],
            moviles: [
                '187',
                '188',
                '189'
            ],
            novedadMoviles: '',
            novedades: ''
        }

        guardarFormaciones(
            formaciones
        )
estados[usuario] = {
    paso: 'seleccion_radioperadores',
    tipoFormacion: 'entrante'
}
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`Seleccione el grupo de radioperadores:

a) Calderón Jorge - Zúñiga Guillermo
b) Figueroa Lenin - Burgos Darwin
c) Parraga Isaac - Muñoz Gabriel
d) Arboleda Abraham - Hidalgo Jeremy`
    }
)

        return
    }

if (mensaje === 'b') {

    const formaciones =
        cargarFormaciones()

    if (!formaciones[usuario]) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'❌ No existe una Formación Entrante registrada'
            }
        )

        return
    }

    estados[usuario] = {
        paso: 'menu_saliente',
        tipoFormacion: 'saliente'
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Se encontraron datos guardados.

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
        }
    )

    return
}

if (mensaje === 'c') {

    const formaciones =
        cargarFormaciones()

    const datos =
        formaciones[usuario]

    if (!datos) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'❌ No existen datos de formación guardados'
            }
        )

        return
    }

    const radioOperadores =
        datos.radioOperadores?.length
            ? datos.radioOperadores
                .map(nombre => `- ${nombre}`)
                .join('\n')
            : 'No registrado'

    const policias =
        datos.policias?.length
            ? datos.policias
                .map(nombre => `- ${nombre}`)
                .join('\n')
            : 'No registrado'

    const moviles =
        datos.moviles?.length
            ? datos.moviles.join('-')
            : 'No registrado'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`📋 *DATOS GUARDADOS DE FORMACIÓN*

*Radioperadores:*
${radioOperadores}

*ACM Operativos:*
${datos.operativos ?? 0}

*Personal Policial:*
${policias}

*Móviles en circulación:*
${moviles}

*Novedad móviles:*
${datos.novedadMoviles || 'Sin novedades'}

*Novedades:*
${datos.novedades || 'Sin novedades'}

¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
        }
    )

    estados[usuario] = {
        paso: 'datos_guardados_formacion'
    }

    return
}

    if (mensaje === 'd') {

        delete estados[usuario]
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Escriba MENU'
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Formación Entrante
b) Formación Saliente
c) Datos Guardados
d) Volver`
        }
    )

    return
}

// ======================
// DATOS GUARDADOS FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'datos_guardados_formacion'
) {

   // FORMACION ENTRANTE
if (mensaje === 'a') {

    estados[usuario] = {
        paso: 'novedades_formacion',
        tipoFormacion: 'entrante'
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Novedades de formación:

a) Sin novedades
b) Novedades de Moviles
c) Novedades del personal
d) Continuar`
        }
    )

    return
}

  // FORMACION SALIENTE
if (mensaje === 'b') {

    estados[usuario] = {
        paso: 'novedades_formacion',
        tipoFormacion: 'saliente'
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Novedades de formación:

a) Sin novedades
b) Novedades de Moviles
c) Novedades del personal
d) Continuar`
        }
    )

    return
}
    // MODIFICAR DATOS
    if (mensaje === 'c') {

        estados[usuario].paso =
            'modificar_saliente'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`¿Qué desea modificar?

a) Radioperadores
b) ACM Operativos
c) Personal Policial
d) Móviles
e) Novedades
f) Cancelar`
            }
        )

        return
    }

    // VOLVER
    if (mensaje === 'd') {

        delete estados[usuario]
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Escriba MENU para volver al menú principal'
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
        }
    )

    return
}

// ======================
// ELEGIR TIPO FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'elegir_tipo_formacion'
) {

    if (mensaje === 'a') {

        estados[usuario].tipoFormacion =
            'entrante'

        estados[usuario].paso =
            'novedades_formacion'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Novedades de formación:

a) Sin novedades
b) Novedades de Moviles
c) Novedades del personal
d) Continuar`
            }
        )

        return
    }

    if (mensaje === 'b') {

        estados[usuario].tipoFormacion =
            'saliente'

        estados[usuario].paso =
            'novedades_formacion'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Novedades de formación:

a) Sin novedades
b) Novedades de Moviles
c) Novedades del personal
d) Continuar`
            }
        )

        return
    }

    if (mensaje === 'c') {

        delete estados[usuario]
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Escriba MENU para volver'
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Formación Entrante
b) Formación Saliente
c) Volver`
        }
    )

    return
}

// ======================
// MODIFICAR SALIENTE / DATOS FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'modificar_saliente'
) {

    if (mensaje === 'a') {

    estados[usuario].paso =
        'seleccion_radioperadores_mod'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Seleccione el grupo de radioperadores:

a) Calderón - Zúñiga
b) Figueroa - Burgos
c) Parraga - Muñoz
d) Arboleda - Hidalgo`
        }
    )

    return
}  

    if (mensaje === 'b') {

        estados[usuario].paso =
            'mod_operativos'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese nueva cantidad de ACM Operativos'
            }
        )

        return
    }

if (mensaje === 'c') {

    const policias =
        cargarPolicias()

    let menuPolicias =
`Seleccione personal policial:

0. Sin servidor policial
`

    policias.forEach((policia, index) => {
        menuPolicias +=
`${index + 1}. ${policia}
`
    })
menuPolicias +=
`
x. Agregar nuevo servidor policial`

    estados[usuario].paso =
        'mod_policias_formacion'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: menuPolicias
        }
    )

    return
}
    
    if (mensaje === 'd') {

        estados[usuario].paso =
            'mod_moviles_operativos'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`¿Todos los móviles estuvieron operativos?

a) Sí
b) No`
            }
        )

        return
    }

if(mensaje === 'e') {

    estados[usuario].paso =
        'elegir_tipo_formacion'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`¿Qué formación desea generar?

a) Formación Entrante
b) Formación Saliente
c) Volver`
        }
    )

    return
}

    if (mensaje === 'f') {

        delete estados[usuario]
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Operación cancelada. Escriba MENU.'
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Radioperadores
b) ACM Operativos
c) Personal Policial
d) Móviles
e) Novedades
f) Cancelar`
        }
    )

    return
}

// ======================
// MOD POLICIAS FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'mod_policias_formacion'
) {

    const formaciones =
        cargarFormaciones()

    const policias =
        cargarPolicias()

if (mensaje === 'x') {

    estados[usuario].paso =
        'agregar_policia_formacion'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese rango y nombre del nuevo servidor policial'
        }
    )

    return
}

    if (mensaje === '0') {

        formaciones[usuario].policias = []

    } else {

        const indice =
            parseInt(mensaje) - 1

        if (
            isNaN(indice) ||
            !policias[indice]
        ) {
await pausaHumana(sock, usuario)
            await sock.sendMessage(
                usuario,
                {
                    text:
'Opción inválida. Seleccione un número de la lista.'
                }
            )

            return
        }

        formaciones[usuario].policias = [
            policias[indice]
        ]
    }

    guardarFormaciones(
        formaciones
    )

    estados[usuario].paso =
        'datos_guardados_formacion'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Personal policial actualizado correctamente.

¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
        }
    )

    return
}

// ======================
// AGREGAR POLICIA
// ======================

if (
    estados[usuario]?.paso ===
    'agregar_policia_formacion_mod'
) {

    const nuevoPolicia =
        text.trim()

    if (!nuevoPolicia) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese un nombre válido'
            }
        )

        return
    }

    const policias =
        cargarPolicias()

    policias.push(
        nuevoPolicia
    )

    guardarPolicias(
        policias
    )

    const formaciones =
        cargarFormaciones()

    formaciones[usuario].policias = [
        nuevoPolicia
    ]

    guardarFormaciones(
        formaciones
    )

    estados[usuario].paso =
        'datos_guardados_formacion'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Servidor policial agregado y seleccionado.

¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
        }
    )

    return
}

// ======================
// MODIFICAR OPERATIVOS
// ======================

if (
    estados[usuario]?.paso ===
    'mod_operativos'
) {

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 0
    ) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese una cantidad válida'
            }
        )

        return
    }

    const formaciones =
        cargarFormaciones()

    formaciones[usuario].operativos =
        cantidad

    guardarFormaciones(
        formaciones
    )
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'✅ ACM Operativos actualizados correctamente'
        }
    )

 estados[usuario].paso =
    'elegir_tipo_formacion'
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`¿Qué formación desea generar?

a) Formación Entrante
b) Formación Saliente
c) Volver`
    }
)

return
}

// ======================
// MODIFICAR MOVILES OPERATIVOS
// ======================

if (
    estados[usuario]?.paso ===
    'mod_moviles_operativos'
) {

    if (
        mensaje === 'a' ||
        mensaje === 'si' ||
        mensaje === 'sí'
    ) {

        const formaciones =
            cargarFormaciones()

        formaciones[usuario].moviles = [
            '187',
            '188',
            '189'
        ]

        formaciones[usuario].novedadMoviles =
            ''

        guardarFormaciones(
            formaciones
        )
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'✅ Móviles actualizados: 187-188-189'
            }
        )

   estados[usuario].paso =
    'elegir_tipo_formacion'
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`¿Qué formación desea generar?

a) Formación Entrante
b) Formación Saliente
c) Volver`
    }
)

return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

estados[usuario].paso =
    'mod_seleccionar_movil_novedad'

estados[usuario].novedadesMoviles = []

await sock.sendMessage(
    usuario,
    {
        text:
`Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
    }
)

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Sí
b) No`
        }
    )

    return
}

// ======================
// MODIFICAR MOVIL CON NOVEDAD
// ======================

if (
    estados[usuario]?.paso ===
    'mod_movil_con_novedad'
) {

    if (
        mensaje !== '187' &&
        mensaje !== '188' &&
        mensaje !== '189'
    ) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese un móvil válido: 187, 188 o 189'
            }
        )

        return
    }

    estados[usuario].movilNovedad =
        mensaje

    estados[usuario].paso =
        'mod_detalle_novedad_movil'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Indique la novedad del móvil ${mensaje}`
        }
    )

    return
}

// ======================
// MODIFICAR DETALLE NOVEDAD MOVIL
// ======================

if (
    estados[usuario]?.paso ===
    'mod_detalle_novedad_movil'
) {

    const formaciones =
        cargarFormaciones()

    const movil =
        estados[usuario].movilNovedad

    formaciones[usuario].moviles = [
        '187',
        '188',
        '189'
    ].filter(
        m => m !== movil
    )

    formaciones[usuario].novedadMoviles =
        `Móvil ${movil}: ${text}`

    guardarFormaciones(
        formaciones
    )
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'✅ Móviles actualizados correctamente'
        }
    )
estados[usuario].paso =
    'elegir_tipo_formacion'
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`¿Qué formación desea generar?

a) Formación Entrante
b) Formación Saliente
c) Volver`
    }
)

return
}



// ======================
// MENU SALIENTE
// ======================

if (
    estados[usuario]?.paso ===
    'menu_saliente'
) {

if (mensaje === 'a') {

estados[usuario].paso =
    'novedades_formacion'

estados[usuario].tipoFormacion =
    'saliente'

await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`Novedades de formación:

a) Sin novedades
b) Novedades de Moviles
c) Novedades del personal
d) Continuar`
    }
)

return
}
    if (mensaje === 'b') {

        estados[usuario].tipoFormacion =
            'saliente'

        estados[usuario].paso =
            'modificar_saliente'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`¿Qué desea modificar?

a) Radioperadores
b) ACM Operativos
c) Personal Policial
d) Móviles
e) Novedades
f) Cancelar`
            }
        )

        return
    }

    if (mensaje === 'c') {

        delete estados[usuario]
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Operación cancelada. Escriba MENU para volver.'
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
        }
    )

    return
}

// ======================
// SELECCION RADIOPERADORES
// ======================

if (
    estados[usuario]?.paso ===
    'seleccion_radioperadores'
) {

    const grupos = {
        a: [
            'CALDERON JORGE',
            'ZUÑIGA GUILLERMO'
        ],
        b: [
            'FIGUEROA LENIN',
            'BURGOS DARWIN'
        ],
        c: [
            'PARRAGA ISAAC',
            'MUÑOZ GABRIEL'
        ],
        d: [
            'ARBOLEDA ABRAHAM',
            'HIDALGO JEREMY'
        ]
    }

    if (!grupos[mensaje]) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Calderón Jorge - Zúñiga Guillermo
b) Figueroa Lenin - Burgos Darwin
c) Parraga Isaac - Muñoz Gabriel
d) Arboleda Abraham - Hidalgo Jeremy`
            }
        )

        return
    }

    const formaciones =
        cargarFormaciones()

    if (!formaciones[usuario]) {
        formaciones[usuario] = {}
    }

    formaciones[usuario].radioOperadores =
        grupos[mensaje]

    guardarFormaciones(
        formaciones
    )

    estados[usuario].paso =
        'cantidad_operativos'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'¿Cuántos ACM operativos participaron?'
        }
    )

    return
}

// ======================
// SELECCION RADIOPERADORES MOD
// ======================

if (
    estados[usuario]?.paso ===
    'seleccion_radioperadores_mod'
) {

    const grupos = {
        a: [
            'CALDERON JORGE',
            'ZUÑIGA GUILLERMO'
        ],
        b: [
            'FIGUEROA LENIN',
            'BURGOS DARWIN'
        ],
        c: [
            'PARRAGA ISAAC',
            'MUÑOZ GABRIEL'
        ],
        d: [
            'ARBOLEDA ABRAHAM',
            'HIDALGO JEREMY'
        ]
    }

    if (!grupos[mensaje]) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Calderón - Zúñiga
b) Figueroa - Burgos
c) Parraga - Muñoz
d) Arboleda - Hidalgo`
            }
        )

        return
    }

    const formaciones =
        cargarFormaciones()

    formaciones[usuario].radioOperadores =
        grupos[mensaje]

    guardarFormaciones(
        formaciones
    )
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'✅ Radioperadores actualizados correctamente'
        }
    )

    estados[usuario].paso =
        'elegir_tipo_formacion'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`¿Qué formación desea generar?

a) Formación Entrante
b) Formación Saliente
c) Volver`
        }
    )

    return
}

// ======================
// CANTIDAD OPERATIVOS
// ======================

if (
    estados[usuario]?.paso ===
    'cantidad_operativos'
) {

    console.log(
    'OPERATIVOS',
    text,
    estados[usuario]?.paso
)

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 0
    ) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese una cantidad válida'
            }
        )

        return
    }

const formaciones =
    cargarFormaciones()

formaciones[usuario]
    .operativos = cantidad

guardarFormaciones(
    formaciones
)

const policias =
    cargarPolicias()

let menuPolicias =
`Seleccione personal policial:

0. Sin servidor policial
`
policias.forEach((policia, index) => {
    menuPolicias +=
`${index + 1}. ${policia}
`
})
menuPolicias +=
`
x. Agregar nuevo servidor policial`

estados[usuario].paso =
    'presencia_policial'
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text: menuPolicias
    }
)

return

}

// ======================
// PRESENCIA POLICIAL
// ======================

if (
    estados[usuario]?.paso ===
    'presencia_policial'
) {

    const formaciones =
        cargarFormaciones()

    const policias =
        cargarPolicias()

    if (!formaciones[usuario]) {
        formaciones[usuario] = {}
    }

    if (mensaje === '0') {

        formaciones[usuario].policias = []

    } else {

if (mensaje === 'x') {

    estados[usuario].paso =
        'agregar_policia_formacion'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese rango y nombre del nuevo servidor policial'
        }
    )

    return
}

        const indice =
            parseInt(mensaje) - 1

        if (
            isNaN(indice) ||
            !policias[indice]
        ) {
await pausaHumana(sock, usuario)
            await sock.sendMessage(
                usuario,
                {
                    text:
'Opción inválida. Seleccione un número de la lista.'
                }
            )

            return
        }

        formaciones[usuario].policias = [
            policias[indice]
        ]
    }

    guardarFormaciones(
        formaciones
    )

    estados[usuario].paso =
        'moviles_operativos'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`¿Todos los móviles estuvieron operativos?

a) Sí
b) No`
        }
    )

    return
}

// ======================
// AGREGAR POLICIA FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'agregar_policia_formacion'
) {

    const nuevoPolicia =
        text.trim()

    if (!nuevoPolicia) {

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese un nombre válido'
            }
        )

        return
    }

    const policias =
        cargarPolicias()

    policias.push(
        nuevoPolicia
    )

    guardarPolicias(
        policias
    )

    const formaciones =
        cargarFormaciones()

    if (!formaciones[usuario]) {
        formaciones[usuario] = {}
    }

    formaciones[usuario].policias = [
        nuevoPolicia
    ]

    guardarFormaciones(
        formaciones
    )

    estados[usuario].paso =
        'moviles_operativos'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Servidor policial agregado y seleccionado.

¿Todos los móviles estuvieron operativos?

a) Sí
b) No`
        }
    )

    return
}

// ======================
// MOVILES OPERATIVOS
// ======================

if (
    estados[usuario]?.paso ===
    'moviles_operativos'
) {

    if (
        mensaje === 'a' ||
        mensaje === 'si' ||
        mensaje === 'sí'
    ) {

        const formaciones =
            cargarFormaciones()

        formaciones[usuario].moviles = [
            '187',
            '188',
            '189'
        ]

        formaciones[usuario].novedadMoviles = ''

        guardarFormaciones(
            formaciones
        )

estados[usuario].paso =
    'novedades_formacion'

estados[usuario].tipoFormacion =
    'entrante'
await pausaHumana(sock, usuario)
            await sock.sendMessage(
    usuario,
    {
        text:
`Novedades de formación:

a) Sin novedades
b) Novedades de Moviles
c) Novedades del personal
d) Continuar`
    }
)

        return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

estados[usuario].paso =
    'seleccionar_movil_novedad'

estados[usuario].novedadesMoviles = []
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
            }
        )

        return
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Sí
b) No`
        }
    )

    return
}
// ======================
// SELECCIONAR MÓVIL CON NOVEDAD
// ======================
if (estados[usuario]?.paso === 'seleccionar_movil_novedad') {

    const moviles = {
        a: '187',
        b: '188',
        c: '189'
    }

    if (!moviles[mensaje]) {
        await sock.sendMessage(usuario, {
            text:
`Opción inválida.

Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
        })
        return
    }

    estados[usuario].movilNovedadActual = moviles[mensaje]
    estados[usuario].paso = 'detalle_novedad_movil'

    await sock.sendMessage(usuario, {
        text: `Describa la novedad del móvil ${moviles[mensaje]}:`
    })

    return
}

// ======================
// DETALLE DE NOVEDAD DEL MÓVIL
// ======================
if (estados[usuario]?.paso === 'detalle_novedad_movil') {

    estados[usuario].novedadesMoviles.push({
        movil: estados[usuario].movilNovedadActual,
        detalle: text
    })

    estados[usuario].paso = 'otra_novedad_movil'

    await sock.sendMessage(usuario, {
        text:
`¿Desea ingresar otra novedad?

a) Sí, agregar otra novedad
b) No, continuar`
    })

    return
}

// ======================
// OTRA NOVEDAD DE MÓVIL
// ======================
if (estados[usuario]?.paso === 'otra_novedad_movil') {

    if (mensaje === 'a') {

        estados[usuario].paso =
            'seleccionar_movil_novedad'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
        })

        return
    }

    if (mensaje === 'b') {

        const formaciones =
            cargarFormaciones()

        if (!formaciones[usuario]) {
            formaciones[usuario] = {}
        }

        formaciones[usuario].novedadMoviles =
            estados[usuario].novedadesMoviles
                .map(n => `Móvil ${n.movil}: ${n.detalle}`)
                .join('\n')

        const movilesConNovedad =
            estados[usuario].novedadesMoviles
                .map(n => n.movil)

        formaciones[usuario].moviles =
            [
                '187',
                '188',
                '189'
            ].filter(
                m => !movilesConNovedad.includes(m)
            )

        guardarFormaciones(formaciones)

        estados[usuario] = {
            paso: 'otra_novedad_formacion',
            tipoFormacion: estados[usuario].tipoFormacion
        }

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`Novedad de móvil registrada.

¿Desea agregar otra novedad?

a) Agregar novedad de móvil
b) Agregar novedad del personal
c) Continuar`
        })

        return
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(usuario, {
        text:
`Opción inválida.

a) Sí, agregar otra novedad
b) No, continuar`
    })

    return
}

// ======================
// NOVEDADES FORMACION
// ======================

if (estados[usuario]?.paso === 'novedades_formacion') {

    const formaciones = cargarFormaciones()
    const tipoFormacionActual = estados[usuario].tipoFormacion

    if (!formaciones[usuario]) {
        formaciones[usuario] = {}
    }

    // SIN NOVEDADES
    if (mensaje === 'a' || mensaje === 'no') {

        if (
            !formaciones[usuario].novedades &&
            !formaciones[usuario].novedadMoviles
        ) {
            formaciones[usuario].novedades = 'Sin Novedades'
            guardarFormaciones(formaciones)
        }

        await generarFormacion(sock, usuario, tipoFormacionActual)

        estados[usuario] = {
            paso: 'datos_guardados_formacion',
            tipoFormacion: tipoFormacionActual
        }

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
        })

        return
    }

    // NOVEDADES DE MÓVIL
    if (mensaje === 'b' || mensaje === 'si' || mensaje === 'sí') {

        estados[usuario].paso = 'seleccionar_movil_novedad'
        estados[usuario].novedadesMoviles = []

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
        })

        return
    }

    // NOVEDADES DEL PERSONAL
    if (mensaje === 'c') {

        estados[usuario].paso = 'novedad_personal_formacion'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`Ingrese la novedad del personal:`
        })

        return
    }

    // CONTINUAR
    if (mensaje === 'd') {

        await generarFormacion(sock, usuario, tipoFormacionActual)

        estados[usuario] = {
            paso: 'datos_guardados_formacion',
            tipoFormacion: tipoFormacionActual
        }

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
        })

        return
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(usuario, {
        text:
`Opción inválida.

a) Sin novedades
b) Ingresar novedades de móvil
c) Novedades del personal
d) Continuar`
    })

    return
}

// ======================
// CONFIRMAR NOVEDADES EXISTENTES
// ======================

if (
    estados[usuario]?.paso ===
    'confirmar_novedades_existentes'
) {

    const formaciones =
        cargarFormaciones()

    if (!formaciones[usuario]) {
        formaciones[usuario] = {}
    }

    // AGREGAR OTRA NOVEDAD
    if (mensaje === 'a') {

        if (estados[usuario].tipoNovedadPendiente === 'movil') {

            estados[usuario].paso =
                'seleccionar_movil_novedad'

            estados[usuario].novedadesMoviles = []

            await pausaHumana(sock, usuario)

            await sock.sendMessage(
                usuario,
                {
                    text:
`Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
                }
            )

            return
        }

        if (estados[usuario].tipoNovedadPendiente === 'personal') {

            estados[usuario].paso =
                'novedad_personal_formacion'

            await pausaHumana(sock, usuario)

            await sock.sendMessage(
                usuario,
                {
                    text:
`Ingrese la novedad del personal:`
                }
            )

            return
        }
    }

    // SOBRESCRIBIR NOVEDADES
    if (mensaje === 'b') {

formaciones[usuario].novedades = ''
formaciones[usuario].novedadMoviles = ''
formaciones[usuario].moviles = ['187', '188', '189']


        guardarFormaciones(formaciones)

        if (estados[usuario].tipoNovedadPendiente === 'movil') {

            estados[usuario].paso =
                'seleccionar_movil_novedad'

            estados[usuario].novedadesMoviles = []

            await pausaHumana(sock, usuario)

            await sock.sendMessage(
                usuario,
                {
                    text:
`Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
                }
            )

            return
        }

        if (estados[usuario].tipoNovedadPendiente === 'personal') {

            estados[usuario].paso =
                'novedad_personal_formacion'

            await pausaHumana(sock, usuario)

            await sock.sendMessage(
                usuario,
                {
                    text:
`Ingrese la novedad del personal:`
                }
            )

            return
        }
    }

    // BORRAR NOVEDADES
    if (mensaje === 'c') {

        formaciones[usuario].novedades =
            'Sin Novedades'

        guardarFormaciones(formaciones)

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`Novedades anteriores borradas.

¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
            }
        )

        estados[usuario] = {
            paso: 'datos_guardados_formacion'
        }

        return
    }

    // CANCELAR
    if (mensaje === 'd') {

        estados[usuario].paso =
            'datos_guardados_formacion'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`Operación cancelada.

¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
            }
        )

        return
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Agregar otra novedad
b) Sobrescribir las novedades anteriores
c) Borrar las novedades anteriores
d) Cancelar`
        }
    )

    return
}

// ======================
// GUARDAR NOVEDAD PERSONAL FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'novedad_personal_formacion'
) {

    const formaciones =
        cargarFormaciones()

    if (!formaciones[usuario]) {
        formaciones[usuario] = {}
    }

    const novedadPersonal =
        `Novedad del personal: ${mensaje}`

    if (
        !formaciones[usuario].novedades ||
        formaciones[usuario].novedades === '' ||
        formaciones[usuario].novedades === 'Sin Novedades'
    ) {
        formaciones[usuario].novedades =
            novedadPersonal
    } else {
        formaciones[usuario].novedades +=
            `\n${novedadPersonal}`
    }

    guardarFormaciones(formaciones)

   estados[usuario] = {
    paso: 'otra_novedad_formacion',
    tipoFormacion: estados[usuario].tipoFormacion
}

await pausaHumana(sock, usuario)

await sock.sendMessage(usuario, {
    text:
`Novedad del personal registrada.

¿Desea agregar otra novedad?

a) Agregar novedad de Móvil
b) Agregar novedad del Personal
c) Continuar`
})

return
}

// ======================
// OTRA NOVEDAD FORMACION
// ======================

if (estados[usuario]?.paso === 'otra_novedad_formacion') {

    if (mensaje === 'a') {

        estados[usuario].paso =
            'seleccionar_movil_novedad'

        estados[usuario].novedadesMoviles = []

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`Seleccione el móvil que tuvo novedad:

a) Móvil 187
b) Móvil 188
c) Móvil 189`
        })

        return
    }

    if (mensaje === 'b') {

        estados[usuario].paso =
            'novedad_personal_formacion'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`Ingrese la novedad del personal:`
        })

        return
    }

    if (mensaje === 'c') {

        await generarFormacion(
            sock,
            usuario,
            estados[usuario].tipoFormacion
        )

        estados[usuario] = {
            paso: 'datos_guardados_formacion',
            tipoFormacion: estados[usuario].tipoFormacion
        }

        await pausaHumana(sock, usuario)

        await sock.sendMessage(usuario, {
            text:
`¿Qué desea hacer?

a) Formación Entrante
b) Formación Saliente
c) Modificar datos
d) Volver`
        })

        return
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(usuario, {
        text:
`Opción inválida.

a) Agregar novedad de móvil
b) Agregar novedad del personal
c) Continuar`
    })

    return
}

// ======================
// INICIAR
// ======================

if (
    mensaje === '/cartilla'
) {

    const usuarios = cargarUsuarios()

    // USUARIO YA EXISTE
    if (usuarios[usuario]) {

        estados[usuario] = {
            paso: 'menu_memoria'
        }
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`✅ DATOS GUARDADOS

JP: ${usuarios[usuario].jp}
CP: ${usuarios[usuario].cp}
MOVIL: ${usuarios[usuario].movil}
POLICIA: ${usuarios[usuario].policia}

¿Desea usar estos datos?

1. SI
2. NO, CAMBIAR DATOS`
            }
        )

        return

    }

    // USUARIO NUEVO
    estados[usuario] = {
        paso: 'jp'
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese nombre del agente JP'
        }
    )

    return

}

// ======================
// MENU MEMORIA
// ======================

if (
    estados[usuario]?.paso ===
    'menu_memoria'
) {

    // USAR DATOS GUARDADOS
    if (mensaje === '1') {

        estados[usuario] = {
            paso: 'direccion'
        }

        const direcciones =
            cargarDirecciones()

        let lista = ''

        direcciones.forEach(
            (d, i) => {

                lista +=
`${i + 1}. ${d}\n`

            }
        )
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione dirección guardada o escriba una nueva:\n\n${lista}`
            }
        )

        return

    }

    // CAMBIAR DATOS
    if (mensaje === '2') {

        estados[usuario] = {
            paso: 'editar_datos'
        }
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`¿Qué desea cambiar?

1. JP
2. MOVIL
3. CP
4. POLICIA`
            }
        )

        return

    }

}

// ======================
// EDITAR DATOS
// ======================

if (
    estados[usuario]?.paso ===
    'editar_datos'
) {

    if (mensaje === '1') {

        estados[usuario] = {
            paso: 'nuevo_jp'
        }
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese nuevo JP'
            }
        )

        return

    }

    if (mensaje === '2') {

        estados[usuario] = {
            paso: 'nuevo_movil'
        }
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Seleccione móvil:\n1. MOVIL 187\n2. MOVIL 188\n3. MOVIL 189'
            }
        )

        return

    }

    if (mensaje === '3') {

        estados[usuario] = {
            paso: 'nuevo_cp'
        }
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese nuevo CP'
            }
        )

        return

    }

if (mensaje === '4') {

    const policias =
        cargarPolicias()

    let menuPolicias =
`Seleccione servidor policial:

0. Sin servidor policial
`

policias.forEach((policia, index) => {
    menuPolicias +=
`${index + 1}. ${policia}
`
})
menuPolicias +=
`
x. Agregar nuevo servidor policial`

    estados[usuario] = {
        paso: 'nuevo_policia'
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: menuPolicias
        }
    )

    return
}
}

// ======================
// GUARDAR NUEVO JP
// ======================

if (
    estados[usuario]?.paso ===
    'nuevo_jp'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        jp: text
    }

    guardarUsuarios(
        usuarios
    )

estados[usuario] = {
    paso: 'continuar_edicion'
}
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`✅ Datos actualizados correctamente

¿Desea cambiar algo más?

1. SI
2. CONTINUAR CON CARTILLA`
    }
)

return

}

// ======================
// GUARDAR NUEVO MOVIL
// ======================

if (
    estados[usuario]?.paso ===
    'nuevo_movil'
) {

    let movil = ''

    if (mensaje === '1') {
        movil = 'MOVIL 187'
    }

    else if (mensaje === '2') {
        movil = 'MOVIL 188'
    }

    else if (mensaje === '3') {
        movil = 'MOVIL 189'
    }

    else {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'❌ Selección inválida'
            }
        )

        return

    }

    usuarios[usuario] = {
        ...usuarios[usuario],
        movil
    }

    guardarUsuarios(
        usuarios
    )

estados[usuario] = {
    paso: 'continuar_edicion'
}
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`✅ Datos actualizados correctamente

¿Desea cambiar algo más?

1. SI
2. CONTINUAR CON CARTILLA`
    }
)

return

}

// ======================
// GUARDAR NUEVO CP
// ======================

if (
    estados[usuario]?.paso ===
    'nuevo_cp'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        cp: text
    }

    guardarUsuarios(
        usuarios
    )

estados[usuario] = {
    paso: 'continuar_edicion'
}
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`✅ Datos actualizados correctamente

¿Desea cambiar algo más?

1. SI
2. CONTINUAR CON CARTILLA`
    }
)

return

}

// ======================
// GUARDAR NUEVO POLICIA
// ======================

if (
    estados[usuario]?.paso ===
    'nuevo_policia'
) {

    const policias =
        cargarPolicias()

    let policiaSeleccionado = ''

    if (mensaje === '0') {

        policiaSeleccionado =
            ''

    } else {

        const indice =
            parseInt(mensaje) - 1

        if (
            isNaN(indice) ||
            !policias[indice]
        ) {
await pausaHumana(sock, usuario)
            await sock.sendMessage(
                usuario,
                {
                    text:
'Opción inválida. Seleccione un número de la lista.'
                }
            )

            return
        }

        policiaSeleccionado =
    policias[indice]
    }

    usuarios[usuario] = {
        ...usuarios[usuario],
        policia: policiaSeleccionado
    }

    guardarUsuarios(
        usuarios
    )

    estados[usuario] = {
        paso: 'continuar_edicion'
    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Datos actualizados correctamente

¿Desea cambiar algo más?

1. SI
2. CONTINUAR CON CARTILLA`
        }
    )

    return
}

// ======================
// CONTINUAR EDICION
// ======================

if (
    estados[usuario]?.paso ===
    'continuar_edicion'
) {

    // VOLVER A EDITAR
    if (mensaje === '1') {

        estados[usuario] = {
            paso: 'editar_datos'
        }
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`¿Qué desea cambiar?

1. JP
2. MOVIL
3. CP
4. POLICIA`
            }
        )

        return

    }

    // CONTINUAR CARTILLA
    if (mensaje === '2') {

        estados[usuario] = {
            paso: 'direccion'
        }

        const direcciones =
            cargarDirecciones()

        let lista = ''

        direcciones.forEach(
            (d, i) => {

                lista +=
`${i + 1}. ${d}\n`

            }
        )
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione dirección guardada o escriba una nueva:\n\n${lista}`
            }
        )

        return

    }
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'❌ Opción inválida'
        }
    )

    return

}

                // ======================
                // JP
                // ======================

                if (
                    estados[usuario]
                        ?.paso === 'jp'
                ) {

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        jp: text
                    }

                    guardarUsuarios(
                        usuarios
                    )

                    estados[usuario]
                        .paso = 'movil'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'Seleccione móvil:\n1. MOVIL 187\n2. MOVIL 188\n3. MOVIL 189'
                        }
                    )

                    return

                }

                // ======================
                // MOVIL
                // ======================

                if (
                    estados[usuario]
                        ?.paso === 'movil'
                ) {

                    let movil = ''

                    if (mensaje === '1') {
                        movil =
                            'MOVIL 187'
                    }

                    if (mensaje === '2') {
                        movil =
                            'MOVIL 188'
                    }

                    if (mensaje === '3') {
                        movil =
                            'MOVIL 189'
                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        movil
                    }

                    guardarUsuarios(
                        usuarios
                    )

                    estados[usuario]
                        .paso = 'cp'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'Ingrese nombre del conductor CP'
                        }
                    )

                    return

                }

// ======================
// CP  
// ======================

if (
    estados[usuario]
        ?.paso === 'cp'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        cp: text
    }

    guardarUsuarios(
        usuarios
    )

    const policias =
        cargarPolicias()

    let menuPolicias =
`Seleccione servidor policial:

0. Sin servidor policial
`

policias.forEach((policia, index) => {
    menuPolicias +=
`${index + 1}. ${policia}
`

})

    estados[usuario]
        .paso = 'policia'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text: menuPolicias
        }
    )

    return
}

// ======================
// POLICIA  
// ======================

if (
    estados[usuario]
        ?.paso === 'policia'
) {

    const policias =
        cargarPolicias()

    let policiaSeleccionado = ''

    if (mensaje === '0') {

        policiaSeleccionado = ''

    } else {

        const indice =
            parseInt(mensaje) - 1

        if (
            isNaN(indice) ||
            !policias[indice]
        ) {
await pausaHumana(sock, usuario)
            await sock.sendMessage(
                usuario,
                {
                    text:
'Opción inválida. Seleccione un número de la lista.'
                }
            )

            return
        }

        policiaSeleccionado =
            policias[indice]
    }

    const jornadaActual =
        obtenerJornadaAutomatica()

    usuarios[usuario] = {
        ...usuarios[usuario],
        policia: policiaSeleccionado,
        jornada: jornadaActual.jornada,
        horario: jornadaActual.horario
    }

    guardarUsuarios(
        usuarios
    )

    estados[usuario]
        .paso =
        'direccion'

    const direcciones =
        cargarDirecciones()

    let lista = ''

    direcciones.forEach(
        (d, i) => {

            lista +=
`${i + 1}. ${d}\n`

        }
    )
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Direcciones guardadas:

${lista}
Escriba una dirección nueva o el número de una existente`
        }
    )

    return
}
// ======================
// JORNADA
// ======================

if (
    estados[usuario]
        ?.paso ===
    'jornada'
) {

    const jornadaActual =
        obtenerJornadaAutomatica()

    usuarios[usuario] = {
        ...usuarios[usuario],
        jornada:
            jornadaActual.jornada,
        horario:
            jornadaActual.horario
    }

    guardarUsuarios(
        usuarios
    )

    estados[usuario]
        .paso =
        'direccion'

    const direcciones =
        cargarDirecciones()

    let lista = ''

    direcciones.forEach(
        (d, i) => {

            lista +=
`${i + 1}. ${d}\n`

        }
    )
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Direcciones guardadas:\n\n${lista}\nEscriba una dirección nueva o el número de una existente`
        }
    )

    return

}
                
                // ======================
                // DIRECCION
                // ======================

                if (
                    estados[usuario]
                        ?.paso ===
                    'direccion'
                ) {

                    const direcciones =
                        cargarDirecciones()

                    let direccion =
                        text

                    if (!isNaN(mensaje)) {

    direccion =
        direcciones[
            Number(mensaje) - 1
        ]

    // SI NO EXISTE LA DIRECCION
    if (!direccion) {
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'❌ Dirección inválida'
            }
        )

        return
    }

}

                    else {

                        direcciones.push(
                            text
                        )

                        guardarDirecciones(
                            direcciones
                        )

                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        direccion
                    }

                    guardarUsuarios(
                        usuarios
                    )

                    estados[usuario]
                        .paso =
                        'causa'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
`Seleccione la causa:

a) Desalojo de vendedores
b) Retiro temporal
c) Requerimiento
d) Rondas disuasivas
e) Punto martillo
f) Colaboración con otras entidades
g) Colaboración ciudadana
h) Accidente
i) Permiso de ausentismo`                        }
                    )

                    return

                }

                // ======================
                // CAUSA
                // ======================

                if (
                    estados[usuario]
                        ?.paso ===
                    'causa'
                ) {

const causas = {

    a:
'Desalojo de vendedores autónomos no regularizados',

    b:
'Retiro temporal',

    c:
'Requerimiento',

    d:
'Rondas disuasivas',

    e:
'Punto martillo',

    f:
'Colaboración con otras entidades',

    g:
'Colaboración ciudadana',

    h:
'Accidente',

    i:
'Permiso de ausentismo'
}

                    const causa =
                        causas[mensaje]

                    if (!causa) {
await pausaHumana(sock, usuario)
                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'❌ Causa inválida'
                            }
                        )

                        return

                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        causa
                    }

                    guardarUsuarios(
                        usuarios
                    )

//PERMISO DE AUSENTISMO

if (mensaje === 'i') {

    estados[usuario].paso =
        'tipo_permiso_ausentismo'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`Seleccione el tipo de permiso:

a) Permiso por horas
b) Permiso por días`
        }
    )

    return
}

//COLABORACION CIUDADANA
if (mensaje === 'g') {

    estados[usuario].desdeColaboracionCiudadana =
        true

    estados[usuario].paso =
        'inc_eas_menu'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`*COLABORACIÓN CIUDADANA*

a) Denuncias Ciudadanas
b) Requerimientos Ciudadanos
c) Volver`
        }
    )

    return
}

                    // DESALOJO

                    if (
                        mensaje === 'a'
                    ) {

                        estados[usuario]
                            .paso =
                            'agresivos'
await pausaHumana(sock, usuario)
                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'¿Los comerciantes se pusieron agresivos?\n1. Si\n2. No'
                            }
                        )

                        return

                    }

                    // REQUERIMIENTO

if (
    mensaje === 'c'
) {

    estados[usuario].paso =
        'solicitante_requerimiento'

    await pausaHumana(
        sock,
        usuario
    )

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Quién solicita el requerimiento?

a) ECO-12
b) CR
c) OJ1
d) Jefe de Control Municipal
e) Lima Oscar
f) Sircon Andrade
g) Sr. Figallo
h) Sr. Alex Anchundia`
        }
    )

    return
}

// RETIRO TEMPORAL

if (
    mensaje === 'b'
) {

    estados[usuario].paso =
        'actividad_comercial_retiro'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Indique la actividad comercial del comerciante:'
        }
    )

    return
}                    

// COLABORACIÓN CON OTRAS ENTIDADES

if (
    mensaje === 'f'
) {

    estados[usuario].paso =
        'entidad_colaboracion'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`Seleccione la entidad:

a) Policía
b) ATM
c) CTE
d) Bomberos
e) Paramédicos
f) Fuerzas Armadas`
        }
    )

    return
}

// ======================
// ACCIDENTE
// ======================

if (mensaje === 'h') {

    estados[usuario].paso =
        'tipo_accidente'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
`Seleccione tipo de accidente:

a. Accidente entre dos vehículos
b. Accidente múltiple
c. Choque y daño al espacio y vía pública
d. Accidente entre vehículo y persona`
        }
    )

    return

}

     // OTRAS CAUSAS

let procedimientoFinal =
`se procedió con ${causa}.`

// AGREGAR APOYO DISUASIVO
if (
    mensaje === 'd' ||
    mensaje === 'e' 
) {

    procedimientoFinal =
`se procedió con ${causa}, dando apoyo a la seguridad ciudadana y presencia disuasiva.`

}

await generarCartilla(
    sock,
    usuario,
    procedimientoFinal
)

estados[usuario].paso =
    'otra_cartilla'

await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
    }
)

return

                }

// ======================
// ACTIVIDAD COMERCIAL RETIRO
// ======================

if (
    estados[usuario]?.paso ===
    'actividad_comercial_retiro'
) {

    estados[usuario].actividadComercial =
        text

    estados[usuario].paso =
        'elementos_retiro'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Describa los elementos retirados temporalmente:'
        }
    )

    return
}

// ======================
// ELEMENTOS RETIRO
// ======================

if (
    estados[usuario]?.paso ===
    'elementos_retiro'
) {

    estados[usuario].elementosRetiro =
        text

    estados[usuario].paso =
        'cantidad_retiro'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Indique la cantidad aproximada de elementos retirados:'
        }
    )

    return
}

// ======================
// CANTIDAD RETIRO
// ======================

if (
    estados[usuario]?.paso ===
    'cantidad_retiro'
) {

    estados[usuario].cantidadRetiro =
        text

    const procedimiento =
`mediante operativo conjunto con móviles que se encontraban realizando recorridos dentro del circuito EAS CEIBOS, se procedió a ejecutar acciones de control sobre vendedores autónomos no regularizados que se encontraban ocupando el espacio público.

Durante el procedimiento se identificó a un comerciante dedicado a la actividad de "${estados[usuario].actividadComercial}", quien se negaba a retirarse voluntariamente del lugar pese a las indicaciones emitidas por el personal operativo.

En cumplimiento de las ordenanzas municipales referentes al uso adecuado del espacio y la vía pública, se procedió a realizar el retiro temporal de mercadería, detallándose los siguientes elementos:

${estados[usuario].elementosRetiro}

Cantidad aproximada de elementos retirados temporalmente: ${estados[usuario].cantidadRetiro}.`

    await generarCartilla(
        sock,
        usuario,
        procedimiento
    )

    estados[usuario] = {
        paso: 'otra_cartilla'
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
        }
    )

    return
}

// ======================
// SOLICITANTE REQUERIMIENTO
// ======================

if (
    estados[usuario]?.paso ===
    'solicitante_requerimiento'
) {

    const solicitantes = {
        a: 'ECO-12',
        b: 'CR',
        c: 'OJ1',
        d: 'Jefe de Control Municipal',
        e: 'Lima Oscar',
        f: 'Sircon Andrade',
        g: 'Sr. Figallo',
        h: 'Sr. Alex Anchundia'
    }

    const solicitante =
        solicitantes[mensaje]

    if (!solicitante) {

        await sock.sendMessage(
            usuario,
            {
                text:
'❌ Opción inválida'
            }
        )

        return
    }

    estados[usuario].solicitante =
        solicitante

    estados[usuario].paso =
        'tipo_requerimiento'

    await pausaHumana(
        sock,
        usuario
    )

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Qué requerimiento realizará?

a) Requerimiento
b) Punto martillo
c) Ronda disuasiva
d) Presencia de Agente de Control
e) Operativo en conjunto`
        }
    )

    return
}

// ======================
// TIPO REQUERIMIENTO
// ======================

if (
    estados[usuario]?.paso ===
    'tipo_requerimiento'
) {

        const usuarios =
        cargarUsuarios()

    const datos =
        usuarios[usuario]

let accion = ''

if (mensaje === 'a') {

    accion =
`se procede a atender requerimiento en el sector de ${datos.direccion} para apoyo a la seguridad ciudadana.`
}

if (mensaje === 'b') {

    accion =
`se procede a ejecutar punto martillo en ${datos.direccion} para control del espacio público y apoyo a la seguridad ciudadana.`
}

if (mensaje === 'c') {

    accion =
`se procede a realizar ronda disuasiva a lo largo de ${datos.direccion} para apoyo a la seguridad ciudadana.`
}

if (mensaje === 'd') {

    accion =
`se procede a brindar presencia de Agente de Control en ${datos.direccion} para apoyo a la seguridad ciudadana.`
}

if (mensaje === 'e') {

    accion =
`se procede a ejecutar operativo en conjunto en ${datos.direccion} para control del espacio público y apoyo a la seguridad ciudadana.`
}

if (!accion) {

    await sock.sendMessage(
        usuario,
        {
            text:
'❌ Opción inválida'
        }
    )

    return
}

const procedimiento =
`por órdenes de ${estados[usuario].solicitante} ${accion}`

    await generarCartilla(
        sock,
        usuario,
        procedimiento
    )

    estados[usuario] = {
        paso: 'otra_cartilla'
    }

    await pausaHumana(
        sock,
        usuario
    )

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
        }
    )

    return
}

// ======================
// ENTIDAD COLABORACION
// ======================

if (
    estados[usuario]?.paso ===
    'entidad_colaboracion'
) {

    const entidades = {
        a: 'Policía',
        b: 'ATM',
        c: 'CTE',
        d: 'Bomberos',
        e: 'Paramédicos',
        f: 'Fuerzas Armadas'
    }

    const entidad =
        entidades[mensaje]

    if (!entidad) {

        await sock.sendMessage(
            usuario,
            {
                text:
'❌ Opción inválida'
            }
        )

        return
    }

    estados[usuario].entidadColaboracion =
        entidad

    estados[usuario].paso =
        'motivo_colaboracion'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Especifique el motivo de la colaboración:'
        }
    )

    return
}

// ======================
// MOTIVO COLABORACION
// ======================

if (
    estados[usuario]?.paso ===
    'motivo_colaboracion'
) {

    const procedimiento =
`se procedió con la colaboración a los señores de ${estados[usuario].entidadColaboracion} debido a ${text}.`

    await generarCartilla(
        sock,
        usuario,
        procedimiento
    )

    estados[usuario] = {
        paso: 'otra_cartilla'
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
        }
    )

    return
}

// ======================
// MENU INCIDENCIAS EAS DESDE COLABORACION CIUDADANA
// ======================

if (
    estados[usuario]?.paso ===
    'menu_incidencias_eas_colaboracion_ciudadana'
) {

    if (mensaje === 'a') {

        estados[usuario].paso =
            'incidencia_eas_denuncia'

        estados[usuario].tipoIncidenciaEAS =
            'Denuncias Ciudadanas'

        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione el tipo de denuncia ciudadana:

a) Robo a mano armada
b) Pérdida de bien inmueble
c) Extorsión a local
d) Amenazas
e) Desaparición de persona`
            }
        )

        return
    }

    if (mensaje === 'b') {

        estados[usuario].paso =
            'incidencia_eas_requerimiento'

        estados[usuario].tipoIncidenciaEAS =
            'Requerimientos Ciudadanos'

        await sock.sendMessage(
            usuario,
            {
                text:
`Ingrese el nombre del ciudadano:`
            }
        )

        return
    }

    if (mensaje === 'c') {

        estados[usuario].paso =
            'causa'

        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione la causa:

a) Desalojo de vendedores
b) Retiro temporal
c) Requerimiento
d) Rondas disuasivas
e) Punto martillo
f) Colaboración con otras entidades
g) Colaboración ciudadana
h) Accidente
i) Permiso de ausentismo`
            }
        )

        return
    }

    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

Colaboración ciudadana:

a) Denuncias Ciudadanas
b) Requerimientos Ciudadanos
c) Volver`
        }
    )

    return
}

// ======================
// TIPO PERMISO AUSENTISMO
// ======================

if (
    estados[usuario]?.paso ===
    'tipo_permiso_ausentismo'
) {

    if (mensaje === 'a') {

        estados[usuario].permisoAusentismo = {
            tipo: 'horas'
        }

        estados[usuario].paso =
            'permiso_hora_salida'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese la hora de salida:'
            }
        )

        return
    }

    if (mensaje === 'b') {

        estados[usuario].permisoAusentismo = {
            tipo: 'dias'
        }

        estados[usuario].paso =
            'permiso_fecha_inicio'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese la fecha de inicio del permiso:'
            }
        )

        return
    }

    return
}

// ======================
// PERMISO HORA SALIDA
// ======================

if (
    estados[usuario]?.paso ===
    'permiso_hora_salida'
) {

    estados[usuario]
        .permisoAusentismo
        .horaSalida = text

    estados[usuario].paso =
        'permiso_hora_retorno'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese la hora de retorno:'
        }
    )

    return
}

// ======================
// PERMISO HORA RETORNO
// ======================

if (
    estados[usuario]?.paso ===
    'permiso_hora_retorno'
) {

    estados[usuario]
        .permisoAusentismo
        .horaRetorno = text

    estados[usuario].paso =
        'motivo_permiso_ausentismo'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`Motivo del permiso:

a) Exámenes médicos
b) Nacimiento
c) Paternidad
d) Maternidad
e) Estudios
f) Calamidad doméstica
g) Otro`
        }
    )

    return
}

// ======================
// FECHA INICIO PERMISO
// ======================

if (
    estados[usuario]?.paso ===
    'permiso_fecha_inicio'
) {

    estados[usuario]
        .permisoAusentismo
        .fechaInicio = text

    estados[usuario].paso =
        'permiso_fecha_fin'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese la fecha de fin del permiso:'
        }
    )

    return
}

// ======================
// FECHA FIN PERMISO
// ======================

if (
    estados[usuario]?.paso ===
    'permiso_fecha_fin'
) {

    estados[usuario]
        .permisoAusentismo
        .fechaFin = text

    estados[usuario].paso =
        'motivo_permiso_ausentismo'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`Motivo del permiso:

a) Exámenes médicos
b) Nacimiento
c) Paternidad
d) Maternidad
e) Estudios
f) Calamidad doméstica
g) Otro`
        }
    )

    return
}

// ======================
// MOTIVO PERMISO AUSENTISMO
// ======================

if (
    estados[usuario]?.paso ===
    'motivo_permiso_ausentismo'
) {

    const motivos = {
        a: 'permiso por exámenes médicos',
        b: 'permiso por nacimiento',
        c: 'permiso de paternidad',
        d: 'permiso de maternidad',
        e: 'permiso de estudios',
        f: 'permiso por calamidad doméstica',
        g: 'otro'
    }

    if (!motivos[mensaje]) {

        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

Motivo del permiso:

a) Exámenes médicos
b) Nacimiento
c) Paternidad
d) Maternidad
e) Estudios
f) Calamidad doméstica
g) Otro`
            }
        )

        return
    }

    estados[usuario].permisoAusentismo.motivo =
        motivos[mensaje]

    if (
        mensaje === 'f' ||
        mensaje === 'g'
    ) {

        estados[usuario].paso =
            'detalle_permiso_ausentismo'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'Detalle la causa o motivo por el que se retira del servicio:'
            }
        )

        return
    }

    estados[usuario].paso =
        'lugar_permiso_ausentismo'

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
'Mencione el nombre del lugar hacia donde se dirige:'
        }
    )

    return
}

// ======================
// LUGAR PERMISO AUSENTISMO
// ======================

if (
    estados[usuario]?.paso ===
    'lugar_permiso_ausentismo'
) {

    const permiso =
        estados[usuario].permisoAusentismo

    let tiempoPermiso = ''

    if (permiso.tipo === 'horas') {
        tiempoPermiso =
`desde las ${permiso.horaSalida} hasta las ${permiso.horaRetorno}`
    }

    if (permiso.tipo === 'dias') {
        tiempoPermiso =
`desde el ${permiso.fechaInicio} hasta el ${permiso.fechaFin}`
    }

    const accion =
        permiso.tipo === 'horas'
            ? 'me retiro temporalmente de mis funciones'
            : 'me ausento temporalmente de mis funciones'

const motivoTexto =
    permiso.motivo === 'otro'
        ? ''
        : ` por ${permiso.motivo}`

const procedimiento =
`me permito informar que ${accion}${motivoTexto} ${tiempoPermiso}, trasladándome a ${text} para cumplir con la diligencia correspondiente.`

    await generarCartilla(
        sock,
        usuario,
        procedimiento
    )

    estados[usuario] = {
        paso: 'otra_cartilla'
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
        }
    )

    return
}

// ======================
// DETALLE PERMISO AUSENTISMO
// ======================

if (
    estados[usuario]?.paso ===
    'detalle_permiso_ausentismo'
) {

    const permiso =
        estados[usuario].permisoAusentismo

    let tiempoPermiso = ''

    if (permiso.tipo === 'horas') {
        tiempoPermiso =
`desde las ${permiso.horaSalida} hasta las ${permiso.horaRetorno}`
    }

    if (permiso.tipo === 'dias') {
        tiempoPermiso =
`desde el ${permiso.fechaInicio} hasta el ${permiso.fechaFin}`
    }

    const accion =
        permiso.tipo === 'horas'
            ? 'me retiro temporalmente de mis funciones'
            : 'me ausento temporalmente de mis funciones'

const motivoTexto =
    permiso.motivo === 'otro'
        ? ''
        : ` por ${permiso.motivo}`

const procedimiento =
`me permito informar que ${accion}${motivoTexto} ${tiempoPermiso}, debido a ${text}.`

    await generarCartilla(
        sock,
        usuario,
        procedimiento
    )

    estados[usuario] = {
        paso: 'otra_cartilla'
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
        }
    )

    return
}



                // ======================
                // AGRESIVOS
                // ======================

                if (
                    estados[usuario]
                        ?.paso ===
                    'agresivos'
                ) {

                    if (
                        mensaje === '1'
                    ) {

                        estados[usuario]
                            .paso =
                            'colaboracion'
await pausaHumana(sock, usuario)
                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'¿Necesita colaboración para operativo?\n1. Si\n2. No'
                            }
                        )

                        return

                    }

                    const procedimiento =
`se realizo el desalojo de vendedores autónomos no regularizados que se encontraban realizando actividad comercial en los alrededores; asi mismo de manera pacífica y respetando la integridad de los señores comerciantes no regularizados se les indicó que no pueden permanecer en el lugar y que posterior a ello se retiren del sitio, así mismo haciendo cumplir la ordenanza municipal De Uso De Espacio Y Vía Pública se dejó el espacio sin novedad.`

//
await generarCartilla(
    sock,
    usuario,
    procedimiento
)

estados[usuario] = {
    paso: 'otra_cartilla'
}
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
    }
)

return

}

                // ======================
                // COLABORACION
                // ======================

                if (
                    estados[usuario]
                        ?.paso ===
                    'colaboracion'
                ) {

                    let procedimiento =
                        ''

                    if (
                        mensaje === '1'
                    ) {

                        procedimiento =
`se procedió a realizar el desalojo de vendedores autónomos no regularizados que se encontraban realizando actividad comercial en los alrededores; asi mismo los señores hacen caso omiso a las indicaciones que se les está dando de parte del personal municipal, solicito colaboración con otro móvil para realizar un operativo en el sector mencionado para evitar el asentamiento no regularizado de los comerciantes en el punto.`

                    }

                    else {

                        procedimiento =
`se procedió a realizar el desalojo de vendedores autónomos no regularizados que se encontraban realizando actividad comercial en los alrededores; asi mismo los señores hacen caso omiso, de tal manera se les indicó que, si mantenían esa actitud y no colaboraban con lo solicitado, se procedería a realizar el retiro temporal de la mercadería, de tal modo una vez indicado el procedimiento que iba a tomar el personal municipal, procedieron a retirarse.`

                    }

                    await generarCartilla(
                        sock,
                        usuario,
                        procedimiento
                    )

                    estados[usuario] = {
                        paso: 'otra_cartilla'
                    }
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
                        }
                    )

                    return
                }

                // ======================
                // TIPO ACCIDENTE
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'tipo_accidente'
                ) {

                    let tipo = ''

                    if (mensaje === 'a') {
                        tipo =
'Accidente entre dos vehículos'
                    }

                    else if (mensaje === 'b') {
                        tipo =
'Accidente múltiple'
                    }

                    else if (mensaje === 'c') {
                        tipo =
'Choque y daño al espacio público'
                    }

                    else if (mensaje === 'd') {
                        tipo =
'Accidente entre vehículo y persona'
                    }

                    else {
await pausaHumana(sock, usuario)
                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'❌ Opción inválida'
                            }
                        )

                        return
                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        tipoAccidente: tipo
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'heridos'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hubo heridos?\n1. Sí\n2. No'
                        }
                    )

                    return
                }

                // ======================
                // HERIDOS
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'heridos'
                ) {

                    if (mensaje === '1') {

                        estados[usuario].paso =
                            'cantidad_heridos'
await pausaHumana(sock, usuario)
                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'¿Cuántos heridos hubo?'
                            }
                        )

                        return
                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        heridos: 'No hubo heridos'
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'muertos'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hubo fallecidos?\n1. Sí\n2. No'
                        }
                    )

                    return
                }

                // ======================
                // CANTIDAD HERIDOS
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'cantidad_heridos'
                ) {

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        cantidadHeridos: text
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'nombres_heridos'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'Ingrese nombres completos de los heridos'
                        }
                    )

                    return
                }

                // ======================
                // NOMBRES HERIDOS
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'nombres_heridos'
                ) {

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        heridos:
`${usuarios[usuario].cantidadHeridos} heridos: ${text}`
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'muertos'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hubo fallecidos?\n1. Sí\n2. No'
                        }
                    )

                    return
                }

                // ======================
                // MUERTOS
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'muertos'
                ) {

                    if (mensaje === '1') {

                        estados[usuario].paso =
                            'criminalistica'
await pausaHumana(sock, usuario)
                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'¿Hubo colaboración de Criminalística?\n1. Sí\n2. No'
                            }
                        )

                        return
                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        muertos: 'No hubo fallecidos'
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'atm'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hubo colaboración ATM?\n1. Sí\n2. No'
                        }
                    )

                    return
                }

                // ======================
                // CRIMINALISTICA
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'criminalistica'
                ) {

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        criminalistica:
mensaje === '1'
? 'Sí hubo colaboración de Criminalística'
: 'No hubo colaboración de Criminalística'
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'atm'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hubo colaboración ATM?\n1. Sí\n2. No'
                        }
                    )

                    return
                }

                // ======================
                // ATM
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'atm'
                ) {

                    if (mensaje === '1') {

                        estados[usuario].paso =
                            'datos_atm'
await pausaHumana(sock, usuario)
                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'Ingrese nombre del ATM y número de moto'
                            }
                        )

                        return
                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        atm: 'No hubo colaboración ATM'
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'ambulancia'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hubo ambulancia?\n1. Sí\n2. No'
                        }
                    )

                    return
                }

                // ======================
                // DATOS ATM
                // ======================

                if (
                    estados[usuario]?.paso ===
                    'datos_atm'
                ) {

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        atm:
`ATM presente: ${text}`
                    }

                    guardarUsuarios(usuarios)

                    estados[usuario].paso =
                        'ambulancia'
await pausaHumana(sock, usuario)
                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hubo ambulancia?\n1. Sí\n2. No'
                        }
                    )

                    return
                }

// ======================
// AMBULANCIA
// ======================

if (
    estados[usuario]?.paso ===
    'ambulancia'
) {

    // SI HUBO AMBULANCIA
    if (mensaje === '1') {

        estados[usuario].paso =
            'datos_ambulancia'
await pausaHumana(sock, usuario)
        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese nombre del paramédico y Ambulancia que atendio al herido'
            }
        )

        return
    }

    // NO HUBO AMBULANCIA
    if (mensaje === '2') {

        usuarios[usuario] = {
    ...usuarios[usuario],
    ambulancia: 'No hubo ambulancia'
}

guardarUsuarios(usuarios)

estados[usuario].paso =
    'placas'
await pausaHumana(sock, usuario)
await sock.sendMessage(
    usuario,
    {
        text:
'Ingrese placas de los vehículos involucrados'
    }
)

return
    }
}

// ======================
// PLACAS VEHICULOS
// ======================

if (
    estados[usuario]?.paso ===
    'placas'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        placas: text
    }

    guardarUsuarios(usuarios)

    estados[usuario].paso =
        'conductores'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese nombres de los conductores involucrados'
        }
    )

    return
}

// ======================
// CONDUCTORES
// ======================

if (
    estados[usuario]?.paso ===
    'conductores'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        conductores: text
    }

    guardarUsuarios(usuarios)

    estados[usuario].paso =
        'danos'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese daños registrados'
        }
    )

    return
}

// ======================
// DAÑOS
// ======================

if (
    estados[usuario]?.paso ===
    'danos'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        danos: text
    }

    guardarUsuarios(usuarios)

    estados[usuario].paso =
        'cierre_vial'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'¿Hubo cierre vial?\n1. Sí\n2. No'
        }
    )

    return
}

// ======================
// CIERRE VIAL
// ======================

if (
    estados[usuario]?.paso ===
    'cierre_vial'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        cierreVial:
mensaje === '1'
? 'Sí hubo cierre vial'
: 'No hubo cierre vial'
    }

    guardarUsuarios(usuarios)

    estados[usuario].paso =
        'traslado'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'¿Hubo traslado hospitalario?\n1. Sí\n2. No'
        }
    )

    return
}

// ======================
// TRASLADO
// ======================

if (
    estados[usuario]?.paso ===
    'traslado'
) {

    if (mensaje === '1') {

        usuarios[usuario] = {
            ...usuarios[usuario],
            traslado:
                'Sí hubo traslado hospitalario'
        }

        guardarUsuarios(usuarios)

        estados[usuario].paso =
            'casa_salud'

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
'¿A qué casa de salud fue trasladada la persona herida?'
            }
        )

        return
    }

    if (mensaje === '2') {

        usuarios[usuario] = {
            ...usuarios[usuario],
            traslado:
                'No hubo traslado hospitalario'
        }

        guardarUsuarios(usuarios)

        const datos =
            usuarios[usuario]

const procedimiento =
`me permito informar que se registró un ${datos.tipoAccidente} en el sector asignado.

Como resultado del incidente se reportó ${datos.heridos.toLowerCase()} y ${datos.muertos.toLowerCase()}.

Durante la atención de la emergencia se contó con la siguiente colaboración institucional: ${datos.atm}; ${datos.ambulancia}; ${datos.criminalistica || 'sin intervención de Criminalística'}.

Los vehículos involucrados corresponden a las placas ${datos.placas}, siendo sus conductores ${datos.conductores}.

Entre los daños observados se registró: ${datos.danos}.

Así mismo, ${datos.cierreVial.toLowerCase()} y ${datos.traslado.toLowerCase()}.`

        await generarCartilla(
            sock,
            usuario,
            procedimiento
        )

        estados[usuario] = {
            paso: 'otra_cartilla'
        }

        await pausaHumana(sock, usuario)

        await sock.sendMessage(
            usuario,
            {
                text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
            }
        )

        return
    }
}

// ======================
// CASA DE SALUD
// ======================

if (
    estados[usuario]?.paso ===
    'casa_salud'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        casaSalud: text
    }

    guardarUsuarios(usuarios)

    const datos =
        usuarios[usuario]

const procedimiento =
`me permito informar que se registró un ${datos.tipoAccidente} en el sector asignado.

Como resultado del incidente se reportó ${datos.heridos.toLowerCase()} y ${datos.muertos.toLowerCase()}.

Durante la atención de la emergencia se contó con la siguiente colaboración institucional: ${datos.atm}; ${datos.ambulancia}; ${datos.criminalistica || 'sin intervención de Criminalística'}.

Los vehículos involucrados corresponden a las placas ${datos.placas}, siendo sus conductores ${datos.conductores}.

Entre los daños observados se registró: ${datos.danos}.

Así mismo, ${datos.cierreVial.toLowerCase()}.

Debido a las lesiones presentadas, se efectuó el traslado de la persona afectada hacia ${datos.casaSalud} para su respectiva valoración y atención médica.`


    await generarCartilla(
        sock,
        usuario,
        procedimiento
    )

    estados[usuario] = {
        paso: 'otra_cartilla'
    }

    await pausaHumana(sock, usuario)

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea ingresar otra cartilla?

1. SI
2. NO`
        }
    )

    return
}

// ======================
// DATOS AMBULANCIA
// ======================

if (
    estados[usuario]?.paso ===
    'datos_ambulancia'
) {

    usuarios[usuario] = {
        ...usuarios[usuario],
        ambulancia:
`Ambulancia presente: ${text}`
    }

    guardarUsuarios(usuarios)

    estados[usuario].paso =
        'placas'
await pausaHumana(sock, usuario)
    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese placas de los vehículos involucrados'
        }
    )

    return

} // FIN DATOS AMBULANCIA

            } catch (error) {

                console.log(
                    '❌ ERROR'
                )

                console.log(error)

            }

        }
    )

}

startBot()
