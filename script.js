const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");
const walletStatus = document.getElementById("walletStatus");
const amountInput = document.getElementById("amount");

const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";
const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");

let userPublicKey = null;

// Phantom check
function hasPhantom() { return window.solana && window.solana.isPhantom; }

// Update wallet status
async function updateWalletStatus() {
  if(!userPublicKey) {
    walletStatus.innerText = "Not connected";
    return;
  }
  const balanceLamports = await connection.getBalance(userPublicKey);
  const balanceSOL = (balanceLamports / 1e9).toFixed(4);
  walletStatus.innerText = `Connected: ${balanceSOL} SOL`;
}

// Sketch rocket
function launchRocket() {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.background = "#0f0f0f";
  document.body.innerHTML = "";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

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

// Connect Phantom
connectBtn.addEventListener("click", async () => {
  if(!hasPhantom()) return alert("Install Phantom Wallet first!");
  try {
    const resp = await window.solana.connect();
    userPublicKey = resp.publicKey;
    await updateWalletStatus();
    payBtn.disabled = false;
  } catch(e) {
    console.log(e);
    walletStatus.innerText = "Wallet connection rejected";
  }
});

// Waste SOL
payBtn.addEventListener("click", async () => {
  if(!userPublicKey) return alert("Connect Phantom first!");
  const amount = parseFloat(amountInput.value);
  if(!amount || amount <= 0) return alert("Enter valid SOL amount");

  const transaction = new solanaWeb3.Transaction().add(
    solanaWeb3.SystemProgram.transfer({
      fromPubkey: userPublicKey,
      toPubkey: new solanaWeb3.PublicKey(WALLET_ADDRESS),
      lamports: amount * 1e9
    })
  );

  try {
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    console.log("TX sent:", signature);

    // Wait for confirmation
    let confirmed = false;
    let tries = 0;
    while(!confirmed && tries < 20) {
      tries++;
      const txInfo = await connection.getTransaction(signature);
      if(txInfo && txInfo.meta && txInfo.meta.err === null) confirmed = true;
      if(!confirmed) await new Promise(r => setTimeout(r, 3000));
    }

    if(confirmed) launchRocket();
    else alert("Transaction not confirmed");

    await updateWalletStatus();
  } catch(e) {
    console.log(e);
    alert("Transaction failed or rejected");
  }
});
