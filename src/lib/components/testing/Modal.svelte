<script>
  export let nazwaPropozycji = 'wartość domyślna';
  export let opis = '';
  export let cena = 0;
  export let waluta = 'PLN';
  
  let licznik = 0;
  
  const incrementujLicznik = () => {
    licznik += 1;
  };
  
  const resetujLicznik = () => {
    licznik = 0;
  };
</script>

<div class="komponent">
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
  
  <!-- Dodaj resztę kodu komponentu -->
  <p class="hola">hola hola</p>
</div>

<style>
.komponent {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  color: #333;
  margin-top: 0;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}

.opis {
  color: #666;
  font-style: italic;
}

.cena {
  font-weight: bold;
  color: #2c3e50;
  font-size: 1.1em;
}

.licznik {
  margin: 16px 0;
  padding: 12px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.licznik p {
  margin: 0 0 8px 0;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  font-size: 14px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #2980b9;
}

button:last-child {
  background-color: #95a5a6;
}

button:last-child:hover {
  background-color: #7f8c8d;
}

.hola {
  text-align: center;
  color: #e74c3c;
  font-weight: bold;
  margin: 16px 0 0 0;
}
</style>