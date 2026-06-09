const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys')

const qrcode = require('qrcode-terminal')
const fs = require('fs')

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

function guardarDirecciones(data) {
function cargarFormacion() {

    try {

        return JSON.parse(
            fs.readFileSync(
                './database/formacion.json',
                'utf8'
            )
        )

    } catch {

        return {
            entrante: {},
            saliente: {}
        }

    }

}

function guardarFormacion(data) {

    fs.writeFileSync(
        './database/formacion.json',
        JSON.stringify(data, null, 2)
    )

}
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

// ======================
// FECHA
// ======================

function obtenerFecha() {

    const fecha = new Date()

    return fecha.toLocaleDateString('es-EC')

}

// ======================
// HORA +5 MIN
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
            horario: '06:00 A 14:30'
        }
    }

    if (
        hora >= 14 &&
        hora < 22
    ) {

        return {
            jornada: 'VESPERTINA',
            horario: '14:00 A 22:30'
        }
    }

    return {
        jornada: 'AMANECIDA',
        horario: '22:00 A 06:30'
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
${datos.policia !== 'No' ? `*POLICIA:* ${datos.policia}` : ''}

*"Lealtad, Valor y Orden"*

Adjunto fotografía`

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
*Hora:* ${obtenerHoraMas5()}
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
TOTAL: ${String(datos.operativos).padStart(2,'0')}

*REQUERIMIENTOS*
TOTAL: ${String(datos.requerimientos).padStart(2,'0')}

*LEVANTAMIENTOS DE INDIGENTES*
TOTAL: ${String(datos.indigentes).padStart(2,'0')}

*RESCATE ANIMAL*
TOTAL: ${String(datos.rescateAnimal).padStart(2,'0')}

*COLABORACIÓN CON OTRAS INSTITUCIONES*
TOTAL: ${String(datos.colaboracionInstituciones).padStart(2,'0')}

*RETENIDOS*
TOTAL: ${String(datos.retenidos).padStart(2,'0')}

*RETIROS TEMPORALES*
TOTAL: ${String(datos.retirosTemporales).padStart(2,'0')}

*RETIRO DE COVACHAS*
TOTAL: ${String(datos.retiroCovachas).padStart(2,'0')}

*ARMA BLANCA O FUEGO*
TOTAL: ${String(datos.armaBlancaFuego).padStart(2,'0')}

*COLABORACIÓN ATM*
TOTAL: ${String(datos.colaboracionAtm).padStart(2,'0')}

*ATENCIÓN PARAMÉDICA*
TOTAL: ${String(datos.atencionParamedica).padStart(2,'0')}`

    await sock.sendMessage(
        usuario,
        {
            text: consolidado
        }
    )

}

// ======================
// BOT
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
    mensaje === 'menu'
) {

    await sock.sendMessage(
        usuario,
        {
            text:
`🤖 SAC - SISTEMA AUTOMATIZADO DE CARTILLAS

Seleccione una opción:

a) Cartillas
b) Formación
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
        paso: 'menu_formacion'
    }

    await sock.sendMessage(
        usuario,
        {
            text:
`📡 FORMACIÓN

a) Formación Entrante
b) Formación Saliente
c) Datos Guardados
d) Volver`
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
            indigentes: 0,
            rescateAnimal: 0,
            colaboracionInstituciones: 0,
            retenidos: 0,
            retirosTemporales: 0,
            retiroCovachas: 0,
            armaBlancaFuego: 0,
            colaboracionAtm: 0,
            atencionParamedica: 0
        }
    }

    await sock.sendMessage(
        usuario,
        {
            text:
`📊 CONSOLIDADO

Seleccione una opción:

a) Operativos
b) Requerimientos
c) Levantamientos de indigentes
d) Rescate animal
e) Colaboración con otras instituciones
f) Retenidos
g) Retiros temporales
h) Retiro de covachas
i) Arma blanca o fuego
j) Colaboración ATM
k) Atención paramédica
l) Finalizar consolidado`
        }
    )

    return
}

// ======================
// RESTART
// ======================

if (
    mensaje === '/restart'
) {

    // BORRAR ESTADO TEMPORAL
    delete estados[usuario]

    // BORRAR DATOS GUARDADOS
    delete usuarios[usuario]

    guardarUsuarios(
        usuarios
    )

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

        await sock.sendMessage(
            usuario,
            {
                text:
'✅ Registro finalizado correctamente'
            }
        )

        return
    }

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

    const opciones = {
        a: 'operativos',
        b: 'requerimientos',
        c: 'indigentes',
        d: 'rescateAnimal',
        e: 'colaboracionInstituciones',
        f: 'retenidos',
        g: 'retirosTemporales',
        h: 'retiroCovachas',
        i: 'armaBlancaFuego',
        j: 'colaboracionAtm',
        k: 'atencionParamedica'
    }

    if (mensaje === 'l') {

        await generarConsolidado(
            sock,
            usuario
        )

        delete estados[usuario]

        return
    }

    if (!opciones[mensaje]) {

        await sock.sendMessage(
            usuario,
            {
                text:
`Opción inválida.

a) Operativos
b) Requerimientos
c) Levantamientos de indigentes
d) Rescate animal
e) Colaboración con otras instituciones
f) Retenidos
g) Retiros temporales
h) Retiro de covachas
i) Arma blanca o fuego
j) Colaboración ATM
k) Atención paramédica
l) Finalizar consolidado`
            }
        )

        return
    }

    estados[usuario].campoConsolidado =
        opciones[mensaje]

    estados[usuario].paso =
        'cantidad_consolidado'

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

    estados[usuario]
        .consolidado[campo] +=
        cantidad

    estados[usuario].paso =
        'menu_consolidado'

    await sock.sendMessage(
        usuario,
        {
            text:
`✅ Registro agregado.

Seleccione una opción:

a) Operativos
b) Requerimientos
c) Levantamientos de indigentes
d) Rescate animal
e) Colaboración con otras instituciones
f) Retenidos
g) Retiros temporales
h) Retiro de covachas
i) Arma blanca o fuego
j) Colaboración ATM
k) Atención paramédica
l) Finalizar consolidado`
        }
    )

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
            paso: 'cantidad_radioperadores',
            tipoFormacion: 'entrante'
        }

        await sock.sendMessage(
            usuario,
            {
                text:
'¿Cuántos radio operadores participan?'
            }
        )

        return
    }

if (mensaje === 'b') {

    const formaciones =
        cargarFormaciones()

    if (!formaciones[usuario]) {

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

a) Modificar datos
b) Volver`
        }
    )

    estados[usuario] = {
        paso: 'datos_guardados_formacion'
    }

    return
}

    if (mensaje === 'd') {

        delete estados[usuario]

        await sock.sendMessage(
            usuario,
            {
                text:
'Escriba MENU'
            }
        )

        return
    }

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

    if (mensaje === 'a') {

        estados[usuario].paso =
            'modificar_saliente'

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

    if (mensaje === 'b') {

        delete estados[usuario]

        await sock.sendMessage(
            usuario,
            {
                text:
'Escriba MENU para volver al menú principal'
            }
        )

        return
    }

    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Modificar datos
b) Volver`
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
            'mod_cantidad_radioperadores'

        await sock.sendMessage(
            usuario,
            {
                text:
'¿Cuántos radio operadores desea registrar?'
            }
        )

        return
    }

    if (mensaje === 'b') {

        estados[usuario].paso =
            'mod_operativos'

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

        estados[usuario].paso =
            'mod_presencia_policial'

        await sock.sendMessage(
            usuario,
            {
                text:
`¿Hubo presencia policial?

a) Sí
b) No`
            }
        )

        return
    }

    if (mensaje === 'd') {

        estados[usuario].paso =
            'mod_moviles_operativos'

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

    if (mensaje === 'e') {

        estados[usuario].paso =
            'novedades_formacion'

        await sock.sendMessage(
            usuario,
            {
                text:
`Novedades de formación:

a) Sin novedades
b) Ingresar novedades`
            }
        )

        return
    }

    if (mensaje === 'f') {

        delete estados[usuario]

        await sock.sendMessage(
            usuario,
            {
                text:
'Operación cancelada. Escriba MENU.'
            }
        )

        return
    }

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

    await sock.sendMessage(
        usuario,
        {
            text:
'✅ ACM Operativos actualizados correctamente'
        }
    )

    estados[usuario].paso =
        'menu_saliente'

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea generar la formación saliente?

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
        }
    )

    return
}

// ======================
// MODIFICAR CANTIDAD RADIOOPERADORES
// ======================

if (
    estados[usuario]?.paso ===
    'mod_cantidad_radioperadores'
) {

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 1
    ) {

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

    formaciones[usuario].radioOperadores = []

    guardarFormaciones(
        formaciones
    )

    estados[usuario].cantidadRadio =
        cantidad

    estados[usuario].paso =
        'mod_nombre_radioperador'

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese nombre del radio operador 1'
        }
    )

    return
}

// ======================
// MODIFICAR NOMBRE RADIOOPERADOR
// ======================

if (
    estados[usuario]?.paso ===
    'mod_nombre_radioperador'
) {

    if (!/[a-zA-ZÁÉÍÓÚáéíóúÑñ]/.test(text)) {

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese un nombre válido'
            }
        )

        return
    }

    const formaciones =
        cargarFormaciones()

    formaciones[usuario]
        .radioOperadores
        .push(text)

    guardarFormaciones(
        formaciones
    )

    if (
        formaciones[usuario]
            .radioOperadores
            .length <
        estados[usuario]
            .cantidadRadio
    ) {

        const siguiente =
            formaciones[usuario]
                .radioOperadores
                .length + 1

        await sock.sendMessage(
            usuario,
            {
                text:
`Ingrese nombre del radio operador ${siguiente}`
            }
        )

        return
    }

    await sock.sendMessage(
        usuario,
        {
            text:
'✅ Radioperadores actualizados correctamente'
        }
    )

    estados[usuario].paso =
        'menu_saliente'

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea generar la formación saliente?

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
        }
    )

    return
}

// ======================
// MODIFICAR PRESENCIA POLICIAL
// ======================

if (
    estados[usuario]?.paso ===
    'mod_presencia_policial'
) {

    if (
        mensaje === 'a' ||
        mensaje === 'si' ||
        mensaje === 'sí'
    ) {

        estados[usuario].paso =
            'mod_cantidad_policias'

        await sock.sendMessage(
            usuario,
            {
                text:
'¿Cuántos policías desea registrar? (1-3)'
            }
        )

        return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

        const formaciones =
            cargarFormaciones()

        formaciones[usuario].policias = []

        guardarFormaciones(
            formaciones
        )

        await sock.sendMessage(
            usuario,
            {
                text:
'✅ Personal policial actualizado: No registrado'
            }
        )

        estados[usuario].paso =
            'menu_saliente'

        await sock.sendMessage(
            usuario,
            {
                text:
`¿Desea generar la formación saliente?

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
            }
        )

        return
    }

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
// MODIFICAR CANTIDAD POLICIAS
// ======================

if (
    estados[usuario]?.paso ===
    'mod_cantidad_policias'
) {

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 1 ||
        cantidad > 3
    ) {

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese un número entre 1 y 3'
            }
        )

        return
    }

    const formaciones =
        cargarFormaciones()

    formaciones[usuario].policias = []

    guardarFormaciones(
        formaciones
    )

    estados[usuario].cantidadPolicias =
        cantidad

    estados[usuario].paso =
        'mod_nombre_policia'

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese nombre del policía 1'
        }
    )

    return
}

// ======================
// MODIFICAR NOMBRE POLICIA
// ======================

if (
    estados[usuario]?.paso ===
    'mod_nombre_policia'
) {

    if (!/[a-zA-ZÁÉÍÓÚáéíóúÑñ]/.test(text)) {

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese un nombre válido'
            }
        )

        return
    }

    const formaciones =
        cargarFormaciones()

    formaciones[usuario]
        .policias
        .push(text)

    guardarFormaciones(
        formaciones
    )

    if (
        formaciones[usuario]
            .policias
            .length <
        estados[usuario]
            .cantidadPolicias
    ) {

        const siguiente =
            formaciones[usuario]
                .policias
                .length + 1

        await sock.sendMessage(
            usuario,
            {
                text:
`Ingrese nombre del policía ${siguiente}`
            }
        )

        return
    }

    await sock.sendMessage(
        usuario,
        {
            text:
'✅ Personal policial actualizado correctamente'
        }
    )

    estados[usuario].paso =
        'menu_saliente'

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea generar la formación saliente?

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
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

        await sock.sendMessage(
            usuario,
            {
                text:
'✅ Móviles actualizados: 187-188-189'
            }
        )

        estados[usuario].paso =
            'menu_saliente'

        await sock.sendMessage(
            usuario,
            {
                text:
`¿Desea generar la formación saliente?

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
            }
        )

        return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

        estados[usuario].paso =
            'mod_movil_con_novedad'

        await sock.sendMessage(
            usuario,
            {
                text:
'Indique qué móvil tuvo novedad: 187, 188 o 189'
            }
        )

        return
    }

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

    await sock.sendMessage(
        usuario,
        {
            text:
'✅ Móviles actualizados correctamente'
        }
    )

    estados[usuario].paso =
        'menu_saliente'

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Desea generar la formación saliente?

a) Utilizar los mismos datos
b) Modificar datos
c) Cancelar`
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

        estados[usuario].tipoFormacion =
            'saliente'

        estados[usuario].paso =
            'novedades_formacion'

        await sock.sendMessage(
            usuario,
            {
                text:
`Novedades de formación:

a) Sin novedades
b) Ingresar novedades`
            }
        )

        return
    }

    if (mensaje === 'b') {

        estados[usuario].tipoFormacion =
            'saliente'

        estados[usuario].paso =
            'modificar_saliente'

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

        await sock.sendMessage(
            usuario,
            {
                text:
'Operación cancelada. Escriba MENU para volver.'
            }
        )

        return
    }

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
// CANTIDAD RADIOOPERADORES
// ======================

if (
    estados[usuario]?.paso ===
    'cantidad_radioperadores'
) {

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 1
    ) {

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese una cantidad válida'
            }
        )

        return
    }

    estados[usuario].cantidadRadio =
        cantidad

    estados[usuario].radioActual = 1

    estados[usuario].radioOperadores = []

    estados[usuario].paso =
        'nombre_radioperador'

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese nombre del radio operador 1'
        }
    )

    return
}

// ======================
// NOMBRE RADIOOPERADOR
// ======================

if (
    estados[usuario]?.paso ===
    'nombre_radioperador'
) {

    if (!/[a-zA-ZÁÉÍÓÚáéíóúÑñ]/.test(text)) {

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese el nombre del radio operador, no número'
            }
        )

        return
    }

    const formaciones =
        cargarFormaciones()

    if (!formaciones[usuario]) {

        formaciones[usuario] = {
            tipo: estados[usuario].tipoFormacion || 'entrante',
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

    }

    formaciones[usuario]
        .radioOperadores
        .push(text)

    guardarFormaciones(
        formaciones
    )

    if (
        formaciones[usuario]
            .radioOperadores
            .length <
        estados[usuario]
            .cantidadRadio
    ) {

        const siguiente =
            formaciones[usuario]
                .radioOperadores
                .length + 1

        await sock.sendMessage(
            usuario,
            {
                text:
`Ingrese nombre del radio operador ${siguiente}`
            }
        )

        return
    }

    estados[usuario].paso =
        'cantidad_operativos'

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

    estados[usuario].paso =
        'presencia_policial'

    await sock.sendMessage(
        usuario,
        {
            text:
`¿Hubo presencia policial?

a) Sí
b) No`
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

    if (
        mensaje === 'a' ||
        mensaje === 'si' ||
        mensaje === 'sí'
    ) {

        estados[usuario].paso =
            'cantidad_policias'

        await sock.sendMessage(
            usuario,
            {
                text:
'¿Cuántos policías participaron? (1-3)'
            }
        )

        return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

        const formaciones =
            cargarFormaciones()

        if (!formaciones[usuario]) {
            formaciones[usuario] = {}
        }

        formaciones[usuario].policias = []

        guardarFormaciones(
            formaciones
        )

        estados[usuario].paso =
            'moviles_operativos'

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

    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

Responda:
a) Sí
b) No`
        }
    )

    return
}

// ======================
// CANTIDAD POLICIAS
// ======================

if (
    estados[usuario]?.paso ===
    'cantidad_policias'
) {

    const cantidad =
        Number(text)

    if (
        isNaN(cantidad) ||
        cantidad < 1 ||
        cantidad > 3
    ) {

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese un número entre 1 y 3'
            }
        )

        return
    }

    estados[usuario].cantidadPolicias =
        cantidad

    estados[usuario].policiaActual =
        1

    estados[usuario].policias = []

    estados[usuario].paso =
        'nombre_policia_formacion'

    await sock.sendMessage(
        usuario,
        {
            text:
'Ingrese nombre del policía 1'
        }
    )

    return
}

// ======================
// NOMBRE POLICIA FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'nombre_policia_formacion'
) {

const formaciones =
    cargarFormaciones()

formaciones[usuario]
    .policias
    .push(text)

guardarFormaciones(
    formaciones
)

    const siguiente =
        estados[usuario]
            .policiaActual + 1

    if (
        siguiente <=
        estados[usuario]
            .cantidadPolicias
    ) {

        estados[usuario]
            .policiaActual =
            siguiente

        await sock.sendMessage(
            usuario,
            {
                text:
`Ingrese nombre del policía ${siguiente}`
            }
        )

        return
    }

    estados[usuario].paso =
        'moviles_operativos'

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

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese novedades de la formación. Si no hay novedades escriba: "A", si hay novedades escriba "B"'
            }
        )

        return
    }

    if (
        mensaje === 'b' ||
        mensaje === 'no'
    ) {

        estados[usuario].paso =
            'movil_con_novedad'

        await sock.sendMessage(
            usuario,
            {
                text:
'Indique qué móvil tuvo novedad: 187, 188 o 189'
            }
        )

        return
    }

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
// MOVIL CON NOVEDAD
// ======================

if (
    estados[usuario]?.paso ===
    'movil_con_novedad'
) {

    if (
        mensaje !== '187' &&
        mensaje !== '188' &&
        mensaje !== '189'
    ) {

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
        'detalle_novedad_movil'

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
// DETALLE NOVEDAD MOVIL
// ======================

if (
    estados[usuario]?.paso ===
    'detalle_novedad_movil'
) {

    const formaciones =
        cargarFormaciones()

    const movil =
        estados[usuario].movilNovedad

    formaciones[usuario].moviles =
        formaciones[usuario].moviles.filter(
            m => m !== movil
        )

    formaciones[usuario].novedadMoviles =
        `Móvil ${movil}: ${text}`

    guardarFormaciones(
        formaciones
    )

    estados[usuario].paso =
        'novedades_formacion'

await sock.sendMessage(
    usuario,
    {
        text:
`Novedades de formación:

a) Sin novedades
b) Ingresar novedades`
    }
)

    return
}

// ======================
// NOVEDADES FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'novedades_formacion'
) {

    const formaciones =
        cargarFormaciones()

    if (mensaje === 'a') {

        formaciones[usuario].novedades =
            'Sin novedades'

        guardarFormaciones(
            formaciones
        )

        await generarFormacion(
    sock,
    usuario,
    estados[usuario].tipoFormacion
)

estados[usuario] = {
    paso: 'otra_formacion'
}

return
    }

    if (mensaje === 'b') {

        estados[usuario].paso =
            'detalle_novedades_formacion'

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese las novedades de la formación'
            }
        )

        return
    }

    await sock.sendMessage(
        usuario,
        {
            text:
`Opción inválida.

a) Sin novedades
b) Ingresar novedades`
        }
    )

    return
}

// ======================
// DETALLE NOVEDADES FORMACION
// ======================

if (
    estados[usuario]?.paso ===
    'detalle_novedades_formacion'
) {

    const formaciones =
        cargarFormaciones()

    formaciones[usuario].novedades =
        text

    guardarFormaciones(
        formaciones
    )

await generarFormacion(
    sock,
    usuario,
    estados[usuario].tipoFormacion
)

estados[usuario] = {
    paso: 'otra_formacion'
}

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

        estados[usuario] = {
            paso: 'nuevo_policia'
        }

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese rango y nombre policial'
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

    usuarios[usuario] = {
        ...usuarios[usuario],
        policia: text
    }

    guardarUsuarios(
        usuarios
    )

estados[usuario] = {
    paso: 'continuar_edicion'
}

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

        await sock.sendMessage(
            usuario,
            {
                text:
`Seleccione dirección guardada o escriba una nueva:\n\n${lista}`
            }
        )

        return

    }

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

                    estados[usuario]
                        .paso = 'policia'

                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'¿Hay policía en el móvil?\n1. Si\n2. No'
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

                    if (mensaje === '1') {

                        estados[usuario]
                            .paso =
                            'nombre_policia'

                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'Ingrese rango y nombre del servidor policial'
                            }
                        )

                        return

                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        policia: 'No'
                    }

                    guardarUsuarios(
                        usuarios
                    )

                    estados[usuario]
                        .paso =
                        'jornada'

                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'Seleccione jornada:\n1. Matutina\n2. Vespertina\n3. Amanecida'
                        }
                    )

                    return

                }

                // ======================
                // NOMBRE POLICIA
                // ======================

                if (
                    estados[usuario]
                        ?.paso ===
                    'nombre_policia'
                ) {

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        policia: text
                    }

                    guardarUsuarios(
                        usuarios
                    )

                    estados[usuario]
                        .paso =
                        'jornada'

                    await sock.sendMessage(
                        usuario,
                        {
                            text:
'Seleccione jornada:\n1. Matutina\n2. Vespertina\n3. Amanecida'
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

                    let jornada = ''
                    let horario = ''

                    if (mensaje === '1') {

                        jornada =
                            'MATUTINA'

                        horario =
                            '06:00 A 14:30'

                    }

                    else if (
                        mensaje === '2'
                    ) {

                        jornada =
                            'VESPERTINA'

                        horario =
                            '14:00 A 22:30'

                    }

                    else if (
                        mensaje === '3'
                    ) {

                        jornada =
                            'AMANECIDA'

                        horario =
                            '22:00 A 06:30'

                    }

                    else {

                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'❌ Jornada inválida'
                            }
                        )

                        return

                    }

                    usuarios[usuario] = {
                        ...usuarios[usuario],
                        jornada,
                        horario
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

                    await sock.sendMessage(
                        usuario,
                        {
                            text:
`Seleccione causa:

a) Desalojo de vendedores autónomos no regularizados
b) Retiro temporal
c) Requerimiento
d) Rondas disuasivas
e) Punto martillo
f) Colaboración con otras entidades
g) Colaboración ciudadana
h) Presencia de agente de control
i) Accidente
j) Permiso de ausentismo
k) Persecución
l) Requerimiento LINEA 181`
                        }
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
'Presencia de agente de control',

    i:
'Accidente',

    j:
'Permiso de ausentismo',

    k:
'Persecución',

    l:
'Requerimiento LINEA 181'

}

                    const causa =
                        causas[mensaje]

                    if (!causa) {

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

                    // DESALOJO

                    if (
                        mensaje === 'a'
                    ) {

                        estados[usuario]
                            .paso =
                            'agresivos'

                        await sock.sendMessage(
                            usuario,
                            {
                                text:
'¿Los comerciantes se pusieron agresivos?\n1. Si\n2. No'
                            }
                        )

                        return

                    }

                    // ======================
// ACCIDENTE
// ======================

if (mensaje === 'i') {

    estados[usuario].paso =
        'tipo_accidente'

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
    mensaje === 'e' ||
    mensaje === 'g' ||
    mensaje === 'h'
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

        await sock.sendMessage(
            usuario,
            {
                text:
'Ingrese nombre de la ambulancia o unidad de emergencia'
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

    usuarios[usuario] = {
        ...usuarios[usuario],
        traslado:
            mensaje === '1'
                ? 'Sí hubo traslado hospitalario'
                : 'No hubo traslado hospitalario'
    }

    guardarUsuarios(usuarios)

    const datos =
        usuarios[usuario]

    const procedimiento =
`se registró ${datos.tipoAccidente}; ${datos.heridos}; ${datos.muertos || ''}; ${datos.criminalistica || ''}; ${datos.atm}; ${datos.ambulancia}; vehículos involucrados: ${datos.placas}; conductores: ${datos.conductores}; daños registrados: ${datos.danos}; ${datos.cierreVial}; ${datos.traslado}.`

    await generarCartilla(
        sock,
        usuario,
        procedimiento
    )

    estados[usuario] = {
        paso: 'otra_cartilla'
    }

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