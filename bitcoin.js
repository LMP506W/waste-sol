const BTC_ADDRESS = "bc1qvmxrmyspaf8259xdgrg77pn504knf3sjal457k";

function openBitcoin() {
    document.getElementById("panel").innerHTML = `
        <p>Send BTC to:</p>
        <p>${BTC_ADDRESS}</p>
        <p><a href="https://mempool.space/address/${BTC_ADDRESS}" target="_blank">View on mempool.space</a></p>
        <p>You will receive nothing.</p>
    `;
}
