const payBtn = document.getElementById("payBtn");
const amountInput = document.getElementById("amount");

// 🔴 HIER DEINE ECHTE SOLANA ADRESSE
const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

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
    alert("install phantom wallet first.");
    return;
  }

  // Wallet verbinden (wichtig!)
  try {
    await window.solana.connect({ onlyIfTrusted: false });
  } catch {
    alert("wallet connection rejected.");
    return;
  }

  // Fake loading (aber Seite bleibt intakt)
  const overlay = document.createElement("div");
  overlay.style = `
    position:fixed;
    inset:0;
    background:black;
    color:#14f195;
    display:flex;
    align-items:center;
    justify-content:center;
    font-family:monospace;
    font-size:1.5rem;
    z-index:9999;
  `;
  overlay.innerText = "wasting...";
  document.body.appendChild(overlay);

  // Phantom öffnen (USER INITIIERT → Browser erlaubt)
  const payUrl = `solana:${WALLET_ADDRESS}?amount=${amount}`;
  window.open(payUrl, "_self");

  // Weiß erst NACH Wallet-Öffnung
  setTimeout(() => {
    document.body.innerHTML = "";
    document.body.style.background = "white";
  }, 6000);
});
