// ==========================================
// VARIABLES
// ==========================================

let clientes = [];


// ==========================================
// ELEMENTOS
// ==========================================

const archivoExcel =
    document.getElementById(
        "archivoExcel"
    );

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
// CARGAR EXCEL
// ==========================================

archivoExcel.addEventListener(
    "change",
    cargarExcel
);


function cargarExcel(event) {

    const archivo =
        event.target.files[0];


    if (!archivo) {

        return;

    }


    estado.textContent =
        "Leyendo Excel...";


    estado.className =
        "estado";


    const lector =
        new FileReader();


    lector.onload =
        function (evento) {

            try {

                const datos =
                    new Uint8Array(
                        evento.target.result
                    );


                const libro =
                    XLSX.read(
                        datos,
                        {
                            type: "array"
                        }
                    );


                // Primera hoja

                const nombreHoja =
                    libro.SheetNames[0];


                const hoja =
                    libro.Sheets[
                        nombreHoja
                    ];


                // Convertir hoja a objetos

                clientes =
                    XLSX.utils.sheet_to_json(
                        hoja,
                        {
                            defval: ""
                        }
                    );


                console.log(
                    "Excel cargado:"
                );


                console.log(
                    clientes
                );


                // ==================================
                // RESULTADO
                // ==================================

                estado.textContent =
                    "✓ Excel cargado correctamente: "
                    +
                    clientes.length
                    +
                    " clientes";


                estado.classList.add(
                    "correcto"
                );


                // Activar buscador

                buscarDV.disabled =
                    false;


                buscarDV.placeholder =
                    "Escribe el No. DV...";


                buscarDV.focus();


            }
            catch (error) {

                console.error(
                    error
                );


                estado.textContent =
                    "❌ No se pudo leer el Excel";


                estado.classList.add(
                    "error"
                );

            }

        };


    lector.onerror =
        function () {

            estado.textContent =
                "❌ Error al abrir el archivo.";

        };


    lector.readAsArrayBuffer(
        archivo
    );

}


// ==========================================
// BUSCAR MIENTRAS ESCRIBES
// ==========================================

buscarDV.addEventListener(
    "input",
    buscarClientes
);


function buscarClientes() {

    const texto =
        buscarDV.value
            .trim()
            .toLowerCase();


    resultados.innerHTML =
        "";


    clienteHTML.innerHTML =
        "";


    clienteHTML.classList.add(
        "oculto"
    );


    if (!texto) {

        return;

    }


    const encontrados =
        clientes.filter(
            cliente => {

                const dv =
                    String(
                        cliente["No. DV"] ?? ""
                    )
                    .toLowerCase();


                return dv.includes(
                    texto
                );

            }
        );


    if (
        encontrados.length === 0
    ) {

        resultados.innerHTML = `

            <div class="sin-resultados">

                No encontramos ningún
                cliente.

            </div>

        `;

        return;

    }


    encontrados
        .slice(0, 30)
        .forEach(
            cliente => {

                crearResultado(
                    cliente
                );

            }
        );

}


// ==========================================
// RESULTADO
// ==========================================

function crearResultado(
    cliente
) {

    const boton =
        document.createElement(
            "button"
        );


    boton.className =
        "resultado";


    const dv =
        cliente["No. DV"] ?? "";


    const nombre =
        cliente["NOMBRE"] ?? "";


    boton.innerHTML = `

        <span class="resultado-dv">

            ${dv}

        </span>

        <span class="resultado-nombre">

            ${nombre}

        </span>

    `;


    boton.addEventListener(
        "click",
        function () {

            mostrarCliente(
                cliente
            );

        }
    );


    resultados.appendChild(
        boton
    );

}


// ==========================================
// MOSTRAR CLIENTE
// ==========================================

function mostrarCliente(
    cliente
) {

    const dv =
        cliente["No. DV"] ?? "";


    const nombre =
        cliente["NOMBRE"] ?? "";


    const plaza =
        cliente["PLAZA"] ?? "";


    const region =
        cliente["REGION"] ?? "";


    let pagosHTML =
        "";


    // ======================================
    // OBTENER PAGOS
    // ======================================

    Object.keys(cliente)
        .forEach(
            columna => {


                if (
                    columna === "No. DV" ||
                    columna === "NOMBRE" ||
                    columna === "PLAZA" ||
                    columna === "REGION"
                ) {

                    return;

                }


                const valor =
                    cliente[columna];


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
                        Number.isNaN(numero)
                    ) {

                        cantidad =
                            valor;

                    }
                    else {

                        cantidad =
                            "$" +
                            numero.toLocaleString(
                                "es-MX",
                                {
                                    maximumFractionDigits: 2
                                }
                            );

                    }

                }


                pagosHTML += `

                    <div class="pago">

                        <span class="pago-fecha">

                            ${columna}

                        </span>

                        <span class="pago-cantidad">

                            ${cantidad}

                        </span>

                    </div>

                `;

            }
        );


    // ======================================
    // MOSTRAR
    // ======================================

    clienteHTML.innerHTML = `

        <div class="tarjeta">

            <div class="tarjeta-header">

                <h2>
                    ${nombre}
                </h2>

                <div class="dv">

                    No. DV:
                    <strong>
                        ${dv}
                    </strong>

                </div>

            </div>


            <div class="datos">

                <div class="dato">

                    <span class="dato-titulo">
                        Nombre
                    </span>

                    <span class="dato-valor">
                        ${nombre}
                    </span>

                </div>


                <div class="dato">

                    <span class="dato-titulo">
                        Plaza
                    </span>

                    <span class="dato-valor">
                        ${plaza}
                    </span>

                </div>


                <div class="dato">

                    <span class="dato-titulo">
                        Región
                    </span>

                    <span class="dato-valor">
                        ${region}
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
        behavior: "smooth"
    });

}