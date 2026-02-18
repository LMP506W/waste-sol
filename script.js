// ===============================
// WASTE SOL – FINAL STABLE SCRIPT
// ===============================

const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");
const walletStatus = document.getElementById("walletStatus");
const amountInput = document.getElementById("amount");

const warningBox = document.getElementById("warningBox");
const confirmWasteBtn = document.getElementById("confirmWaste");
const cancelWasteBtn = document.getElementById("cancelWaste");

const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl("mainnet-beta"),
  "confirmed"
);

let userPublicKey = null;
let pendingAmount = null;

// -------------------------------
// Helpers
// -------------------------------
function hasPhantom() {
  return window.solana && window.solana.isPhantom;
}

function shortKey(pk) {
  return pk.slice(0, 4) + "..." + pk.slice(-4);
}

async function updateWalletStatus() {
  if (!userPublicKey) {
    walletStatus.innerText = "Wallet not connected";
    return;
  }
  const lamports = await connection.getBalance(userPublicKey);
  const sol = (lamports / 1e9).toFixed(4);
  walletStatus.innerText = `Connected: ${sol} SOL (${shortKey(userPublicKey.toString())})`;
}

// -------------------------------
// Connect Phantom (SAFE)
// -------------------------------
connectBtn.addEventListener("click", async () => {
  if (!hasPhantom()) {
    alert("Phantom Wallet not detected.\nPlease open this site in the Phantom browser.");
    return;
  }

  try {
    const resp = await window.solana.connect({ onlyIfTrusted: false });
    userPublicKey = resp.publicKey;
    await updateWalletStatus();

    connectBtn.innerText = "Wallet Connected";
    connectBtn.disabled = true;
    payBtn.disabled = false;
  } catch (err) {
    console.error(err);
    walletStatus.innerText = "Connection cancelled";
  }
});

// -------------------------------
// Waste Button → Show Warning
// -------------------------------
payBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);

  if (!userPublicKey) {
    alert("Connect your wallet first.");
    return;
  }

  if (!amount || amount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  pendingAmount = amount;
  warningBox.classList.remove("hidden");
});

// -------------------------------
// Cancel Warning
// -------------------------------
cancelWasteBtn.addEventListener("click", () => {
  pendingAmount = null;
  warningBox.classList.add("hidden");
});

// -------------------------------
// Confirm & Send Transaction
// -------------------------------
confirmWasteBtn.addEventListener("click", async () => {
  if (!pendingAmount || !userPublicKey) return;

  warningBox.classList.add("hidden");

  try {
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: new solanaWeb3.PublicKey(WALLET_ADDRESS),
        lamports: Math.floor(pendingAmount * 1e9),
      })
    );

    transaction.feePayer = userPublicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // ✅ MOST STABLE WAY (Mobile + Desktop)
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");

    launchRocket();

    await updateWalletStatus();
  } catch (err) {
    console.error(err);
    alert("Transaction cancelled or failed.");
  } finally {
    pendingAmount = null;
  }
});

// -------------------------------
// Rocket Animation (NON-BLOCKING)
// -------------------------------
function launchRocket() {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.background = "#0b0b0b";
  canvas.style.zIndex = "9999";

  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let countdown = 5;

  const countdownInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#14f195";
    ctx.font = "bold 64px monospace";
    ctx.textAlign = "center";
    ctx.fillText(countdown > 0 ? countdown : "🚀", canvas.width / 2, canvas.height / 2);
    countdown--;
    if (countdown < 0) clearInterval(countdownInterval);
  }, 1000);

  setTimeout(() => {
    let y = canvas.height;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#14f195";
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, y);
      ctx.lineTo(canvas.width / 2 - 12, y + 35);
      ctx.lineTo(canvas.width / 2 + 12, y + 35);
      ctx.closePath();
      ctx.fill();

      y -= 7;

      if (y > -60) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText("SOL WASTED SUCCESSFULLY", canvas.width / 2, canvas.height / 2);
      }
    }

    animate();
  }, 6000);
}
