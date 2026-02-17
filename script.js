const payBtn = document.getElementById("payBtn");
const amountInput = document.getElementById("amount");

// HIER DEINE SOL WALLET ADRESSE EINTRAGEN
const WALLET_ADDRESS = "HIER_DEINE_SOL_ADRESSE";

payBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    alert("enter a real amount.");
    return;
  }

  const url = `solana:${WALLET_ADDRESS}?amount=${amount}`;

  // öffnet Phantom / Wallet
  window.location.href = url;

  // nach kurzer Zeit → weißer Bildschirm
  setTimeout(() => {
    document.body.innerHTML = "";
    document.body.style.background = "white";
  }, 3000);
});
