const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");
const walletStatus = document.getElementById("walletStatus");
const amountInput = document.getElementById("amount");

const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl("mainnet-beta"),
  "confirmed"
);

let userPublicKey = null;

// --------------------
// Helpers
// --------------------
function hasPhantom() {
  return window.solana && window.solana.isPhantom;
}

function shortKey(pk) {
  return pk.slice(0, 4) + "..." + pk.slice(-4);
}

// --------------------
// Wallet Status
// --------------------
async function updateWalletStatus() {
  if (!userPublicKey) {
    walletStatus.innerText = "Not connected";
    return;
  }
  const balanceLamports = await connection.getBalance(userPublicKey);
  const balanceSOL = (balanceLamports / 1e9).toFixed(4);
  walletStatus.innerText = `Connected: ${balanceSOL} SOL (${shortKey(userPublicKey.toString())})`;
}

// --------------------
// Connect Phantom
// --------------------
connectBtn.addEventListener("click", async () => {
  if (!hasPhantom()) {
    alert("Phantom Wallet not detected.\nOpen this site inside Phantom Browser.");
    return;
  }

  try {
    const resp = await window.solana.connect({ onlyIfTrusted: false });
    userPublicKey = resp.publicKey;
    await updateWalletStatus();
    payBtn.disabled = false;
    connectBtn.innerText = "Wallet Connected";
    connectBtn.disabled = true;
  } catch (err) {
    console.error(err);
    walletStatus.innerText = "Connection rejected";
  }
});

// --------------------
// Waste SOL
// --------------------
payBtn.addEventListener("click", async () => {
  if (!userPublicKey) {
    alert("Connect Phantom first.");
    return;
  }

  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  // ⚠️ VERY IMPORTANT WARNING (UX + Phantom Trust)
  const confirmWaste = confirm(
    `⚠️ WARNING ⚠️\n\nYou are about to send ${amount} SOL.\nThis transaction is REAL and NON-REVERSIBLE.\nThe SOL will be permanently wasted.\n\nDo you want to continue?`
  );

  if (!confirmWaste) return;

  try {
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: new solanaWeb3.PublicKey(WALLET_ADDRESS),
        lamports: Math.floor(amount * 1e9),
      })
    );

    transaction.feePayer = userPublicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature, "confirmed");

    // Success → Rocket
    launchRocket();

    await updateWalletStatus();
  } catch (err) {
    console.error(err);
    alert("Transaction cancelled or failed.");
  }
});

// --------------------
// Rocket Animation
// --------------------
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
    ctx.fillText(countdown > 0 ? countdown : "🚀", canvas.width / 2, canvas.height / 2);
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
      ctx.lineTo(canvas.width / 2 - 15, y + 40);
      ctx.lineTo(canvas.width / 2 + 15, y + 40);
      ctx.closePath();
      ctx.fill();
      y -= 8;
      if (y > -60) requestAnimationFrame(animate);
      else {
        ctx.fillText("SOL WASTED SUCCESSFULLY", canvas.width / 2, canvas.height / 2);
      }
    }
    animate();
  }, 6000);
}
