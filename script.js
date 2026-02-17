// HUD
const connectBtn = document.getElementById("connectBtn");
const payBtn = document.getElementById("payBtn");
const walletStatus = document.getElementById("walletStatus");
const amountInput = document.getElementById("amount");
const levelCounter = document.getElementById("levelCounter");
const totalWastedDisplay = document.getElementById("totalWasted");

// WALLET
const WALLET_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

// Solana Connection
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"), "confirmed");

let userPublicKey = null;
let selectedWallet = null;
let playerLevel = 0;
let totalWasted = 0;

// Wallet Providers
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

// Wallet Connect
connectBtn.addEventListener("click", async () => {
  const options = Object.keys(wallets);
  let choice = prompt("Choose wallet: " + options.join(", "), "Phantom");
  if (!options.includes(choice)) { alert("Invalid wallet"); return; }
  const wallet = wallets[choice]();
  if (!wallet) { alert(`${choice} not installed.`); return; }
  selectedWallet = wallet;
  try {
    const resp = await wallet.connect();
    userPublicKey = resp.publicKey;
    walletStatus.innerText = `${choice} Connected`;
    connectBtn.disabled = true;
    payBtn.disabled = false;
  } catch (err) { console.log(err); walletStatus.innerText = "Connection rejected"; }
});

// Waste SOL
payBtn.addEventListener("click", async () => {
  if (!userPublicKey) return alert("Connect wallet first!");
  const amount = parseFloat(amountInput.value);
  if (!amount || amount<=0) return alert("Enter valid amount");

  try {
    const balance = await connection.getBalance(userPublicKey);
    if (balance < amount*1e9) { alert(`Not enough SOL. Balance: ${(balance/1e9).toFixed(3)}`); return; }

    const tx = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: new solanaWeb3.PublicKey(WALLET_ADDRESS),
        lamports: Math.floor(amount*1e9)
      })
    );
    tx.feePayer = userPublicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const signedTx = await selectedWallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature,"confirmed");

    // Update Stats
    totalWasted += amount;
    playerLevel = Math.floor(totalWasted);
    updateHUD();

    // Trigger Effects
    triggerBlackHole(amount);
    triggerRandomEvent(amount);
    triggerAIReaction(amount);
    generateSocialShare(amount);

  } catch(err) {
    console.log(err);
    if(err.message.includes("User rejected")) alert("Transaction rejected");
    else alert("Transaction failed. Try again later.");
  }
});

// Black Hole Animation
function triggerBlackHole(amount) {
  let canvas = document.getElementById("bhCanvas");
  if(!canvas) { canvas = document.createElement("canvas"); canvas.id="bhCanvas"; canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.position="fixed"; canvas.style.top=0; canvas.style.left=0; canvas.style.zIndex=999; canvas.style.pointerEvents="none"; document.body.appendChild(canvas); }
  const ctx = canvas.getContext("2d");
  const centerX=canvas.width/2, centerY=canvas.height/2;
  const particleCount = 500 + playerLevel*50;
  const particles = [];
  for(let i=0;i<particleCount;i++){particles.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, size:Math.random()*2+1, angle:Math.random()*2*Math.PI, speed:Math.random()*4+1});}
  function draw(){ctx.fillStyle="rgba(0,0,0,0.2)"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.beginPath(); ctx.arc(centerX,centerY,50+playerLevel*2,0,2*Math.PI); ctx.fillStyle="#0f0f0f"; ctx.fill(); ctx.strokeStyle="#14f195"; ctx.lineWidth=3; ctx.stroke(); particles.forEach(p=>{const dx=centerX-p.x; const dy=centerY-p.y; const dist=Math.sqrt(dx*dx+dy*dy); p.x+=dx*0.01+Math.cos(p.angle)*p.speed*0.05; p.y+=dy*0.01+Math.sin(p.angle)*p.speed*0.05; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,2*Math.PI); ctx.fillStyle="#14f195"; ctx.fill();}); requestAnimationFrame(draw);}
  draw();
  setTimeout(()=>{ctx.fillStyle="#14f195"; ctx.font="bold 60px monospace"; ctx.textAlign="center"; ctx.fillText(`${amount} SOL WASTED`,centerX,centerY); ctx.fillText(`Level ${playerLevel}`,centerX,centerY+80);},3000);
}

// Random Mini Event
function triggerRandomEvent(amount){
  const chance=Math.random();
  if(chance<0.2){alert("🌌 Cosmic Glitch! Mini-Event triggered!");}
}

// AI Meme Feedback
function triggerAIReaction(amount){
  const msgs=[
    `You just threw ${amount} SOL into the void!`,
    `Level ${playerLevel}: The black hole devours your coins!`,
    `🌌 Cosmic chaos! ${amount} SOL gone forever!`,
    `AI says: 'Wasting SOL never felt so good!'`
  ];
  console.log(msgs[Math.floor(Math.random()*msgs.length)]);
}

// Social Share Placeholder
function generateSocialShare(amount){
  console.log(`Share this: ${amount} SOL wasted, Level ${playerLevel} 🚀`);
}
