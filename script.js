// HUD
const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");
const walletStatus = document.getElementById("walletStatus");
const amountInput = document.getElementById("amount");
const levelCounter = document.getElementById("levelCounter");
const totalWastedDisplay = document.getElementById("totalWasted");

// DEINE WALLET
const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

// Solana Connection
const connection = new solanaWeb3.Connection(
  solanaWeb3.clusterApiUrl("mainnet-beta"),
  "confirmed"
);

let userPublicKey = null;
let selectedWallet = null;
let playerLevel = 0;
let totalWasted = 0;

// Wallets Support
const wallets = {
  Phantom: () => window.solana && window.solana.isPhantom ? window.solana : null,
  Solflare: () => window.solflare && window.solflare.isSolflare ? window.solflare : null,
  Glow: () => window.glow && window.glow.isGlow ? window.glow : null,
  Backpack: () => window.backpack && window.backpack.isBackpack ? window.backpack : null
};

// HUD Update
function updateHUD() {
  levelCounter.innerText = `Level: ${playerLevel}`;
  totalWastedDisplay.innerText = `SOL Wasted: ${totalWasted.toFixed(3)}`;
}

// Short Key
function shortKey(pk) {
  return pk.slice(0, 4) + "..." + pk.slice(-4);
}

// Wallet Connect
connectBtn.addEventListener("click", async () => {
  // Auswahl UI
  const options = Object.keys(wallets);
  let choice = prompt("Choose wallet: " + options.join(", "), "Phantom");
  if (!options.includes(choice)) {
    alert("Invalid wallet selected");
    return;
  }

  const wallet = wallets[choice]();
  if (!wallet) {
    alert(`${choice} Wallet not installed or not accessible in this browser.`);
    return;
  }

  selectedWallet = wallet;

  try {
    const resp = await wallet.connect();
    userPublicKey = resp.publicKey;
    walletStatus.innerText = `${choice} Connected: ${shortKey(userPublicKey.toString())}`;
    connectBtn.innerText = "Connected";
    connectBtn.disabled = true;
    payBtn.disabled = false;
  } catch (err) {
    console.error(err);
    walletStatus.innerText = "Connection rejected";
  }
});

// Waste SOL
payBtn.addEventListener("click", async () => {
  if (!userPublicKey) return alert("Connect wallet first!");
  const amount = parseFloat(amountInput.value);
  if (!amount || amount <= 0) return alert("Enter a valid SOL amount");

  try {
    // Balance Check
    const balance = await connection.getBalance(userPublicKey);
    if (balance < amount * 1e9) {
      alert(`Not enough SOL. You have ${(balance/1e9).toFixed(3)} SOL`);
      return;
    }

    // Prepare TX
    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: new solanaWeb3.PublicKey(WALLET_ADDRESS),
        lamports: Math.floor(amount * 1e9)
      })
    );

    tx.feePayer = userPublicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    // Sign & Send
    const signedTx = await selectedWallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signedTx.serialize());

    // Confirm TX
    await connection.confirmTransaction(signature, "confirmed");

    // Update Stats
    totalWasted += amount;
    playerLevel = Math.floor(totalWasted); // 1 Level pro SOL
    updateHUD();

    // Trigger Animation / Mini-Games / AI
    triggerBlackHole(amount);
    triggerRandomEvent(amount);
    triggerAIReaction(amount);

  } catch (err) {
    console.error(err);

    if (err.message.includes("User rejected")) {
      alert("Transaction rejected by user.");
    } else if (err.message.includes("0 lamports")) {
      alert("Cannot send 0 SOL. Enter a valid amount.");
    } else {
      alert("Transaction failed. Try again later or switch wallet.");
    }
  }
});

// Black Hole Animation (Overlay)
function triggerBlackHole(amount) {
  let canvas = document.getElementById("bhCanvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "bhCanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = 999;
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const particleCount = 500 + playerLevel * 50;
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
    ctx.fillStyle = "rgba(0,0,0,0.2)";
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
    ctx.font = "bold 60px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${amount} SOL WASTED`, centerX, centerY);
    ctx.fillText(`Level ${playerLevel}`, centerX, centerY + 80);
  }, 3000);
}

// Mini-Random Event
function triggerRandomEvent(amount) {
  const chance = Math.random();
  if (chance < 0.2) {
    alert("🌌 Cosmic Glitch! Mini-Event triggered!");
  }
}

// AI Feedback / Meme
function triggerAIReaction(amount) {
  const messages = [
    `You just threw ${amount} SOL into the void!`,
    `The black hole devours your coins! Level ${playerLevel} reached!`,
    `🌌 Cosmic chaos! ${amount} SOL gone forever!`,
    `AI says: 'Wasting SOL never felt so good!'`
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  console.log("AI Reaction:", msg);
}
