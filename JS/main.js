/* ========================================
   ANIMAL VISION
   SISTEMA DE INTELIGENCIA ARTIFICIAL
======================================== */

// MODELO
let animalVisionModel = null;

// ELEMENTOS HTML
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewMessage = document.getElementById("previewMessage");
const analyzeButton = document.getElementById("analyzeButton");

// CARGAR MODELO
async function cargarModelo() {

    try {

        console.log("ANIMAL VISION: Iniciando sistema...");

        await tf.ready();

        console.log("TensorFlow.js:", tf.version.tfjs);

        animalVisionModel = await tf.loadGraphModel(
            "Model/model.json"
        );

        console.log("¡MODELO CARGADO CORRECTAMENTE!");
        console.log("Nombres de entrada:", animalVisionModel.inputNodes);
        console.log("Nombres de salida:", animalVisionModel.outputNodes);

        console.log("Forma de entrada:", animalVisionModel.inputs[0].shape);
        console.log("Nombres de las operaciones:", animalVisionModel.executor.graph.nodes.length);
    } catch (error) {

        console.error("ERROR AL CARGAR EL MODELO:", error);

    }

}

// SELECCIONAR IMAGEN
imageInput.addEventListener("change", function () {

    const archivo = this.files[0];

    if (!archivo) return;

    // Verificar que sea una imagen
    if (!archivo.type.startsWith("image/")) {

        alert("Por favor, selecciona un archivo de imagen.");
        return;

    }

    // Mostrar imagen seleccionada
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

    try {

        console.log("Iniciando análisis de imagen...");

        // Convertir imagen a tensor
        const imagenTensor = tf.browser.fromPixels(imagePreview);

        // Redimensionar a 224 x 224
        const imagenRedimensionada = tf.image.resizeBilinear(
            imagenTensor,
            [224, 224]
        );

        // Convertir a Float32 y agregar dimensión del lote
        const entrada = imagenRedimensionada
            .toFloat()
            .expandDims(0);

        // Ejecutar modelo
        const resultado = animalVisionModel.execute(entrada);

        // Obtener probabilidades
        const probabilidades = await resultado.data();

        // Clases del modelo
        const animales = ["Gatos", "Perros", "Loros"];

        // Buscar la probabilidad más alta
        const indice = probabilidades.indexOf(
            Math.max(...probabilidades)
        );

        const animalDetectado = animales[indice];

        const confianza = (probabilidades[indice] * 100).toFixed(2);

        console.log("Animal detectado:", animalDetectado);
        console.log("Confianza:", confianza + "%");

        // MOSTRAR RESULTADOS EN PANTALLA
        const resultContainer = document.getElementById("resultContainer");
        const prediction = document.getElementById("prediction");
        const confidence = document.getElementById("confidence");

        // ICONOS DE ANIMALES
        const animalIcons = {
            "Gatos": "🐱",
            "Perros": "🐶",
            "Loros": "🦜"
        };

        // MOSTRAR RESULTADO
        const animalIcon = document.getElementById("animalIcon");
        const confidenceProgress = document.getElementById("confidenceProgress");

        animalIcon.textContent = animalIcons[animalDetectado];

        prediction.textContent = "Animal identificado: " + animalDetectado;
        confidence.textContent = "Confianza: " + confianza + "%";

        resultContainer.hidden = false;

        // REINICIAR ANIMACIONES
        gsap.set(
            [resultContainer, animalIcon, confidenceProgress],
            { clearProps: "all" }
        );

        gsap.set(resultContainer, { opacity: 0, y: 35, scale: 0.96 });
        gsap.set(animalIcon, { opacity: 0, scale: 0.5, rotation: -15 });
        gsap.set(confidenceProgress, { width: "0%" });

        // ANIMAR RESULTADO
        const resultTimeline = gsap.timeline({
            defaults: { ease: "power3.out" }
        });

        resultTimeline
            .to(resultContainer, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.65
            })
            .to(animalIcon, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                duration: 0.6,
                ease: "back.out(1.7)"
            }, "-=0.25")
            .to(confidenceProgress, {
                width: confianza + "%",
                duration: 1.2,
                ease: "power2.out"
            }, "-=0.15");

        // Liberar memoria
        imagenTensor.dispose();
        imagenRedimensionada.dispose();
        entrada.dispose();
        resultado.dispose();

    } catch (error) {

        console.error("ERROR DURANTE EL ANÁLISIS:", error);

    }

}

// CONECTAR BOTÓN DE ANÁLISIS
analyzeButton.addEventListener("click", analizarAnimal);

// ========================================
// ANIMACIONES DE ENTRADA GSAP
// ========================================

function iniciarAnimaciones() {

    const timeline = gsap.timeline({
        defaults: {
            ease: "power3.out"
        }
    });

    timeline
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

// EJECUTAR ANIMACIONES CUANDO CARGUE EL MODELO

async function iniciarAplicacion() {

    await cargarModelo();

    iniciarAnimaciones();

}

iniciarAplicacion();