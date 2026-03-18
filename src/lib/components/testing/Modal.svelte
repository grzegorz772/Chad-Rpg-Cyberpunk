<script>
import { fade } from 'svelte/transition';
  export let nazwaPropozycji = 'wartość domyślna';
  export let opis = '';
  export let cena = 0;
  export let waluta = 'PLN';
  
  let licznik = 0;
  let komponentWidoczny = true;
  
  const incrementujLicznik = () => {
    licznik += 1;
  };
  
  const resetujLicznik = () => {
    licznik = 0;
  };
  
  const toggleKomponent = () => {
    komponentWidoczny = !komponentWidoczny;
    console.log('Stan komponentu:', komponentWidoczny); // dla debugowania
  };
</script>

<!-- Przycisk do pokazywania/ukrywania (zawsze widoczny) -->
<button class="toggle-btn" on:click={toggleKomponent} class:ukryty={!komponentWidoczny}>
  {#if komponentWidoczny}
    <span class="toggle-icon">◀</span>
    <span>Ukryj panel</span>
  {:else}
    <span class="toggle-icon">▶</span>
    <span>Pokaż panel</span>
  {/if}
</button>

<!-- Główny komponent - widoczny tylko gdy komponentWidoczny = true -->
{#if komponentWidoczny}
  <div class="komponent" transition:fade={{ duration: 300 }}>
    <h2>{nazwaPropozycji}</h2>
    
    {#if opis}
      <p class="opis">{opis}</p>
    {/if}
    
    {#if cena > 0}
      <p class="cena">Cena: {cena} {waluta}</p>
    {/if}
    
    <div class="licznik">
      <p>Liczba kliknięć: {licznik}</p>
      <button on:click={incrementujLicznik}>Kliknij mnie</button>
      <button on:click={resetujLicznik}>Resetuj</button>
    </div>
    
    <p class="hola">hola hola</p>
  </div>
{/if}

<style>
  /* Przycisk toggle - zawsze widoczny */
  .toggle-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  }
  
  .toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }
  
  .toggle-btn.ukryty {
    background: linear-gradient(135deg, #48c6ef, #6f86d6);
  }
  
  .toggle-icon {
    font-size: 20px;
    line-height: 1;
  }
  
  /* Główny komponent - pozycjonowany w prawym górnym rogu */
  .komponent {
    position: fixed;
    top: 80px;
    right: 20px;
    width: 320px;
    max-width: calc(100vw - 40px);
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    background: white;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    z-index: 999;
    animation: slideIn 0.3s ease;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  h2 {
    color: #333;
    margin: 0 0 12px 0;
    font-size: 1.3rem;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 8px;
  }
  
  .opis {
    color: #666;
    font-style: italic;
    margin: 8px 0;
    font-size: 0.95rem;
  }
  
  .cena {
    font-weight: bold;
    color: #2c3e50;
    font-size: 1.1em;
    background: #f8f9fa;
    padding: 8px 12px;
    border-radius: 8px;
    margin: 10px 0;
  }
  
  .licznik {
    margin: 16px 0;
    padding: 16px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 10px;
    border: 1px solid #dee2e6;
  }
  
  .licznik p {
    margin: 0 0 12px 0;
    font-weight: 600;
    color: #495057;
  }
  
  button {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
  
  button:last-child {
    background: linear-gradient(135deg, #fc466b, #3f5efb);
  }
  
  .hola {
    text-align: center;
    color: #e74c3c;
    font-weight: bold;
    margin: 12px 0 0 0;
    font-size: 1.1rem;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  /* Responsywność */
  @media (max-width: 768px) {
    .toggle-btn {
      top: 10px;
      right: 10px;
      padding: 8px 16px;
      font-size: 14px;
    }
    
    .komponent {
      top: 70px;
      right: 10px;
      width: 300px;
      padding: 16px;
    }
    
    button {
      padding: 6px 12px;
      font-size: 13px;
    }
  }
  
  @media (max-width: 480px) {
    .komponent {
      width: calc(100vw - 20px);
      right: 10px;
      left: 10px;
      top: 70px;
    }
    
    .toggle-btn span:last-child {
      display: none; /* Ukryj tekst na małych ekranach, zostaw tylko ikonę */
    }
  }
</style>