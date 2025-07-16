export class MatrixBackground {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private columns: number[];
    private fontSize = 16;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        const columnCount = Math.floor(this.canvas.width / this.fontSize);
        this.columns = Array(columnCount).fill(1);

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    public start(): void {
        setInterval(() => this.draw(), 50);
    }

    private draw(): void {
        // Fundo semi-transparente para criar o efeito de "rastro"
        this.ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Define a cor dos caracteres
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
        this.ctx.font = this.fontSize + 'px monospace';

        for (let i = 0; i < this.columns.length; i++) {
            const text = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const char = text.charAt(Math.floor(Math.random() * text.length));
            
            this.ctx.fillText(char, i * this.fontSize, this.columns[i] * this.fontSize);

            // Reseta a coluna para o topo aleatoriamente para um efeito mais dinâmico
            if (this.columns[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.columns[i] = 0;
            }
            
            this.columns[i]++;
        }
    }

    private resizeCanvas(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        const columnCount = Math.floor(this.canvas.width / this.fontSize);
        this.columns = Array(columnCount).fill(1);
    }
}