const ETH_ADDRESS = "0x2456d6Be3F655Ee9c79b404B1B1431b89dF32E7f";

function openEthereum() {
    const amount = prompt("Enter amount in ETH (optional for QR):", "0.001");
    const url = `ethereum:${ETH_ADDRESS}?value=${ethers.parseEther(amount || "0.001")}`;

    document.getElementById("panel").innerHTML = `
        <p>Scan to send ETH</p>
        <div id="qr"></div>
        <p>Estimated fee: ~0.002 ETH</p>
    `;

    new QRCode(document.getElementById("qr"), {
        text: url,
        width: 200,
        height: 200
    });
}
