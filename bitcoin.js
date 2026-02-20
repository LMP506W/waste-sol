const BTC_ADDRESS = "bc1qvmxrmyspaf8259xdgrg77pn504knf3sjal457k";

function openBitcoin() {
    const amount = prompt("Enter amount in BTC (optional for QR):", "0.0001");
    const url = `bitcoin:${BTC_ADDRESS}?amount=${amount || ""}`;

    document.getElementById("panel").innerHTML = `
        <p>Scan to send BTC</p>
        <div id="qr"></div>
        <p>Estimated fee: 0.000005 BTC</p>
    `;

    new QRCode(document.getElementById("qr"), {
        text: url,
        width: 200,
        height: 200
    });
}
