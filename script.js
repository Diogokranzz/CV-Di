document.addEventListener('DOMContentLoaded', () => {

    // --- UTILITY: Animação de Decriptografia (usada apenas pelo Data Stream agora) ---
    const decryptAnimation = (element, finalString) => {
        let interval;
        let iteration = 0;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        
        element.textContent = '';
        element.classList.add('jitter');

        clearInterval(interval);
      
        interval = setInterval(() => {
            element.textContent = finalString
                .split("")
                .map((char, index) => {
                    if (index < iteration) {
                        return finalString[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");
            
            if (iteration >= finalString.length) {
                clearInterval(interval);
                element.classList.remove('jitter');
            }
            
            iteration += 1 / 2; // Velocidade da animação
        }, 30);
    };


    // --- Animação de Boot Loader ---
    const initBootLoader = (onComplete) => {
        const loaderElement = document.getElementById('boot-loader');
        const sequenceElement = document.getElementById('boot-sequence');
        const progressBar = document.getElementById('progress-bar');
        const accessMessage = document.getElementById('access-message');
        const mainContent = document.getElementById('main-content');

        if (!loaderElement || !sequenceElement || !progressBar || !accessMessage || !mainContent) {
            onComplete();
            return;
        }

        const bootMessages = [
            "INITIATING MCP KERNEL...",
            "LOADING CORE MODULES...",
            "CHECKING SYSTEM INTEGRITY...",
            "MOUNTING VIRTUAL FILE SYSTEM...",
            "DECRYPTING USER PROFILE...",
            "CONNECTION ESTABLISHED.",
        ];

        let messageIndex = 0;
        const typeInterval = setInterval(() => {
            if (messageIndex < bootMessages.length) {
                const p = document.createElement('p');
                p.textContent = `> ${bootMessages[messageIndex]}`;
                sequenceElement.appendChild(p);
                sequenceElement.scrollTop = sequenceElement.scrollHeight;
                messageIndex++;
            } else {
                clearInterval(typeInterval);
                startProgressBar();
            }
        }, 300);

        const startProgressBar = () => {
            let width = 0;
            const progressInterval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(progressInterval);
                    showAccessMessage();
                } else {
                    width++;
                    progressBar.style.width = width + '%';
                }
            }, 15);
        };

        const showAccessMessage = () => {
            accessMessage.textContent = "ACCESS GRANTED";
            accessMessage.style.opacity = '1';

            setTimeout(() => {
                loaderElement.style.transition = 'opacity 0.5s ease-out';
                loaderElement.style.opacity = '0';
                
                setTimeout(() => {
                    loaderElement.style.display = 'none';
                    mainContent.style.display = 'block';
                    onComplete();
                }, 500);

            }, 1000);
        };
    };

    // --- Função Principal de Inicialização ---
    const initMainApp = () => {

        // --- Animação de Fundo Matrix ---
        const canvas = document.getElementById('matrix-background');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const fontSize = 16;
            const columns = Math.floor(canvas.width / fontSize);
            const drops = Array(columns).fill(1);

            const drawMatrix = () => {
                ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
                ctx.font = fontSize + 'px monospace';

                for (let i = 0; i < drops.length; i++) {
                    const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    const char = text.charAt(Math.floor(Math.random() * text.length));
                    ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            };
            setInterval(drawMatrix, 50);
        }

        // --- Animação de Digitação no Header ---
        const typingElement = document.getElementById('typing-animation');
        if (typingElement) {
            const textToType = "sudo acessar perfil --profissional DiogoKranz";
            let index = 0;
            function type() {
                if (index < textToType.length) {
                    typingElement.textContent += textToType.charAt(index);
                    index++;
                    setTimeout(type, 80);
                }
            }
            type();
        }

        // --- Modal de Projetos ---
        const modal = document.getElementById('project-modal');
        const projectItems = document.querySelectorAll('.project-item');
        const closeModal = document.querySelector('.close-button');
        
        projectItems.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.getAttribute('data-title');
                const description = item.getAttribute('data-description');
                const link = item.querySelector('a').href;
                
                document.getElementById('modal-title').textContent = title;
                const descElement = document.getElementById('modal-description');
                // Animação removida: O texto agora aparece instantaneamente.
                descElement.textContent = description;
                document.getElementById('modal-link').href = link;
                
                modal.style.display = 'block';
            });
        });
        
        closeModal.onclick = () => {
            modal.style.display = 'none';
        }
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        // --- Seção DATA_STREAM ---
        const dataStreamSection = document.getElementById('data-stream');
        if (dataStreamSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startScanAnimation();
                        observer.unobserve(dataStreamSection);
                    }
                });
            }, { threshold: 0.2 });
            observer.observe(dataStreamSection);
        }
        
        const startScanAnimation = () => {
            const container = document.querySelector('.data-stream-container');
            const scannerLine = document.querySelector('.scanner-line');
            const dataNodes = document.querySelectorAll('.data-node');
            
            if(!container || !scannerLine || !dataNodes.length) return;

            scannerLine.style.animation = 'scan 5s linear forwards';
            
            const checkInterval = setInterval(() => {
                const scannerRect = scannerLine.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                if (scannerRect.top > containerRect.bottom) {
                    clearInterval(checkInterval);
                    dataNodes.forEach(node => {
                        if (!node.classList.contains('is-active')) {
                            revealNode(node);
                        }
                    });
                    return;
                }

                dataNodes.forEach(node => {
                    const nodeRect = node.getBoundingClientRect();
                    if (scannerRect.bottom >= nodeRect.top && !node.classList.contains('is-active')) {
                        revealNode(node);
                    }
                });
            }, 50);
        };

        const revealNode = (node) => {
            node.classList.add('is-active');
            const valueElement = node.querySelector('.node-value');
            if (valueElement) {
                const textToDecrypt = valueElement.dataset.text || '';
                decryptAnimation(valueElement, textToDecrypt);
            }
        };

        // --- Animação de Revelação ao Rolar ---
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => revealObserver.observe(el));

        // --- Navegação Lateral Ativa ---
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.side-nav a');
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                // CORREÇÃO: A seção se torna ativa quando seu topo passa do meio da tela,
                // em vez de um ponto fixo no topo. Isso corrige o bug da última seção.
                if (pageYOffset >= sectionTop - window.innerHeight / 2) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    };
    
    // Inicia o processo todo
    initBootLoader(initMainApp);
});