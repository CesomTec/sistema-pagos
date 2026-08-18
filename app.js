// ==========================================
// CONFIGURACIÓN
// ==========================================

const SUPABASE_FUNCTION_URL =
    "https://hadpepaelkxtmrmtamlr.supabase.co/functions/v1/buscar-cliente";


// ==========================================
// ELEMENTOS
// ==========================================

const buscarDV =
    document.getElementById(
        "buscarDV"
    );

const resultados =
    document.getElementById(
        "resultados"
    );

const clienteHTML =
    document.getElementById(
        "cliente"
    );

const estado =
    document.getElementById(
        "estado"
    );


// ==========================================
// TEMPORIZADOR DE BÚSQUEDA
// ==========================================

let temporizador;


// ==========================================
// BUSCAR MIENTRAS ESCRIBES
// ==========================================

buscarDV.addEventListener(
    "input",
    function () {

        clearTimeout(
            temporizador
        );

        const texto =
            buscarDV.value
                .trim();


        resultados.innerHTML =
            "";

        clienteHTML.innerHTML =
            "";

        clienteHTML.classList.add(
            "oculto"
        );


        if (!texto) {

            estado.textContent =
                "";

            return;

        }


        // Esperar un poquito
        // antes de consultar

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

        estado.textContent =
            "Buscando...";

        estado.className =
            "estado";


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
                                "buscar",

                            noDV:
                                texto

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (
            !datos.ok
        ) {

            estado.textContent =
                datos.mensaje ||
                "Error en la búsqueda.";

            estado.classList.add(
                "error"
            );

            return;

        }


        estado.textContent =
            datos.encontrados +
            " coincidencia(s)";


        if (
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
            error
        );


        estado.textContent =
            "❌ No se pudo conectar con el servidor.";

        estado.className =
            "estado error";

    }

}


// ==========================================
// CREAR RESULTADO
// ==========================================

async function crearResultado(
    cliente
) {

    // ==========================================
    // CONTENEDOR DEL RESULTADO
    // ==========================================

    const contenedor =
        document.createElement(
            "div"
        );

    contenedor.className =
        "resultado-contenedor";


    // ==========================================
    // BOTÓN
    // ==========================================

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


    // ==========================================
    // CONTENIDO OCULTO
    // ==========================================

    const detalle =
        document.createElement(
            "div"
        );

    detalle.className =
        "resultado-detalle oculto";


    // ==========================================
    // CLICK
    // ==========================================

    boton.addEventListener(
        "click",
        async function () {

            // Si ya está abierto,
            // simplemente cerrarlo

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

                boton.querySelector(
                    ".resultado-flecha"
                ).textContent =
                    "▶";

                return;

            }


            // ==================================
            // CERRAR LOS DEMÁS
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
            // CARGAR INFORMACIÓN
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

            boton.querySelector(
                ".resultado-flecha"
            ).textContent =
                "▼";


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
                                        dv

                                })

                        }
                    );


                const datos =
                    await respuesta.json();


                if (
                    !datos.ok ||
                    !datos.encontrado
                ) {

                    detalle.innerHTML = `

                        <div class="sin-resultados">

                            No se encontró la información.

                        </div>

                    `;

                    return;

                }


                detalle.innerHTML =
                    crearDetalleCliente(
                        datos.cliente
                    );


            }
            catch (error) {

                console.error(
                    error
                );


                detalle.innerHTML = `

                    <div class="sin-resultados">

                        ❌ No se pudo cargar la información.

                    </div>

                `;

            }

        }
    );


    // ==========================================
    // AGREGAR
    // ==========================================

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


    cliente.pagos.forEach(
        pago => {

            const valor =
                pago.valor;


            let cantidad;


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
            else {

                const numero =
                    Number(valor);


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
// CARGAR CLIENTE COMPLETO
// ==========================================

async function cargarCliente(
    noDV
) {

    try {

        estado.textContent =
            "Cargando información...";


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
                                noDV

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (
            !datos.ok ||
            !datos.encontrado
        ) {

            estado.textContent =
                "No se encontró el cliente.";

            return;

        }


        estado.textContent =
            "✓ Cliente encontrado";


        mostrarCliente(
            datos.cliente
        );


    }
    catch (error) {

        console.error(
            error
        );


        estado.textContent =
            "❌ Error al consultar el cliente.";

        estado.className =
            "estado error";

    }

}


// ==========================================
// MOSTRAR CLIENTE
// ==========================================

function mostrarCliente(
    cliente
) {

    const dv =
        cliente.noDV ??
        "";


    const nombre =
        cliente.nombre ??
        "";


    const plaza =
        cliente.plaza ??
        "";


    const region =
        cliente.region ??
        "";


    let pagosHTML =
        "";


    // ======================================
    // PAGOS DINÁMICOS
    // ======================================

    cliente.pagos.forEach(
        pago => {

            const valor =
                pago.valor;


            let cantidad;


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
            else {

                const numero =
                    Number(valor);


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


    // ======================================
    // HTML
    // ======================================

    clienteHTML.innerHTML = `

        <div class="tarjeta">

            <div class="tarjeta-header">

                <h2>
                    ${escapeHTML(
                        String(nombre)
                    )}
                </h2>

                <div class="dv">

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

        </div>

    `;


    clienteHTML.classList.remove(
        "oculto"
    );


    clienteHTML.scrollIntoView({

        behavior:
            "smooth"

    });

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