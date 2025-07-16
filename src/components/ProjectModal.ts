import { decryptAnimation } from "../utils/DecryptAnimation";

export class ProjectModal {
    private modal: HTMLElement;
    private modalCloseBtn: HTMLElement;
    private modalTitle: HTMLElement;
    private modalTech: HTMLElement;
    private modalDesc: HTMLElement;
    private modalLink: HTMLAnchorElement;
    private activeIntervals: number[] = [];

    constructor() {
        this.modal = document.getElementById('project-modal')!;
        this.modalCloseBtn = document.getElementById('modal-close-btn')!;
        this.modalTitle = document.getElementById('modal-title')!;
        this.modalTech = document.getElementById('modal-tech')!;
        this.modalDesc = document.getElementById('modal-desc')!;
        this.modalLink = document.getElementById('modal-link') as HTMLAnchorElement;

        this.addEventListeners();
    }

    private addEventListeners(): void {
        document.querySelectorAll('.project-card-clickable').forEach(card => {
            card.addEventListener('click', () => {
                const cardElement = card as HTMLElement;
                const { title, desc, tech, link } = cardElement.dataset;
                if(title && desc && tech && link) {
                    this.openModal(title, desc, tech, link);
                }
            });
        });

        this.modalCloseBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }
    
    private openModal(title: string, desc: string, tech: string, link: string): void {
        // Limpa animações anteriores antes de iniciar novas
        this.clearRunningAnimations();

        this.modal.classList.remove('hidden');
        
        this.modalTitle.textContent = '';
        this.modalDesc.textContent = '';
        this.modalTech.innerHTML = '';
        this.modalLink.href = link;

        tech.split('|').forEach(techItem => {
            const techTag = document.createElement('span');
            techTag.textContent = techItem.trim();
            this.modalTech.appendChild(techTag);
        });
        
        // Armazena os IDs das novas animações para que possam ser canceladas
        this.activeIntervals.push(decryptAnimation(this.modalTitle, title));
        this.activeIntervals.push(decryptAnimation(this.modalDesc, desc));
    }

    private closeModal(): void {
        this.modal.classList.add('hidden');
        this.clearRunningAnimations();
    }

    private clearRunningAnimations(): void {
        // Cancela todas as animações que estiverem na lista
        this.activeIntervals.forEach(intervalId => clearInterval(intervalId));
        this.activeIntervals = []; // Limpa a lista
    }
}