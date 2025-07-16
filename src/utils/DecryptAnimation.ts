const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

// A função agora retorna o ID do intervalo para que possa ser cancelado externamente.
export function decryptAnimation(element: HTMLElement, originalText: string): number {
    let iterations = 0;
    
    const intervalId = window.setInterval(() => {
        const jitter = Math.random() * 2 - 1; 
        element.style.transform = `translateY(${jitter}px)`;

        element.innerText = originalText
            .split("")
            .map((char, index) => {
                if (char === ' ' || index < iterations) {
                    return originalText[index];
                }
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("");

        if (iterations >= originalText.length) {
            clearInterval(intervalId);
            element.style.transform = ''; 
        }
        
        iterations += 1;
    }, 20);

    return intervalId;
}