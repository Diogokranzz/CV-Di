import { BootLoader } from './components/BootLoader';
import { MatrixBackground } from './components/MatrixBackground';
import { ProjectModal } from './components/ProjectModal';
import { DataStream } from './components/DataStream';

document.addEventListener('DOMContentLoaded', () => {

    // --- Componente de Boot ---
    const bootLoader = new BootLoader();
    bootLoader.init(() => {
        // Callback para quando o boot terminar
        document.getElementById('main-content')!.style.display = 'block';
        initMainApp();
    });
    
    // Função para inicializar o resto da aplicação
    function initMainApp() {
        // --- Fundo Matrix ---
        const matrix = new MatrixBackground('matrix-background');
        matrix.start();

        // --- Seção de Projetos Interativa ---
        new ProjectModal();

        // --- Nova Seção Data Stream ---
        new DataStream();

        // --- Animação de Digitação no Header ---
        const typingElement = document.getElementById('typing-animation');
        if (typingElement) {
            const textToType = "sudo acessar perfil --profissional DiogoKranz";
            let index = 0;
            function type() {
                if (index < textToType.length && typingElement) {
                    typingElement.textContent += textToType.charAt(index);
                    index++;
                    setTimeout(type, 80);
                }
            }
            type();
        }

        // --- Animação de Revelação ao Rolar ---
        const revealElements = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => observer.observe(el));

        // --- Navegação Lateral Ativa ---
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.side-nav a');

        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (pageYOffset >= sectionTop - 60) {
                    current = section.getAttribute('id')!;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
});