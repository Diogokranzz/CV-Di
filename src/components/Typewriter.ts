export class Typewriter {
    private element: HTMLElement;
    private textToType: string;
    private index = 0;

    constructor(elementId: string, text: string) {
        this.element = document.getElementById(elementId)!;
        this.textToType = text;

        if (this.element) {
            this.type();
        }
    }

    private type(): void {
        if (this.index < this.textToType.length) {
            this.element.textContent += this.textToType.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), 80);
        }
    }
}
