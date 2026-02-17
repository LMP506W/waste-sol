const openWalletBtn = document.getElementById("openWalletBtn");
const wasteBtn = document.getElementById("payBtn");
const amountInput = document.getElementById("amount");
const walletStatus = document.getElementById("walletStatus");

const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

let walletOpened = false;

// Initial state
wasteBtn.disabled = true;
walletStatus.innerText = "No wallet selected";

// ----------------------
// Open Wallet (NO CONNECT)
// ----------------------
openWalletBtn.addEventListener("click", () => {
  walletOpened = true;
  walletStatus.innerText = "Wallet ready";
  wasteBtn.disabled = false;
});

// ----------------------
// Waste SOL
// ----------------------
wasteBtn.addEventListener("click", () => {
  if (!walletOpened) {
    alert("Open a wallet first.");
    return;
  }

  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  const ok = confirm(
    `⚠️ WARNING ⚠️\n\n` +
    `You are about to send ${amount} SOL from YOUR wallet.\n` +
    `This transaction is REAL and IRREVERSIBLE.\n\n` +
    `Continue?`
  );

  if (!ok) return;

  const label = encodeURIComponent("WASTE SOL");
  const message = encodeURIComponent("Money goes nowhere.");
  const url = `solana:${WALLET_ADDRESS}?amount=${amount}&label=${label}&message=${message}`;

  // This opens the user's wallet
  window.location.href = url;

  setTimeout(launchRocket, 2000);
});

// ----------------------
// Rocket Animation
// ----------------------
function launchRocket() {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.background = "#0b0b0b";
  canvas.style.zIndex = "9999";

  document.body.innerHTML = "";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let countdown = 5;

  const timer = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#14f195";
    ctx.font = "bold 72px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      countdown > 0 ? countdown : "🚀",
      canvas.width / 2,
      canvas.height / 2
    );
    countdown--;
    if (countdown < 0) clearInterval(timer);
  }, 1000);

  setTimeout(() => {
    let y = canvas.height;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#14f195";
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, y);
      ctx.lineTo(canvas.width / 2 - 16, y + 40);
      ctx.lineTo(canvas.width / 2 + 16, y + 40);
      ctx.closePath();
      ctx.fill();
      y -= 8;
      if (y > -60) requestAnimationFrame(animate);
      else {
        ctx.fillText("SOL WASTED", canvas.width / 2, canvas.height / 2);
      }
    }
    animate();
  }, 6000);
}
