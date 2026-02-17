const payBtn = document.getElementById("payBtn");
const amountInput = document.getElementById("amount");

// DEINE WALLET
const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

// Phantom Check
function hasPhantom() {
  return window.solana && window.solana.isPhantom;
}

// PAY BUTTON
payBtn.addEventListener("click", async () => {
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) return alert("Enter valid amount.");

  if (!hasPhantom()) return alert("Install Phantom wallet first.");

  try { await window.solana.connect({ onlyIfTrusted: false }); } 
  catch { return alert("Wallet rejected."); }

  // SOL Payment Link (öffnet Phantom)
  const payUrl = `solana:${WALLET_ADDRESS}?amount=${amount}`;
  window.open(payUrl, "_self");

  // CANVAS OVERLAY für Rakete
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.background = "#0f0f0f";
  document.body.innerHTML = "";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // Countdown 5...4...3...
  let countdown = 5;
  const countdownInterval = setInterval(() => {
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#14f195";
    ctx.font = "80px monospace";
    ctx.textAlign = "center";
    ctx.fillText(countdown > 0 ? countdown : "", canvas.width/2, canvas.height/2);
    countdown--;
    if(countdown < 0) clearInterval(countdownInterval);
  }, 1000);

  // kleine delay bis Rakete startet
  setTimeout(() => {
    let rocketY = canvas.height - 50;
    const rocketX = canvas.width / 2;

    function drawRocket() {
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // Rakete
      ctx.fillStyle = "#14f195";
      ctx.beginPath();
      ctx.moveTo(rocketX, rocketY);
      ctx.lineTo(rocketX-10, rocketY+30);
      ctx.lineTo(rocketX+10, rocketY+30);
      ctx.closePath();
      ctx.fill();

      // Flamme
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(rocketX, rocketY+30);
      ctx.lineTo(rocketX-5, rocketY+45);
      ctx.lineTo(rocketX+5, rocketY+45);
      ctx.closePath();
      ctx.fill();

      rocketY -= 5;

      if(rocketY + 45 > 0) requestAnimationFrame(drawRocket);
      else showSuccess();
    }

    drawRocket();
  }, 6000); // countdown 5s + small delay

  // Show final success
  function showSuccess() {
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#14f195";
    ctx.font = "60px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Solana Wasted Success 🚀", canvas.width/2, canvas.height/2);
  }
});
