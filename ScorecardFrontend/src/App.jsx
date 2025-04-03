import { useEffect, useState, useRef, use } from 'react'
import './App.css'
import { createCanvas, loadImage, registerFont } from 'canvas';
import axios from 'axios'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useSendTransaction, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { GoDownload } from "react-icons/go";
import { GoScreenFull } from "react-icons/go";
import contractABI from '../contract-abi.json';



const contractAddress = "0x000CBc0A2661999f4AaD5A850d756Cce6182bba3";


function App() {
  const [address, setAddress] = useState('')
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [status, setStatus] = useState(false)
  const [count, setCount] = useState(0)
  const [cat, setCat] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMessage, setLoadingMessage] = useState("");
  const [donated, setDonated] = useState(false)
  const [src, setImg] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const { data: hash, writeContract } = useWriteContract();
  const { data: hashe, isPending, sendTransaction } = useSendTransaction();



  const imageSrc = "/token.jpg"; // Replace with actual path


  const handleChange = (event) => {
    setAddress(event.target.value)
  }
  const account = useAccount();
  useEffect(() => { 
    if (account.isConnected) {
      setAddress(account.address);
    }
  }, [account]);

  async function getBNBForUSD(usdAmount = 5) {
    try {
      // Fetch BNB/USD price
      const response = await axios.get("https://api.g.alchemy.com/prices/v1/docs-demo/tokens/by-symbol?symbols=BNB");
      const bnbPrice = response.data.data[0]?.prices[0]?.value;
  
      // Calculate BNB equivalent for $5
      const bnbAmount = usdAmount / bnbPrice;

      return bnbAmount;
    } catch (error) {
      console.error("Error fetching BNB price:", error.message);
    }
  }
   

 
  const generateImage = async (first, last, status, count, cat) => {
    const f = address.slice(0, 4);
    const l = address.slice(-4);
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");


    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous"; // Prevent CORS issues
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#fff"; // Gold color

      // Adding text
      ctx.rotate(-Math.PI / 14);
      ctx.fillText(first, 160, 345);
      ctx.fillText(last, 160, 410);
      ctx.fillText(count, 560, 480); // Placed under Tx Count

      ctx.fillStyle = "#FFD700"
      ctx.fillText(`${f}...${l}`, 290, 473);
      ctx.fillStyle = "#fff";
      ctx.rotate(-Math.PI / 4)
      ctx.font = "bold 30px Arial";
      ctx.fillText(cat, 0, 540);


      // Adding fish image
      ctx.rotate(Math.PI / 4)
      const fishImage = new Image();
      const fishImageSrc =
      `./${status}.png`;
  
      fishImage.src = fishImageSrc;
      fishImage.crossOrigin = "anonymous"; // Prevent CORS issues
     
      fishImage.onload = () => {
        ctx.drawImage(fishImage, 530, 300, 100, 100);
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.fillText(status, 540, 290 )

        // Convert canvas to image and update state
        setImg(canvas.toDataURL("image/png"));
        canvas.toBlob((blob) => {
          const file = new File([blob], "MySafuScorecard.png", { type: "image/jpg" });
          setSelectedFile(file);
      }, "image/jpg");
      };
    };

    
   

  }
  const downloadCanvas = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = "My_Safuscorecard.jpg";
    link.click();
    }

  const calculate = async () => {

    try {
  
    if (!address.trim()) {
      setError("Address cannot be empty!");
      return;
    }
  
    setLoading(true);
    setError("");
    setLoadingMessage("Interacting with API...");
  
      const response = await axios(`https://tipper-server.onrender.com/api/address/${address.toLowerCase()}`);
      
      setLoadingMessage("Getting scores...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating delay
  
      await generateImage(response.data.first, response.data.last, response.data.status, response.data.count, response.data.user);
      setLoadingMessage("Finalizing...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating delay
      setStatus(true);
    } catch (err) {
      setError("Failed to fetch data. Please try again!");
      console.error(err)
    } finally {
      setLoading(false);
    }
  };

  const donate = async () => {
    setLoading(true);
    setLoadingMessage("Processing donation...");

    const amount = 0.01; // Amount in BNB
    const bnbAmount = getBNBForUSD(amount);

    setLoadingMessage("Creating Transaction...");
    const to = "0xYourWalletAddress"; // Replace with your wallet address
    const value = bnbAmount.toString();
    setLoadingMessage("Initializing...");
    sendTransaction({ to, value: parseEther(value) })
    setLoadingMessage("Done...");
    setLoading(false);
    setDonated(true);
  }
  const reset = () => {
    setAddress('');
    setStatus(false);
    setDonated(false)
  }
  const imgRef = useRef(null);

  const openFullScreen = () => {
    if (imgRef.current.requestFullscreen) {
      imgRef.current.requestFullscreen();
    } else if (imgRef.current.webkitRequestFullscreen) {
      imgRef.current.webkitRequestFullscreen();
    } else if (imgRef.current.mozRequestFullScreen) {
      imgRef.current.mozRequestFullScreen();
    } else if (imgRef.current.msRequestFullscreen) {
      imgRef.current.msRequestFullscreen();
    }
  };

 
const pinToIPFS = async (file) => {
  try {
      const formData = new FormData();
      formData.append("file", file); // Attach the file

      const upload = await axios.post(
          "https://tipper-server.onrender.com/api/nft/upload",
          formData,
          {
              headers: {
                  "Content-Type": "multipart/form-data",
              },
          }
      );

      const url = upload.data.url;
      return { success: true, pinataUrl: url };
  } catch (error) {
      return { success: false, message: error.message };
  }


  }
  const mintNFT = async() => {

    let url = "";
    //error handling
   
    console.log('minting')
     try{
        const url = await pinToIPFS(selectedFile)
        url = upload.data.url
     }catch(error){
         return {
             success: false,
             status: "😢 Something went wrong while uploading your image.",
         }
     }  
     //make metadata
     const metadata = new Object();
     metadata.name = `SafuScorecard`;
     metadata.image = url;
     metadata.description = `${address} SafuScorecard`;
   
     //make pinata call
     const pinataResponse = await pinToIPFS(metadata);
     if (!pinataResponse.success) {
         return {
             success: false,
             status: "😢 Something went wrong while uploading your tokenURI.",
         }
     } 
     const tokenURI = pinataResponse.pinataUrl;  
     try{

     writeContract({
      abi: contractABI,
      functionName: 'mintNFT',
      address: contractAddress,
      args: [tokenURI],
     })

     return {
      success: true,
      status: "✅ NFT minted successfully!",
  }
    }catch(error){
      return {
        success: false,
        status: "😢 Something went wrong while minting your NFT.",
      }
    }
      
   }
  return (
      
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 justify-center items-center p-6">
      <div className='absolute top-0 right-0 p-4'>
      <ConnectButton showBalance={true}/>
      </div>
    {status && (
      <div className="">

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Success! Here's your Very Own SafuScorecard</h3>
        {/* <p className="text-gray-700 dark:text-gray-300"><strong>First:</strong> {first}</p>
        <p className="text-gray-700 dark:text-gray-300"><strong>Last:</strong> {last}</p>
        <p className="text-gray-700 dark:text-gray-300"><strong>Status:</strong> {status}</p>
        <p className="text-gray-700 dark:text-gray-300"><strong>Count:</strong> {count}</p>
        <p className="text-gray-700 dark:text-gray-300"><strong>Category:</strong> {cat}</p> */}

        <div className="mt-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg h-80 w-160 relative">
          <img
            ref={imgRef}
            src={src}
            alt="Generated"
            className='h-80 absolute w-160'
          >
          </img>
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg h-80 w-160 opacity-0 absolute flex space-x-10 justify-center items-center text-white opacity-0 transition-all ease-in-out hover:opacity-50 duration-300 ">
          <button className='text-5xl cursor-pointer' type='submit' onClick={downloadCanvas}><GoDownload /></button>
          <button className='text-5xl cursor-pointer' onClick={openFullScreen}><GoScreenFull /></button>
        </div>
        </div>
        {!donated ?
        <div className='text-center mt-6 text-gray-900 dark:text-gray-300'>
            <p>Do you like this result? Click the button below if you will like to mint this as an NFT</p>
            <button className='mt-6 h-15 w-35 p-4 bg-orange-400 rounded-full hover:bg-orange-700 cursor-pointer transition-all ' onClick={async () => await mintNFT() }>
                Mint NFT
            </button>
        </div>
        : <div className='text-center mt-6 text-gray-900 dark:text-gray-300 flex flex-col'>
        <p className="text-green-400 mt-5">Donation received. Thank you</p>
        <button className='mt-6 bg-blue-400 p-4 rounded-lg cursor-pointer hover:bg-blue-800 w-100 mx-auto' onClick={reset}>
            Wanna get a new scorecaard?
        </button>
    </div>}
      </div>
    )}
    {!status && (
      <div className='w-screen flex flex-col items-center justify-center'>
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 text-center">
        SafuToken Scorecard
      </h1>
      <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-6">
        Enter your address to get your special SafuScorecard
      </h2>
      <form 
        className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 lg:w-3/4 mx-auto"
        onSubmit={async (event) => {
          event.preventDefault();
          await calculate();
        }}
        
      >
        <input
          placeholder="Wallet Address"
          className="w-full p-3 lg:text-xl border rounded-lg focus:ring outline-none focus:ring-blue-300 dark:bg-gray-800 dark:text-white"
          value={address}
          onChange={handleChange}
        />
        <button
          className="bg-blue-500 text-white px-5 py-3 lg:text-xl rounded-lg hover:bg-blue-600 disabled:bg-gray-400 cursor-pointer"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
      </div>
    )
}
      {error && <p className="text-red-500 mt-3">{error}</p>}

     {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 opacity-99 z-50">
        <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
          <p className="text-white text-xl font-semibold">{loadingMessage}</p>
        </div>
      )}


      {/* Results Section */}
      
    </div>
  )
}

export default App
