const SOL_ADDRESS = "DEINE_SOL_ADRESSE_HIER";

async function openSolana() {
    const panel = document.getElementById("panel");
    panel.innerHTML = `
        <p>Connect Phantom to send SOL.</p>
        <button onclick="sendSol()">Connect & Send</button>
    `;
}

async function sendSol() {
    if (!window.solana || !window.solana.isPhantom) {
        alert("Open in Phantom browser.");
        return;
    }

    const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("mainnet-beta"),
        "confirmed"
    );

    const resp = await window.solana.connect();
    const fromPubkey = resp.publicKey;

    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey,
            toPubkey: new solanaWeb3.PublicKey(SOL_ADDRESS),
            lamports: 10000000 // 0.01 SOL example
        })
    );

    transaction.feePayer = fromPubkey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");

    document.getElementById("panel").innerHTML = `
        <p>Transaction confirmed.</p>
        <p>You received nothing.</p>
    `;
}
