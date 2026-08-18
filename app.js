// ==========================================
// CONFIGURACIÓN
// ==========================================

const SUPABASE_FUNCTION_URL =
    "https://hadpepaelkxtmrmtamlr.supabase.co/functions/v1/buscar-cliente";


// ==========================================
// ELEMENTOS
// ==========================================

const buscarDV =
    document.getElementById("buscarDV");

const resultados =
    document.getElementById("resultados");

const clienteHTML =
    document.getElementById("cliente");


// ==========================================
// TEMPORIZADOR
// ==========================================

let temporizador = null;


// ==========================================
// BUSCAR MIENTRAS ESCRIBES
// ==========================================

buscarDV.addEventListener(
    "input",
    function () {

        clearTimeout(temporizador);

        const texto =
            buscarDV.value.trim();


        // Limpiar resultados anteriores

        resultados.innerHTML = "";

        clienteHTML.innerHTML = "";

        clienteHTML.classList.add(
            "oculto"
        );


        // Si no hay texto,
        // no hacemos ninguna búsqueda

        if (!texto) {
            return;
        }


        // Esperar 250 ms antes
        // de consultar Supabase

        temporizador =
            setTimeout(
                function () {

                    buscarClientes(
                        texto
                    );

                },
                250
            );

    }
);


// ==========================================
// BUSCAR CLIENTES
// ==========================================

async function buscarClientes(
    texto
) {

    try {

        resultados.innerHTML = `

            <div class="cargando-cliente">

                Buscando...

            </div>

        `;


        const respuesta =
            await fetch(
                SUPABASE_FUNCTION_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            accion:
                                "buscar",

                            noDV:
                                texto

                        })

                }
            );


        const datos =
            await respuesta.json();


        // ======================================
        // ERROR DEL SERVIDOR
        // ======================================

        if (!datos.ok) {

            resultados.innerHTML = `

                <div class="sin-resultados">

                    ${escapeHTML(
                        datos.mensaje ||
                        "Ocurrió un error."
                    )}

                </div>

            `;

            return;
        }


        // ======================================
        // SIN RESULTADOS
        // ======================================

        if (
            !datos.resultados ||
            datos.resultados.length === 0
        ) {

            resultados.innerHTML = `

                <div class="sin-resultados">

                    No encontramos ningún
                    cliente.

                </div>

            `;

            return;
        }


        // ======================================
        // MOSTRAR RESULTADOS
        // ======================================

        resultados.innerHTML = "";


        // Número de coincidencias

        const contador =
            document.createElement(
                "div"
            );

        contador.className =
            "contador-resultados";

        contador.textContent =
            datos.resultados.length +
            (
                datos.resultados.length === 1
                    ? " coincidencia"
                    : " coincidencias"
            );


        resultados.appendChild(
            contador
        );


        // Crear cada resultado

        datos.resultados.forEach(
            cliente => {

                crearResultado(
                    cliente
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Error buscando cliente:",
            error
        );


        resultados.innerHTML = `

            <div class="sin-resultados">

                ❌ No se pudo conectar
                con el servidor.

            </div>

        `;

    }

}


// ==========================================
// CREAR RESULTADO
// ==========================================

function crearResultado(
    cliente
) {

    // ======================================
    // CONTENEDOR
    // ======================================

    const contenedor =
        document.createElement(
            "div"
        );

    contenedor.className =
        "resultado-contenedor";


    // ======================================
    // BOTÓN
    // ======================================

    const boton =
        document.createElement(
            "button"
        );

    boton.className =
        "resultado";


    const dv =
        cliente.noDV ?? "";


    const nombre =
        cliente.nombre ?? "";


    boton.innerHTML = `

        <span class="resultado-dv">

            ${escapeHTML(
                String(dv)
            )}

        </span>


        <span class="resultado-nombre">

            ${escapeHTML(
                String(nombre)
            )}

        </span>


        <span class="resultado-flecha">

            ▶

        </span>

    `;


    // ======================================
    // DETALLE OCULTO
    // ======================================

    const detalle =
        document.createElement(
            "div"
        );

    detalle.className =
        "resultado-detalle oculto";


    // ======================================
    // CLICK EN CLIENTE
    // ======================================

    boton.addEventListener(
        "click",
        async function () {


            // ==================================
            // SI YA ESTÁ ABIERTO → CERRAR
            // ==================================

            if (
                !detalle.classList.contains(
                    "oculto"
                )
            ) {

                detalle.classList.add(
                    "oculto"
                );

                boton.classList.remove(
                    "seleccionado"
                );


                const flecha =
                    boton.querySelector(
                        ".resultado-flecha"
                    );


                if (flecha) {

                    flecha.textContent =
                        "▶";

                }


                return;

            }


            // ==================================
            // CERRAR TODOS LOS DEMÁS
            // ==================================

            document
                .querySelectorAll(
                    ".resultado-detalle"
                )
                .forEach(
                    elemento => {

                        elemento.classList.add(
                            "oculto"
                        );

                    }
                );


            document
                .querySelectorAll(
                    ".resultado"
                )
                .forEach(
                    elemento => {

                        elemento.classList.remove(
                            "seleccionado"
                        );


                        const flecha =
                            elemento.querySelector(
                                ".resultado-flecha"
                            );


                        if (flecha) {

                            flecha.textContent =
                                "▶";

                        }

                    }
                );


            // ==================================
            // MOSTRAR CARGANDO
            // ==================================

            detalle.innerHTML = `

                <div class="cargando-cliente">

                    Cargando información...

                </div>

            `;


            detalle.classList.remove(
                "oculto"
            );


            boton.classList.add(
                "seleccionado"
            );


            const flecha =
                boton.querySelector(
                    ".resultado-flecha"
                );


            if (flecha) {

                flecha.textContent =
                    "▼";

            }


            // ==================================
            // CONSULTAR CLIENTE
            // ==================================

            try {

                const respuesta =
                    await fetch(
                        SUPABASE_FUNCTION_URL,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    accion:
                                        "cliente",

                                    noDV:
                                        String(dv)

                                })

                        }
                    );


                const datos =
                    await respuesta.json();


                // ==================================
                // CLIENTE NO ENCONTRADO
                // ==================================

                if (
                    !datos.ok ||
                    !datos.encontrado ||
                    !datos.cliente
                ) {

                    detalle.innerHTML = `

                        <div class="sin-resultados">

                            No se encontró
                            la información
                            del cliente.

                        </div>

                    `;

                    return;

                }


                // ==================================
                // MOSTRAR CLIENTE
                // ==================================

                detalle.innerHTML =
                    crearDetalleCliente(
                        datos.cliente
                    );


            }
            catch (error) {

                console.error(
                    "Error cargando cliente:",
                    error
                );


                detalle.innerHTML = `

                    <div class="sin-resultados">

                        ❌ No se pudo cargar
                        la información.

                    </div>

                `;

            }

        }
    );


    // ======================================
    // AGREGAR AL DOM
    // ======================================

    contenedor.appendChild(
        boton
    );

    contenedor.appendChild(
        detalle
    );

    resultados.appendChild(
        contenedor
    );

}


// ==========================================
// CREAR DETALLE DEL CLIENTE
// ==========================================

function crearDetalleCliente(
    cliente
) {

    const dv =
        cliente.noDV ?? "";


    const nombre =
        cliente.nombre ?? "";


    const plaza =
        cliente.plaza ?? "";


    const region =
        cliente.region ?? "";


    let pagosHTML =
        "";


    // ======================================
    // DÍAS DE PAGO
    // ======================================

    if (
        cliente.pagos &&
        cliente.pagos.length > 0
    ) {

        cliente.pagos.forEach(
            pago => {

                const valor =
                    pago.valor;


                let cantidad;


                // ==============================
                // SIN DATO
                // ==============================

                if (
                    valor === "" ||
                    valor === null ||
                    valor === undefined
                ) {

                    cantidad = `

                        <span class="sin-dato">

                            Sin dato

                        </span>

                    `;

                }

                // ==============================
                // CON DATO
                // ==============================

                else {

                    const numero =
                        Number(
                            valor
                        );


                    if (
                        Number.isNaN(
                            numero
                        )
                    ) {

                        cantidad =
                            escapeHTML(
                                String(
                                    valor
                                )
                            );

                    }

                    else {

                        cantidad =
                            "$" +
                            numero.toLocaleString(
                                "es-MX",
                                {
                                    maximumFractionDigits:
                                        2
                                }
                            );

                    }

                }


                pagosHTML += `

                    <div class="pago">

                        <span class="pago-fecha">

                            ${escapeHTML(
                                String(
                                    pago.fecha
                                )
                            )}

                        </span>


                        <span class="pago-cantidad">

                            ${cantidad}

                        </span>

                    </div>

                `;

            }
        );

    }

    else {

        pagosHTML = `

            <div class="sin-resultados">

                No hay días de pago registrados.

            </div>

        `;

    }


    // ======================================
    // HTML DEL CLIENTE
    // ======================================

    return `

        <div class="detalle-encabezado">

            <h3>

                ${escapeHTML(
                    String(nombre)
                )}

            </h3>


            <div class="detalle-dv">

                No. DV:

                <strong>

                    ${escapeHTML(
                        String(dv)
                    )}

                </strong>

            </div>

        </div>


        <div class="datos">

            <div class="dato">

                <span class="dato-titulo">

                    Nombre

                </span>


                <span class="dato-valor">

                    ${escapeHTML(
                        String(nombre)
                    )}

                </span>

            </div>


            <div class="dato">

                <span class="dato-titulo">

                    Plaza

                </span>


                <span class="dato-valor">

                    ${escapeHTML(
                        String(plaza)
                    )}

                </span>

            </div>


            <div class="dato">

                <span class="dato-titulo">

                    Región

                </span>


                <span class="dato-valor">

                    ${escapeHTML(
                        String(region)
                    )}

                </span>

            </div>

        </div>


        <div class="pagos">

            <h3>

                DÍAS DE PAGO

            </h3>


            ${pagosHTML}

        </div>

    `;

}


// ==========================================
// SEGURIDAD HTML
// ==========================================

function escapeHTML(
    valor
) {

    return String(
        valor
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}