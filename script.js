// ==================================
// WASTE SOL V1 – Wallet + Black Hole + Level + Mini-Games + KI
// ==================================

const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");
const walletStatus = document.getElementById("walletStatus");
const amountInput = document.getElementById("amount");

// DEINE WALLET
const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

// Solana Connection
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl("mainnet-beta"),
  "confirmed"
);

let userPublicKey = null;
let playerLevel = 0;
let totalWasted = 0;

// ==========================
// Helpers
// ==========================
function isPhantomInstalled() {
  return window.solana && window.solana.isPhantom;
}

function shortKey(pk) {
  return pk.slice(0, 4) + "..." + pk.slice(-4);
}

// ==========================
// Connect Wallet
// ==========================
connectBtn.addEventListener("click", async () => {
  if (!isPhantomInstalled()) {
    alert("Please open this site inside Phantom Wallet browser.");
    return;
  }

  try {
    const resp = await window.solana.connect();
    userPublicKey = resp.publicKey;
    walletStatus.innerText = "Connected: " + shortKey(userPublicKey.toString());
    connectBtn.innerText = "Connected";
    connectBtn.disabled = true;
    payBtn.disabled = false;
  } catch (err) {
    console.error(err);
    walletStatus.innerText = "Connection rejected";
  }
});

// ==========================
// Waste SOL
// ==========================
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

  try {
    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: new solanaWeb3.PublicKey(WALLET_ADDRESS),
        lamports: Math.floor(amount * 1e9),
      })
    );

    tx.feePayer = userPublicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const signedTx = await window.solana.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signedTx.serialize());

    // Warten auf Bestätigung
    await connection.confirmTransaction(signature, "confirmed");

    // Update Stats
    totalWasted += amount;
    playerLevel = Math.floor(totalWasted); // 1 Level pro 1 SOL wasted

    // Trigger Animation / Mini-Games / AI
    triggerBlackHole(amount);
    triggerRandomEvent(amount);
    triggerAIReaction(amount);

  } catch (err) {
    console.error(err);
    alert("Transaction failed or cancelled.");
  }
});

// ==========================
// Black Hole Animation
// ==========================
function triggerBlackHole(amount) {
  const canvas = document.createElement("canvas");
  document.body.innerHTML = "";
  document.body.appendChild(canvas);

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const particleCount = 800 + playerLevel * 50;
  const particles = [];

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

    ctx.beginPath();
    ctx.arc(centerX, centerY, 50 + playerLevel * 2, 0, Math.PI * 2);
    ctx.fillStyle = "#0f0f0f";
    ctx.fill();
    ctx.strokeStyle = "#14f195";
    ctx.lineWidth = 3;
    ctx.stroke();

    particles.forEach(p => {
      const dx = centerX - p.x;
      const dy = centerY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pull = 10 / (dist + 0.1);
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

  // Overlay Text
  setTimeout(() => {
    ctx.fillStyle = "#14f195";
    ctx.font = "bold 72px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${amount} SOL WASTED`, centerX, centerY);
    ctx.fillText(`Level ${playerLevel} achieved!`, centerX, centerY + 100);
  }, 4000);
}

// ==========================
// Random Event Mini-Game
// ==========================
function triggerRandomEvent(amount) {
  const chance = Math.random();
  if (chance < 0.2) {
    alert("🌌 Lucky Event Triggered! Cosmic Glitch!");
    // TODO: weitere Effekte / Mini-Games
  }
}

// ==========================
// AI Feedback / Meme
// ==========================
function triggerAIReaction(amount) {
  const messages = [
    `You just threw ${amount} SOL into the void!`,
    `The black hole devours your coins! Level ${playerLevel} reached!`,
    `🌌 Cosmic chaos! ${amount} SOL gone forever!`,
    `AI says: 'Wasting SOL never felt so good!'`
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  console.log("AI Reaction:", msg);
  // TODO: Overlay Text / Meme auf Canvas oder TTS
}
