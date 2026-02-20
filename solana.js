const SOL_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

let solConnection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("mainnet-beta"),
    "confirmed"
);

function openSolana() {
    document.getElementById("panel").innerHTML = `
        <p>Amount in SOL</p>
        <input type="number" id="solAmount" step="0.001" placeholder="0.01">
        <br>
        <button onclick="sendSol()">Connect & Send</button>
    `;
}

async function sendSol() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("Open in Phantom.");
        return;
    }

    const amount = parseFloat(document.getElementById("solAmount").value);
    if (!amount || amount <= 0) {
        alert("Enter valid amount.");
        return;
    }

    const resp = await window.solana.connect();
    const fromPubkey = resp.publicKey;

    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey,
            toPubkey: new solanaWeb3.PublicKey(SOL_ADDRESS),
            lamports: Math.floor(amount * 1e9)
        })
    );

    transaction.feePayer = fromPubkey;
    const { blockhash } = await solConnection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await solConnection.confirmTransaction(signature, "confirmed");

    document.getElementById("panel").innerHTML = `
        <p>Transaction confirmed.</p>
        <p><a href="https://solscan.io/tx/${signature}" target="_blank">View on Solscan</a></p>
        <p>You received nothing.</p>
    `;
}
