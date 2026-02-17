// ===============================
// WASTE SOL – Native Solana Wallet Connect
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
// CONNECT PHANTOM / SOLANA WALLET
// ===============================
connectBtn.addEventListener("click", async () => {
  if (!isPhantomInstalled()) {
    alert("Please open this site inside the Phantom Wallet browser.");
    return;
  }

  try {
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
// Waste SOL – nur bei erfolgreicher TX
// ===============================
payBtn.addEventListener("click", async () => {
  if (!userPublicKey) {
    alert("Connect Phantom first!");
    return;
  }

  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) {
    alert("Enter a valid SOL amount.");
    return;
  }

  const ok = confirm(
    `⚠️ WARNING ⚠️\n\n` +
    `You are about to send ${amount} SOL.\n` +
    `This transaction is REAL and IRREVERSIBLE.\n\n` +
    `Do you want to continue?`
  );

  if (!ok) return;

  try {
    // Transaction erstellen
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

    // TX signieren und senden
    const signedTx = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());

    // Warten auf Bestätigung
    await connection.confirmTransaction(signature, "confirmed");

    // TX erfolgreich → Black Hole Animation starten
    launchBlackHole(amount);

    // Optional: Total Counter
    updateTotalCounter(amount);

  } catch (err) {
    console.error(err);
    alert("Transaction cancelled or failed.");
  }
});

// ===============================
// Black Hole Animation
// ===============================
function launchBlackHole(amount) {
  const canvas = document.createElement("canvas");
  document.body.innerHTML = "";
  document.body.appendChild(canvas);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let particles = [];
  let particleCount = 1000; // für 4K/High Detail

  // Init particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 4 + 1
    });
  }

  function draw() {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Black hole center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fillStyle = "#0f0f0f";
    ctx.fill();
    ctx.strokeStyle = "#14f195";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Particles
    particles.forEach(p => {
      let dx = centerX - p.x;
      let dy = centerY - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      let pull = 10 / (dist + 0.1); // stronger closer
      p.x += dx * 0.01 + Math.cos(p.angle) * p.speed * 0.05;
      p.y += dy * 0.01 + Math.sin(p.angle) * p.speed * 0.05;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "#14f195";
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();

  // Text overlay nach 5 Sekunden
  setTimeout(() => {
    ctx.fillStyle = "#14f195";
    ctx.font = "bold 72px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${amount} SOL WASTED`, centerX, centerY);
    ctx.fillText("BLACK HOLE SUCCESS 🚀", centerX, centerY + 100);
  }, 5000);
}

// ===============================
// Optional: Total SOL Wasted Counter
// ===============================
let totalWasted = 0;
function updateTotalCounter(amount) {
  totalWasted += amount;
  console.log("Total SOL Wasted:", totalWasted.toFixed(3));
}
