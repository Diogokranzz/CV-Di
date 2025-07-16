import { decryptAnimation } from '../utils/DecryptAnimation';

export class DataStream {
    private container: HTMLElement | null;
    private dataNodes: NodeListOf<HTMLElement> | null;
    private scannerLine: HTMLElement | null;
    private dataStreamContainer: HTMLElement | null;

    constructor() {
        this.container = document.getElementById('data-stream');
        
        // Esta estrutura evita o erro do TypeScript.
        // Só inicializamos as propriedades se o contêiner principal existir.
        if (this.container) {
            this.dataStreamContainer = this.container.querySelector('.data-stream-container');
            this.scannerLine = this.container.querySelector('.scanner-line');
            this.dataNodes = this.container.querySelectorAll('.data-node');
            
            // Só prosseguimos se todos os elementos necessários forem encontrados.
            if (this.dataStreamContainer && this.scannerLine && this.dataNodes) {
                this.init();
            }
        } else {
            // Se o contêiner não for encontrado, inicializamos as propriedades como nulas.
            this.dataStreamContainer = null;
            this.scannerLine = null;
            this.dataNodes = null;
        }
    }
    
    private init(): void {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startScanAnimation();
                    observer.unobserve(this.container!); // Sabemos que o contêiner não é nulo aqui.
                }
            });
        }, { threshold: 0.1 }); // Inicia quando 10% da seção está visível
        
        observer.observe(this.container!);
    }
    
    private startScanAnimation(): void {
        if (!this.scannerLine || !this.dataStreamContainer || !this.dataNodes) return;

        // Aplica diretamente a animação do CSS.
        this.scannerLine.style.animation = `scan 5s linear forwards`;
        
        const checkInterval = setInterval(() => {
            const scannerRect = this.scannerLine!.getBoundingClientRect();
            const containerRect = this.dataStreamContainer!.getBoundingClientRect();

            if (scannerRect.top > containerRect.bottom) {
                clearInterval(checkInterval);
                this.dataNodes!.forEach(node => {
                    if (!node.classList.contains('is-active')) {
                        this.revealNode(node);
                    }
                });
                return;
            }

            this.dataNodes!.forEach(node => {
                const nodeRect = node.getBoundingClientRect();
                if (scannerRect.bottom >= nodeRect.top && !node.classList.contains('is-active')) {
                    this.revealNode(node);
                }
            });
        }, 50);
    }

    private revealNode(node: HTMLElement): void {
        // Usa a classe 'is-active' que está definida no CSS.
        node.classList.add('is-active');
        
        // Encontra o elemento correto para aplicar a animação.
        const valueElement = node.querySelector<HTMLElement>('.node-value');
        if (valueElement) {
            const textToDecrypt = valueElement.dataset.text || '';
            // Anima o texto.
            decryptAnimation(valueElement, textToDecrypt);
        }
    }
}