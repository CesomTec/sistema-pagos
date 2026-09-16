// ==========================================
// CONFIGURACIÓN
// ==========================================

// Esta será la función de Supabase que vamos
// a crear después.

const SUPABASE_FUNCTION_URL =
    "https://hadpepaelkxtmrmtamlr.supabase.co/functions/v1/actualizar-excel";


// ==========================================
// ELEMENTOS
// ==========================================

const archivoExcel =
    document.getElementById("archivoExcel");

const archivoSeleccionado =
    document.getElementById("archivoSeleccionado");

const btnActualizar =
    document.getElementById("btnActualizar");

const estado =
    document.getElementById("estado");


// ==========================================
// CUANDO SE SELECCIONA UN ARCHIVO
// ==========================================

archivoExcel.addEventListener(
    "change",
    function () {

        const archivo =
            archivoExcel.files[0];


        // Si no hay archivo
        if (!archivo) {

            archivoSeleccionado.textContent = "";

            archivoSeleccionado.classList.add(
                "oculto"
            );

            btnActualizar.disabled = true;

            return;
        }


        // Comprobar extensión
        const nombre =
            archivo.name.toLowerCase();

        if (
            !nombre.endsWith(".xlsx") &&
            !nombre.endsWith(".xls")
        ) {

            mostrarEstado(
                "❌ Selecciona un archivo Excel válido.",
                "error"
            );

            archivoExcel.value = "";

            archivoSeleccionado.textContent = "";

            archivoSeleccionado.classList.add(
                "oculto"
            );

            btnActualizar.disabled = true;

            return;
        }


        // Mostrar archivo
        archivoSeleccionado.textContent =
            "📄 " + archivo.name;

        archivoSeleccionado.classList.remove(
            "oculto"
        );


        // Activar botón
        btnActualizar.disabled = false;


        // Limpiar mensaje anterior
        estado.textContent = "";

        estado.className = "estado";
    }
);


// ==========================================
// BOTÓN ACTUALIZAR
// ==========================================

btnActualizar.addEventListener(
    "click",
    async function () {

        const archivo =
            archivoExcel.files[0];


        // Verificar archivo
        if (!archivo) {

            mostrarEstado(
                "❌ Selecciona un archivo Excel.",
                "error"
            );

            return;
        }


        // Mostrar cargando
        mostrarEstado(
            "🔄 Actualizando Excel...",
            "cargando"
        );


        // Desactivar botón
        btnActualizar.disabled = true;


        try {

            // Crear formulario
            const formulario =
                new FormData();


            formulario.append(
                "archivo",
                archivo
            );


            // Enviar a Supabase
            const respuesta =
                await fetch(
                    SUPABASE_FUNCTION_URL,
                    {
                        method: "POST",

                        body: formulario
                    }
                );


            // Intentar leer respuesta
            const datos =
                await respuesta.json();


            // Error HTTP
            if (!respuesta.ok) {

                throw new Error(
                    datos.mensaje ||
                    "Error al actualizar el Excel."
                );
            }


            // Error de la función
            if (!datos.ok) {

                throw new Error(
                    datos.mensaje ||
                    "No se pudo actualizar el Excel."
                );
            }


            // ==================================
            // ACTUALIZACIÓN CORRECTA
            // ==================================

            mostrarEstado(
                "✅ Excel actualizado correctamente.",
                "exito"
            );


            // Limpiar selección
            archivoExcel.value = "";

            archivoSeleccionado.textContent = "";

            archivoSeleccionado.classList.add(
                "oculto"
            );

        }
        catch (error) {

            console.error(
                "Error:",
                error
            );


            mostrarEstado(
                "❌ " +
                (
                    error.message ||
                    "Ocurrió un error."
                ),
                "error"
            );

        }
        finally {

            // Volver a permitir seleccionar
            btnActualizar.disabled = false;
        }
    }
);


// ==========================================
// MOSTRAR MENSAJE
// ==========================================

function mostrarEstado(
    mensaje,
    tipo
) {

    estado.textContent =
        mensaje;

    estado.className =
        "estado " + tipo;
}