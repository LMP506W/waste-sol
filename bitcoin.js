const BTC_ADDRESS = "DEINE_BTC_ADRESSE_HIER";

function openBitcoin() {
    const panel = document.getElementById("panel");
    panel.innerHTML = `
        <p>Send BTC to the address below.</p>
        <p>${BTC_ADDRESS}</p>
        <p>You will receive nothing.</p>
    `;
}
