const payBtn = document.getElementById("payBtn");
const amountInput = document.getElementById("amount");

// ⛔️ HIER DEINE EIGENE SOL WALLET ADRESSE EINTRAGEN
const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

// Wallet Check
function hasPhantom() {
  return window.solana && window.solana.isPhantom;
}

payBtn.addEventListener("click", async () => {
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    alert("enter a real amount.");
    return;
  }

  if (!hasPhantom()) {
    alert("no wallet. no waste.");
    return;
  }

  // Optional: Wallet verbinden
  try {
    await window.solana.connect();
  } catch (err) {
    alert("wallet rejected.");
    return;
  }

  // Fake loading screen
  document.body.innerHTML = `
    <div style="
      height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:monospace;
      font-size:1.5rem;
      background:black;
      color:#14f195;
    ">
      wasting...
    </div>
  `;

  // Solana Pay Link
  const payUrl = `solana:${WALLET_ADDRESS}?amount=${amount}`;

  // Wallet öffnen
  setTimeout(() => {
    window.location.href = payUrl;
  }, 1200);

  // Eskalation → Weißer Bildschirm
  setTimeout(() => {
    document.body.innerHTML = "";
    document.body.style.background = "white";
  }, 4000);
});
