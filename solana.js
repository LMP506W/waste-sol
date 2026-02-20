const SOL_ADDRESS = "7MSqi82KXWjEGvRP4LPNJLuGVWwhs7Vcoabq85tm8G3a";

function openSolana() {
    const amount = prompt("Enter amount in SOL (optional for QR):", "0.01");
    const url = `solana:${SOL_ADDRESS}?amount=${amount || ""}`;
    
    document.getElementById("panel").innerHTML = `
        <p>Scan to send SOL</p>
        <div id="qr"></div>
        <p>Estimated fee: 0.000005 SOL</p>
    `;

    new QRCode(document.getElementById("qr"), {
        text: url,
        width: 200,
        height: 200
    });
}
