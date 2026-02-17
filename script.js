const payBtn = document.getElementById("payBtn");
const amountInput = document.getElementById("amount");

const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

const connection = new solanaWeb3.Connection(RPC_ENDPOINT, 'confirmed');

function hasPhantom() {
  return window.solana && window.solana.isPhantom;
}

// Prüft letzte 20 TX an die Wallet
async function txConfirmed(amount) {
  const pubKey = new solanaWeb3.PublicKey(WALLET_ADDRESS);
  const sigs = await connection.getSignaturesForAddress(pubKey, { limit: 20 });

  for (let s of sigs) {
    const tx = await connection.getTransaction(s.signature);
    if (!tx || !tx.meta) continue;
    // Check SOL transfer
    const pre = tx.meta.preBalances;
    const post = tx.meta.postBalances;
    const diff = post[0] - pre[0]; // Lamports
    if (diff >= amount * 1e9) return true;
  }
  return false;
}

// Canvas Sketch Rakete
function launchRocket() {
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

  // Countdown
  let countdown = 5;
  const cdInterval = setInterval(() => {
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#14f195";
    ctx.font = "80px monospace";
    ctx.textAlign = "center";
    ctx.fillText(countdown > 0 ? countdown : "", canvas.width/2, canvas.height/2);
    countdown--;
    if(countdown < 0) clearInterval(cdInterval);
  }, 1000);

  // Start Rakete nach Countdown
  setTimeout(() => {
    let rocketY = canvas.height - 50;
    const rocketX = canvas.width / 2;
    function drawRocket() {
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0,0,canvas.width,canvas.height);

      ctx.fillStyle = "#14f195";
      ctx.beginPath();
      ctx.moveTo(rocketX, rocketY);
      ctx.lineTo(rocketX-10, rocketY+30);
      ctx.lineTo(rocketX+10, rocketY+30);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(rocketX, rocketY+30);
      ctx.lineTo(rocketX-5, rocketY+45);
      ctx.lineTo(rocketX+5, rocketY+45);
      ctx.closePath();
      ctx.fill();

      rocketY -= 5;
      if(rocketY + 45 > 0) requestAnimationFrame(drawRocket);
      else {
        ctx.fillStyle = "#0f0f0f";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "#14f195";
        ctx.font = "60px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Solana Wasted Success 🚀", canvas.width/2, canvas.height/2);
      }
    }
    drawRocket();
  }, 6000);
}

payBtn.addEventListener("click", async () => {
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) return alert("Enter valid amount.");
  if (!hasPhantom()) return alert("Install Phantom wallet first.");

  try { await window.solana.connect({ onlyIfTrusted: false }); }
  catch { return alert("Wallet rejected."); }

  // Phantom Payment Link
  const payUrl = `solana:${WALLET_ADDRESS}?amount=${amount}`;
  window.open(payUrl, "_self");

  // Polling: check every 3s, max 30s
  let tries = 0;
  const poll = setInterval(async () => {
    tries++;
    const confirmed = await txConfirmed(amount);
    if (confirmed || tries > 10) { // max ~30s
      clearInterval(poll);
      launchRocket();
    }
  }, 3000);
});
