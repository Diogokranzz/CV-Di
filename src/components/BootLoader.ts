export class BootLoader {
    private loaderElement: HTMLElement | null;
    private sequenceElement: HTMLElement | null;
    private progressBar: HTMLElement | null;
    private accessMessage: HTMLElement | null;

    constructor() {
        this.loaderElement = document.getElementById('boot-loader');
        this.sequenceElement = document.getElementById('boot-sequence');
        this.progressBar = document.getElementById('progress-bar');
        this.accessMessage = document.getElementById('access-message');
    }

    // O método agora é PÚBLICO e aceita uma função (callback) para ser executada no final.
    public init(onComplete: () => void): void {
        if (!this.sequenceElement || !this.progressBar || !this.accessMessage || !this.loaderElement) {
            // Se algum elemento não for encontrado, executa o callback imediatamente para não travar a aplicação.
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
                this.sequenceElement!.appendChild(p);
                this.sequenceElement!.scrollTop = this.sequenceElement!.scrollHeight;
                messageIndex++;
            } else {
                clearInterval(typeInterval);
                this.startProgressBar(onComplete); // Passa a função 'onComplete' para o próximo passo
            }
        }, 500);
    }

    private startProgressBar(onComplete: () => void): void {
        let width = 0;
        const progressInterval = setInterval(() => {
            if (width >= 100) {
                clearInterval(progressInterval);
                this.showAccessMessage(onComplete); // Passa a função 'onComplete' para o próximo passo
            } else {
                width++;
                this.progressBar!.style.width = width + '%';
            }
        }, 20);
    }

    private showAccessMessage(onComplete: () => void): void {
        this.accessMessage!.textContent = "ACCESS GRANTED";
        this.accessMessage!.style.opacity = '1';

        // Após a mensagem de acesso, inicia a transição para sumir
        setTimeout(() => {
            this.loaderElement!.style.transition = 'opacity 0.5s ease-out';
            this.loaderElement!.style.opacity = '0';
            
            // Quando a transição terminar, esconde o loader e executa o callback
            setTimeout(() => {
                this.loaderElement!.style.display = 'none';
                onComplete(); // <-- AQUI! Executa a função que foi passada lá do main.ts
            }, 500);

        }, 1000);
    }
}