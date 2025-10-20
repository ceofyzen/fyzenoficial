// app/components/AccessibilityButton.tsx
'use client';

// Certifique-se de ter 'lucide-react' instalado
import { Accessibility } from 'lucide-react'; 

export default function AccessibilityButton() {
  
  // No futuro, você pode ligar isso a um widget (ex: VLibras ou UserWay)
  const handleAccessibilityClick = () => {
    alert('Menu de Acessibilidade (em breve)');
  };

  return (
    <button
      className={`fixed bottom-8 left-8 z-50 p-3 rounded-full bg-black text-white
                  shadow-lg transition-all duration-300 ease-in-out
                  hover:bg-gray-800 hover:scale-110`}
      onClick={handleAccessibilityClick}
      aria-label="Menu de Acessibilidade"
    >
      <Accessibility size={20} />
    </button>
  );
}