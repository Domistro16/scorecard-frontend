# Safucard

Safucard is a React-based decentralized application (dApp) that allows users to input their wallet address and receive a customized visual "SafuCard" scorecard. Users can optionally mint their SafuCard as an NFT to commemorate or showcase their on-chain profile.

---

## Features

* 🔌 Web3 wallet integration (via RainbowKit and wagmi)
* 📈 Fetches custom scorecard data from SafuServer's API
* 🎨 Renders a personalized canvas image using Fabric.js
* 🖼️ Downloads or fullscreen preview of generated SafuCard
* 🌐 Uploads assets to IPFS via backend proxy (Pinata)
* 🪙 Mints NFT with on-chain metadata and real-time price feeds

---

## Tech Stack

* **Frontend:** React, TypeScript, TailwindCSS
* **Web3:** wagmi, RainbowKit, ethers
* **Canvas:** fabric.js
* **Backend API:** Axios (external URL via `.env`)
* **Smart Contract:** Ethereum-compatible contract with minting function

---

## Getting Started

### Prerequisites

* Node.js v18+
* A wallet (e.g. MetaMask)
* An API endpoint (for score data and Pinata uploads)
* Deployed NFT Contract Address and ABI

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root with the following:

```env
VITE_API_URL=
```

### Run Locally

```bash
npm run dev
```

---

## Usage

1. Connect your Web3 wallet using the **Connect Wallet** button.
2. Enter your BNB wallet address in the input field.
3. Click **Search** to fetch scorecard data and generate your SafuCard.
4. Click **Download** or **Fullscreen** to preview or save the image.
5. Optionally, click **Mint NFT** to upload to IPFS and mint the card as an NFT.

---

## Smart Contract

* **Address:** `0x2B20F646CEdB8D40f2a37358A3b712ced3D5B294`
* **Function Used:** `mintNFT(tokenURI)`
* **Value Calculation:** Based on price feed (5 USD in native token)

---

## File Structure

```
src/
├── App.tsx              # Main component with logic and UI
├── contract-abi.json    # ABI for NFT minting contract
├── price-abi.json       # ABI for Chainlink price feed
├── App.css              # Styling
public/
├── token.jpg            # Background image
├── <status>.png         # Dynamic image overlays by status
```

---

## Dependencies

* [React](https://reactjs.org/)
* [wagmi](https://wagmi.sh/)
* [RainbowKit](https://www.rainbowkit.com/)
* [fabric.js](http://fabricjs.com/)
* [axios](https://axios-http.com/)
* [TailwindCSS](https://tailwindcss.com/)

---

## License

This project is licensed under the MIT License.

---

## Author

**Desmond Egwurube**

---

## Notes

* Make sure your smart contract is deployed and funded.
* Backend must handle Pinata upload endpoints securely.
* This project uses Chainlink's price feeds for pricing NFT mint.
