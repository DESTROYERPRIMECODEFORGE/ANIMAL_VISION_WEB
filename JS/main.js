/* ========================================
   ANIMAL VISION
   SISTEMA DE INTELIGENCIA ARTIFICIAL
======================================== */

// MODELO
let animalVisionModel = null;

// CLASES DEL MODELO
const clases = ["Gatos", "Perros", "Loros", "Otros"];

// ELEMENTOS HTML
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewMessage = document.getElementById("previewMessage");
const analyzeButton = document.getElementById("analyzeButton");

// ========================================
// CARGAR MODELO
// ========================================

async function cargarModelo() {

    try {

        console.log("ANIMAL VISION: Iniciando sistema...");

        await tf.ready();

        console.log("TensorFlow.js:", tf.version.tfjs);

        animalVisionModel = await tf.loadGraphModel(
            "Model/model.json"
        );

        console.log("¡MODELO CARGADO CORRECTAMENTE!");
        console.log("Entradas:", animalVisionModel.inputNodes);
        console.log("Salidas:", animalVisionModel.outputNodes);
        console.log("Forma de entrada:", animalVisionModel.inputs[0].shape);

    } catch (error) {

        console.error("ERROR AL CARGAR EL MODELO:", error);

    }

}

async function calentarModelo() {

    if (!animalVisionModel) return;

    console.log("Calentando modelo...");

    const tensorPrueba = tf.zeros([1, 224, 224, 3]);

    const resultado = animalVisionModel.execute(tensorPrueba);

    await resultado.data();

    tensorPrueba.dispose();
    resultado.dispose();

    console.log("¡Modelo preparado!");
}

// ========================================
// SELECCIONAR IMAGEN
// ========================================

imageInput.addEventListener("change", function () {

    const archivo = this.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {

        alert("Por favor, selecciona un archivo de imagen.");
        return;

    }

    const lector = new FileReader();

    lector.onload = function (evento) {

        imagePreview.src = evento.target.result;

        imagePreview.hidden = false;
        previewMessage.hidden = true;

        analyzeButton.disabled = false;

        console.log("Imagen seleccionada:", archivo.name);

    };

    lector.readAsDataURL(archivo);

});

// ========================================
// RECONOCIMIENTO DE ANIMALES
// ========================================

async function analizarAnimal() {

    if (!animalVisionModel) {

        console.error("El modelo todavía no está cargado.");
        return;

    }

    const tensores = [];

    try {

        console.log("Iniciando análisis de imagen...");

        // CONVERTIR IMAGEN A TENSOR
        const imagenTensor = tf.browser.fromPixels(imagePreview);
        tensores.push(imagenTensor);

        // REDIMENSIONAR A 224 X 224
        const imagenRedimensionada = tf.image.resizeBilinear(
            imagenTensor,
            [224, 224]
        );

        tensores.push(imagenRedimensionada);

        // CONVERTIR A FLOAT32 Y AGREGAR DIMENSIÓN DEL LOTE
        const entrada = imagenRedimensionada
            .toFloat()
            .expandDims(0);

        tensores.push(entrada);

        // EJECUTAR MODELO
        const resultado = animalVisionModel.execute(entrada);
        tensores.push(resultado);

        // OBTENER PROBABILIDADES
        const probabilidades = await resultado.data();

        // BUSCAR LA PROBABILIDAD MÁS ALTA
        const indice = probabilidades.indexOf(
            Math.max(...probabilidades)
        );

        const animalDetectado = clases[indice];

        const confianza = (probabilidades[indice] * 100).toFixed(2);

        console.log("Resultado:", animalDetectado);
        console.log("Confianza:", confianza + "%");
        console.log("Probabilidades:", Array.from(probabilidades));

        // ========================================
        // ELEMENTOS DE RESULTADOS
        // ========================================

        const resultContainer = document.getElementById("resultContainer");
        const prediction = document.getElementById("prediction");
        const confidence = document.getElementById("confidence");

        const animalIcon = document.getElementById("animalIcon");
        const confidenceProgress = document.getElementById("confidenceProgress");

        // ICONOS DE LAS CUATRO CLASES
        const animalIcons = {

            "Gatos": "🐱",
            "Perros": "🐶",
            "Loros": "🦜",
            "Otros": "🚫"

        };

        // ACTUALIZAR RESULTADOS
        animalIcon.textContent = animalIcons[animalDetectado];

        if (animalDetectado === "Otros") {

            prediction.textContent = "Imagen no reconocida como animal";

        } else {

            prediction.textContent = "Animal identificado: " + animalDetectado;

        }

        confidence.textContent = "Confianza: " + confianza + "%";

        resultContainer.hidden = false;

        // ========================================
        // ANIMACIÓN DE TARJETA DE RESULTADOS
        // ========================================

        gsap.killTweensOf(confidenceProgress);

        gsap.set(resultContainer, {

            opacity: 0,
            y: 35,
            scale: 0.97

        });

        gsap.set(animalIcon, {

            opacity: 0,
            scale: 0.5,
            rotation: -15

        });

        gsap.set(confidenceProgress, {

            width: "0%",
            backgroundColor: "var(--primary)"

        });

        // SECUENCIA DE ANIMACIÓN
        const resultTimeline = gsap.timeline({

            defaults: {
                ease: "power3.out"
            }

        });

        resultTimeline

            .to(resultContainer, {

                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7

            })

            .to(animalIcon, {

                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.7,
                ease: "back.out(1.7)"

            }, "-=0.35")

            .to(confidenceProgress, {

                width: confianza + "%",
                duration: 1.2,
                ease: "power2.out"

            }, "-=0.2");

        // CAMBIO CONSTANTE ENTRE PRIMARY Y SECONDARY
        gsap.fromTo(

            confidenceProgress,

            {
                backgroundColor: "#36d6c5"
            },

            {
                backgroundColor: "#7c8cff",
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"

            }

        );

    } catch (error) {

        console.error("ERROR DURANTE EL ANÁLISIS:", error);

    } finally {

        // LIBERAR MEMORIA DE LOS TENSORES
        tensores.forEach(tensor => tensor.dispose());

    }

}


// ========================================
// CONECTAR BOTÓN DE ANÁLISIS
// ========================================

analyzeButton.addEventListener("click", analizarAnimal);

// ========================================
// ANIMACIONES DE ENTRADA GSAP
// ========================================

function iniciarAnimaciones() {

    gsap.set(
        "#mainTitle, #mainDescription, #supportedAnimals, #uploadSection",
        {
            opacity: 0
        }
    );

    gsap.set(".animal-icon", {
        opacity: 0
    });

    const timeline = gsap.timeline({
        defaults: {
            ease: "power3.out"
        }
    });

    timeline

        // TÍTULO PRINCIPAL
        .fromTo(

            "#mainTitle",

            {
                y: 45,
                opacity: 0,
                filter: "blur(10px)"
            },

            {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1
            }

        )

        // DESCRIPCIÓN
        .fromTo(

            "#mainDescription",

            {
                y: 25,
                opacity: 0
            },

            {
                y: 0,
                opacity: 1,
                duration: 0.7
            },

            "-=0.45"

        )

        // CONTENEDOR DE ICONOS
        .fromTo(

            "#supportedAnimals",

            {
                opacity: 0
            },

            {
                opacity: 1,
                duration: 0.5
            },

            "-=0.2"

        )

        // ICONOS ANIMADOS UNO POR UNO
        .fromTo(

            ".animal-icon",

            {
                y: 35,
                opacity: 0,
                scale: 1
            },

            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.2,
                ease: "back.out(1.7)",
            },

            "-=0.3"

        )

        // SECCIÓN DE CARGA
        .fromTo(

            "#uploadSection",

            {
                y: 55,
                opacity: 0,
                scale: 0.96
            },

            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1
            },

            "-=0.25"

        );

}

// ========================================
// INICIAR APLICACIÓN
// ========================================

async function iniciarAplicacion() {

    await cargarModelo();

    iniciarAnimaciones();

}

iniciarAplicacion();