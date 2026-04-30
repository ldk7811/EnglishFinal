import './style.css';
import { setupCounter } from '@/components/counter';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <p>A small program that blurs unfocused wiki paragraphs</p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);
