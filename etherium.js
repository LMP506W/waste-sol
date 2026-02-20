const ETH_ADDRESS = "DEINE_ETH_ADRESSE_HIER";

async function openEthereum() {
    const panel = document.getElementById("panel");
    panel.innerHTML = `
        <p>Connect MetaMask to send ETH.</p>
        <button onclick="sendEth()">Connect & Send</button>
    `;
}

async function sendEth() {
    if (!window.ethereum) {
        alert("Install MetaMask.");
        return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tx = await signer.sendTransaction({
        to: ETH_ADDRESS,
        value: ethers.parseEther("0.001")
    });

    await tx.wait();

    document.getElementById("panel").innerHTML = `
        <p>Transaction confirmed.</p>
        <p>You received nothing.</p>
    `;
}
