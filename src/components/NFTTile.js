import axie from "../tile.jpeg";
import axios from "axios";
import api_key from "./Profile";
import {
    BrowserRouter as Router,
    Link,
  } from "react-router-dom";
  import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile (data) {
    const newTo = {
        pathname:"/nftPage/"+ data.data.contractAddress + "/"+ data.data.tokenId
    }
    console.log(data);
    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);
    console.log("IPFS URL:", IPFSUrl);


    return (
        <Link to={newTo}>
        <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl">
            <img src={IPFSUrl} alt="" className="w-72 h-80 rounded-lg object-cover" crossOrigin="anonymous" />
            <div className= "text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
                <strong className="text-xl">{data.data.name}</strong>
                <p className="display-inline">
                    {data.data.description}
                </p>
                <button className="enableEthereumButton bg-blue-500 hover: bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => console.log("button clicked")}>View Info</button>

            </div>
        </div>
        </Link>
    )
}

export default NFTTile;
