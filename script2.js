// Carrusel Automático
let slideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
let slideInterval;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (indicators[i]) indicators[i].classList.remove('active');
    });
    slides[index].classList.add('active');
    if (indicators[index]) indicators[index].classList.add('active');
}

function nextSlide() {
    slideIndex = (slideIndex + 1) % slides.length;
    showSlide(slideIndex);
}

function currentSlide(index) {
    slideIndex = index;
    showSlide(slideIndex);
    resetTimer();
}

function resetTimer() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 4500);
}

slideInterval = setInterval(nextSlide, 4500);

// Menú Móvil
const menuToggle = document.querySelector('.menu-toggle');
const header = document.querySelector('header');
const menuLinks = document.querySelectorAll('#main-menu a');

function toggleMenu() {
    const isOpen = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
}

menuToggle.addEventListener('click', toggleMenu);
menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
        header.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú');
    });
});

// Control de pestañas Semanal / Mensual con actualización de capa de datos
function setPeriod(period) {
    const btnSemanal = document.getElementById('btnSemanal');
    const btnMensual = document.getElementById('btnMensual');
    const periodLabel = document.getElementById('periodLabel');

    // Elementos donde se muestran las cifras
    const statGlp = document.getElementById('stat-glp');
    const statCisternas = document.getElementById('stat-cisternas');
    const statFamilias = document.getElementById('stat-familias');

    // Datos del periodo Semanal
    const datosSemanal = {
        label: "Período: agosto 2026.",
        glp: "356.065 GAL.",
        cisternas: "44",
        familias: "53.570"
    };

    // Datos del periodo Mensual (Personalizables)
    const datosMensual = {
        label: "Período: Mes de Agosto",
        glp: "1.424.260 GAL.",
        cisternas: "177",
        familias: "214.283"
    };

    if (period === 'semanal') {
        // Cambiar clases de los botones
        btnSemanal.classList.add('active');
        btnMensual.classList.remove('active');

        // Actualizar textos y valores
        periodLabel.textContent = datosSemanal.label;
        if (statGlp) statGlp.textContent = datosSemanal.glp;
        if (statCisternas) statCisternas.textContent = datosSemanal.cisternas;
        if (statFamilias) statFamilias.textContent = datosSemanal.familias;

    } else if (period === 'mensual') {
        // Cambiar clases de los botones
        btnMensual.classList.add('active');
        btnSemanal.classList.remove('active');

        // Actualizar textos y valores
        periodLabel.textContent = datosMensual.label;
        if (statGlp) statGlp.textContent = datosMensual.glp;
        if (statCisternas) statCisternas.textContent = datosMensual.cisternas;
        if (statFamilias) statFamilias.textContent = datosMensual.familias;
    }
}