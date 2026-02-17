// ===============================
// WASTE SOL – Phantom Safe Script
// ===============================

const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");
const walletStatus = document.getElementById("walletStatus");
const amountInput = document.getElementById("amount");

// DEINE WALLET ADRESSE
const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

// Solana Connection
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl("mainnet-beta"),
  "confirmed"
);

let userPublicKey = null;

// ===============================
// Helpers
// ===============================
function isPhantomInstalled() {
  return window.solana && window.solana.isPhantom;
}

function shortKey(pk) {
  return pk.slice(0, 4) + "..." + pk.slice(-4);
}

// ===============================
// CONNECT PHANTOM (NO OPTIONS)
// ===============================
connectBtn.addEventListener("click", async () => {
  if (!isPhantomInstalled()) {
    alert("Please open this site inside the Phantom Wallet browser.");
    return;
  }

  try {
    // WICHTIG: KEINE Optionen!
    const resp = await window.solana.connect();
    userPublicKey = resp.publicKey;

    walletStatus.innerText =
      "Connected: " + shortKey(userPublicKey.toString());

    connectBtn.innerText = "Connected";
    connectBtn.disabled = true;
    payBtn.disabled = false;
  } catch (err) {
    console.error(err);
    walletStatus.innerText = "Connection rejected";
  }
});

// ===============================
// WASTE SOL (TX STEP)
// ===============================
payBtn.addEventListener("click", async () => {
  if (!userPublicKey) {
    alert("Connect Phantom Wallet first.");
    return;
  }

  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  // ⚠️ USER WARNING (EXTREM WICHTIG)
  const ok = confirm(
    `⚠️ WARNING ⚠️\n\n` +
    `You are about to send ${amount} SOL.\n` +
    `This transaction is REAL and IRREVERSIBLE.\n` +
    `The SOL will be permanently wasted.\n\n` +
    `Do you want to continue?`
  );

  if (!ok) return;

  try {
    // Create Transaction
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

    // Sign & Send
    const signedTx = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(
      signedTx.serialize()
    );

    await connection.confirmTransaction(signature, "confirmed");

    // SUCCESS → ROCKET
    launchRocket();
  } catch (err) {
    console.error(err);
    alert("Transaction cancelled or failed.");
  }
});

// ===============================
// ROCKET ANIMATION (AFTER TX ONLY)
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
          "SOL WASTED SUCCESSFULLY",
          canvas.width / 2,
          canvas.height / 2
        );
      }
    }

    animate();
  }, 6000);
}
