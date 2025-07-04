import React, { useEffect, useState, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWriteContract, useReadContract } from "wagmi";
import { GoDownload, GoScreenFull } from "react-icons/go";
import axios from "axios";
import contractABI from "../contract-abi.json";
import priceABI from "../price-abi.json";
import "./App.css";
import * as fabric from "fabric";

interface TextBox {
  x: number;
  y: number;
  width: number;
  align: "left" | "center" | "right";
  size: number;
  color?: string;
}

const contractAddress = "0x2B20F646CEdB8D40f2a37358A3b712ced3D5B294";
interface Metadata {
  name: string;
  description: string;
  image: string;
}
interface ApiResponse {
  first: string;
  last: string;
  status: string;
  count: string;
  user: string;
}

type LatestRoundData = [
  roundId: bigint, // roundId
  answer: bigint, // answer (e.g., price * 1e8)
  startedAt: bigint, // startedAt (timestamp)
  updatedAt: bigint, // updatedAt (timestamp)
  answeredInRound: bigint // answeredInRound
];

const App: React.FC = () => {
  const [address, setAddress] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [donated, setDonated] = useState<boolean>(false);
  const [src, setImg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { data, isPending, writeContractAsync } = useWriteContract();
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null); // New ref for fabric instance
  const account = useAccount();
  const { data: priceData } = useReadContract({
    abi: priceABI,
    functionName: "latestRoundData",
    address: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
    args: [],
  });

  useEffect(() => {
    if (account.isConnected) {
      setAddress(account.address || "");
    }
  }, [account]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };
  useEffect(() => {
    const canvasEl = canvasRef.current;
    console.log("canvasEl", canvasEl);
    const gencanvas = new fabric.Canvas(canvasEl as HTMLCanvasElement);
    console.log("canvas", gencanvas);
    gencanvas.width = 500;
    gencanvas.height = 500;
    fabricCanvasRef.current = gencanvas; // Store in ref

    return () => {
      gencanvas.dispose();
    };
  }, [canvasRef]);

  const generateImage = async (
    first: string,
    last: string,
    status: string,
    count: string,
    cat: string
  ) => {
    const f = address.slice(0, 4);
    const l = address.slice(-4);
    const canvas = fabricCanvasRef.current;

    console.log(first, last, status, count, cat);
    if (!canvas) return;
    canvas.clear();
    const boxes = {
      holder: {
        x: 0.37,
        y: 0.22,
        width: 0.3,
        align: "left",
        size: 18,
      } as TextBox,
      tx: {
        x: 0.68,
        y: 0.225,
        width: 0.22,
        align: "left",
        size: 14,
      } as TextBox,
      first: {
        x: 0.51,
        y: 0.443,
        width: 0.11,
        align: "left",
        size: 10,
      } as TextBox,
      last: {
        x: 0.67,
        y: 0.443,
        width: 0.11,
        align: "right",
        size: 10,
      } as TextBox,
      tag: {
        x: 0.49,
        y: 0.59,
        width: 0.3,
        align: "center",
        size: 24,
        color: "#FFD700",
      } as TextBox,
      unknown: {
        x: 0.56,
        y: 0.788,
        width: 0.15,
        align: "center",
        size: 10,
        color: "#FFD700",
      } as TextBox,
    };

    const addText = (
      text: string,
      box: {
        x: number;
        y: number;
        width: number;
        align: "left" | "center" | "right";
        size: number;
        color?: string;
      }
    ) => {
      const absWidth = box.width * 500;
      console.log("absWidth", absWidth);
      console.log(text);
      console.log(box);
      const txt = new fabric.Textbox(text.toString(), {
        fontSize: box.size,
        fill: box.color || "#fff",
        fontWeight: "bold",
        fontFamily: "Arial",
        textAlign: box.align,
        width: absWidth,
        selectable: false,
      });

      txt.set({
        left: box.x * 500,
        top: box.y * 500,
      });
      console.log("txt", txt);
      canvas.add(txt);
      canvas.renderAll();
    };

    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.src = "/token.jpg";
    bgImg.onload = () => {
      console.log(bgImg);
      const bg = new fabric.FabricImage(bgImg, {
        originX: "left",
        originY: "top",
        scaleX: 500 / bgImg.width,
        scaleY: 500 / bgImg.height,
        selectable: false,
      });
      console.log(bg);
      canvas.backgroundImage = bg;
      canvas.renderAll();
      console.log(bg);
      Object.entries(boxes).forEach(([key, box]) => {
        const textMap: Record<string, string> = {
          holder: `${f}...${l}`,
          tx: count,
          first: first !== 'null' ? first : "NONE",
          last: last !== 'null' ? last : "NONE",
          tag: status,
          unknown: cat,
        };
        console.log("key", textMap[key]);
        addText(textMap[key], box);
      });

      const fishImgEl = new Image();
      fishImgEl.crossOrigin = "anonymous";
      fishImgEl.src = `./${status}.png`;
      fishImgEl.onload = () => {
        const fish = new fabric.FabricImage(fishImgEl, {
          left: 80,
          top: 200,
          scaleX: 160 / fishImgEl.width,
          scaleY: 240 / fishImgEl.height,
          selectable: false,
        });
        canvas.add(fish);
        canvas.renderAll();
        setImg(canvas.toDataURL({ format: "jpeg", multiplier: 2 }));
        canvas.getElement().toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "MySafucard.png", {
              type: "image/png",
            });
            setSelectedFile(file);
          }
        }, "image/png");
      };
    };
  };

  const downloadCanvas = () => {
    const link = document.createElement("a");
    link.href = src!;
    link.download = "My_Safucard.jpg";
    link.click();
  };

  const calculate = async () => {
    try {
      if (!address.trim()) {
        setError("Address cannot be empty!");
        return;
      }

      setLoading(true);
      setError("");
      setLoadingMessage("Interacting with API...");

      console.log(import.meta.env.VITE_API_URL);
      const response = await axios.get<ApiResponse>(
        `${import.meta.env.VITE_API_URL}/api/address/${address.toLowerCase()}`
      );

      setLoadingMessage("Getting scores...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await generateImage(
        response.data.first,
        response.data.last,
        response.data.status,
        response.data.count,
        response.data.user
      );
      setLoadingMessage("Finalizing...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus(true);
    } catch (err) {
      setError("Failed to fetch data. Please try again!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAddress("");
    setStatus(false);
    setDonated(false);
  };

  const openFullScreen = () => {
    if (imgRef.current) {
      if (imgRef.current.requestFullscreen) {
        imgRef.current.requestFullscreen();
      } else if (imgRef.current.requestFullscreen) {
        imgRef.current.requestFullscreen();
      } else if (imgRef.current.requestFullscreen) {
        imgRef.current.requestFullscreen();
      } else if (imgRef.current.requestFullscreen) {
        imgRef.current.requestFullscreen();
      }
    }
  };

  const pinToIPFS = async (
    file: File | null,
    data: any | null,
    metadata: boolean
  ) => {
    try {
      if (metadata == false) {
        console.log("Uploading file to Pinata...");
        const formData = new FormData();
        if (file) {
          formData.append("file", file); // Attach the file as a Blob
        } else {
          throw new Error("File is null and cannot be uploaded.");
        }

        const upload = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/nft/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const url = upload.data.url;

        return { success: true, pinataUrl: url };
      } else {
        const upload = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/nft/uploadMetadata`,
          data
        );

        const url = upload.data.url;
        return { success: true, pinataUrl: url };
      }
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
  const mintNFT = async () => {
    let url = "";
    //error handling
    setLoading(true);
    setLoadingMessage("Uploading Image...");
    console.log("minting");
    try {
      const res = await pinToIPFS(selectedFile!, null, false);

      url = res.pinataUrl;
    } catch (error) {
      return {
        success: false,
        status: "😢 Something went wrong while uploading your image.",
      };
    }
    //make metadata
    setLoadingMessage("Uploading MetaData...");
    const metadata: Metadata = {
      name: `Safucard`,
      image: url,
      description: `${address}'s Safucard`,
    };

    //make pinata call
    const pinataResponse = await pinToIPFS(null, metadata, true);
    if (!pinataResponse.success) {
      return {
        success: false,
        status: "😢 Something went wrong while uploading your tokenURI.",
      };
    }
    const tokenURI = pinataResponse.pinataUrl;
    try {
      const [, answer, , ,] = priceData as LatestRoundData;
      console.log(answer);
      const price = BigInt(answer); // 8 decimals
      const usd = BigInt(5 * 1e18); // 5 USD in 18 decimals

      const nativeValue = (usd * BigInt(1e8)) / price; // result in 18 decimals
      setLoadingMessage("Minting Your SafuCard...");
      await writeContractAsync({
        abi: contractABI,
        functionName: "mintNFT",
        address: contractAddress,
        args: [tokenURI],
        value: nativeValue,
      });

      setDonated(true);
      setLoading(false);
      return {
        success: true,
        status: "✅ NFT minted successfully!",
      };
    } catch (error) {
      console.log(error);
      setLoading(false);
      setDonated(false);
      return {
        success: false,
        status: "😢 Something went wrong while minting your NFT.",
      };
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 justify-center items-center p-2 md:p-6">
      <div className="absolute top-0 right-2 md:p-4 pt-2">
        <ConnectButton showBalance={true} />
      </div>
      {status && (
        <div className="flex-col items-center justify-center w-full mx-auto ounded-lg shadow-lg mt-5">
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
            Success! Here's your Very Own SafuScorecard
          </h3>
          <div className="mt-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg h-72 w-72 md:h-95 md:w-95 relative mx-auto">
            <img
              src={src as string}
              ref={imgRef}
              className="h-72 w-72 md:h-95 md:w-95 absolute"
            />
            <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg h-72 w-72 md:h-95 md:w-95 opacity-0 absolute flex space-x-10 justify-center items-center text-white opacity-0 transition-all ease-in-out hover:opacity-50 duration-300 ">
              <button
                className="text-5xl cursor-pointer"
                type="submit"
                onClick={downloadCanvas}
              >
                <GoDownload />
              </button>
              <button
                className="text-5xl cursor-pointer"
                onClick={openFullScreen}
              >
                <GoScreenFull />
              </button>
            </div>
          </div>
          {!donated ? (
            <div className="text-center mt-6 text-gray-900 dark:text-gray-300 items-center flex flex-col">
              <p>
                Now go flex your SAFU Card on X... Or mint as an for something
                more REDACTED
              </p>
              <div className="flex flex-col lg:flex-row items-center mx-auto">
                <button
                  className="mt-6 h-15 font-semibold w-35 p-4 bg-orange-700 rounded-full hover:bg-orange-800 cursor-pointer transition-all "
                  onClick={async () => await mintNFT()}
                  disabled={isPending || account.isDisconnected || loading}
                >
                  Mint NFT
                </button>
                <button
                  className="mt-6 lg:ml-6 font-semibold bg-blue-600 p-4 rounded-full cursor-pointer hover:bg-blue-800 w-60 transition-all duration-300"
                  onClick={reset}
                >
                  Or Shall we try this again?
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center font-semibold mt-6 text-gray-900 dark:text-gray-300 flex flex-col">
              <p className="text-green-400 mt-5">Mint Completed: {data}</p>
              <button
                className="mt-6 bg-blue-600 p-4 font-semibold rounded-lg cursor-pointer hover:bg-blue-800 w-60 mx-auto transition-all duration-300"
                onClick={reset}
              >
                Shall we try this again?
              </button>
            </div>
          )}
        </div>
      )}
      {!status && (
        <div className="w-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            SafuToken Scorecard
          </h1>
          <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Enter your address to get your special SafuScorecard
          </h2>
          <form
            className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 w-3/4 mx-auto"
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
              {loading ? "Loading..." : "Search"}
            </button>
          </form>
        </div>
      )}
      {error && <p className="text-red-500 mt-3">{error}</p>}

      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 opacity-99 z-50">
          <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
          <p className="text-white text-xl font-semibold">{loadingMessage}</p>
        </div>
      )}

      {/* Results Section */}
    </div>
  );
};

export default App;
