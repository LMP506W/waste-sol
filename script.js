const payBtn = document.getElementById("payBtn");
const amountInput = document.getElementById("amount");

const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

payBtn.disabled = false;

payBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  // ⚠️ WARNING
  const ok = confirm(
    `⚠️ WARNING ⚠️\n\n` +
    `You are about to send ${amount} SOL.\n` +
    `This transaction is REAL and IRREVERSIBLE.\n\n` +
    `Do you want to continue?`
  );

  if (!ok) return;

  // Solana Pay Link (wallet-agnostic)
  const label = encodeURIComponent("WASTE SOL");
  const message = encodeURIComponent("Money goes nowhere.");
  const url = `solana:${WALLET_ADDRESS}?amount=${amount}&label=${label}&message=${message}`;

  // Open wallet
  window.location.href = url;

  // Start rocket anyway (fun concept)
  setTimeout(launchRocket, 2000);
});

// ===============================
// ROCKET ANIMATION
// ===============================
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

      if (y > -60) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(
          "SOL WASTED",
          canvas.width / 2,
          canvas.height / 2
        );
      }
    }

    animate();
  }, 6000);
}
