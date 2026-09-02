
        // Carrusel Automático
        let slideIndex = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        let slideInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                indicators[i].classList.remove('active');
            });
            slides[index].classList.add('active');
            indicators[index].classList.add('active');
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

        // Control de pestañas Semanal / Mensual
        function setPeriod(period) {
            const btnSemanal = document.getElementById('btnSemanal');
            const btnMensual = document.getElementById('btnMensual');
            const periodLabel = document.getElementById('periodLabel');

            if (period === 'semanal') {
                btnSemanal.classList.add('active');
                btnMensual.classList.remove('active');
                periodLabel.textContent = "Período: 30-ago. al 06-sept.";
            } else {
                btnMensual.classList.add('active');
                btnSemanal.classList.remove('active');
                periodLabel.textContent = "Período: Mes en curso (Agosto - Septiembre)";
            }
        }
    