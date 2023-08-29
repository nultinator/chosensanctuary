import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import erc721ABI from "../erc721ABI.json";
import axios from "axios";
import { useState } from "react";
import { SERVER_LOCATION, GetIpfsUrlFromPinata } from "../utils";
import { list } from "postcss";

export default function NFTPage (props) {



//variables used in rendering
const [formParams, updateFormParams] = useState({ price: '', donationPercentage: ''});
const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");


async function getTokenOwner(contractAddress, tokenId) {
    const baseURL = `${SERVER_LOCATION}/getTokenOwner?contractAddress=${contractAddress}&tokenId=${tokenId}`;
    const owner = await axios.get(baseURL).catch((error) => {
        console.log("error", error);
        return;
    })
    console.log("OWNER DATA", owner);
    return String(owner.data);
}


async function getNFTData(listingId) {
    console.log("connecting to ethers");
    const ethers = require("ethers");
    //attempt to connect to user's wallet
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //user signs to authorize the connection
    const signer = provider.getSigner();
    console.log("Wallet connected");
    //get the user's wallet address
    const addr = await signer.getAddress();
    console.log("Found wallet address");
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //lookup the token
    console.log("Connected to marketplace contract");
    const listedToken = await contract.getMostRecentListing(contractAddress, tokenId);
    console.log("LISTED TOKEN", listedToken);
    if (listedToken.currentlyListed == false) {
        console.log("Token not listed");
        return;
    } 

    var tokenURI = await contract.getURIforListing(Number(listingId));
    console.log("Fetched tokenURI");



    console.log("Token id before fetching uri", listedToken);   
    
    //make a GET request for the token info
    let meta = await axios.get(tokenURI);
    //turn metadata into an object
    meta = meta.data;
    console.log("NFT Data: ", listedToken);
    //create item properties from the token metadata
    let item = {
        //convert price from hex to number, then convert from wei to eth
        price: Number(listedToken.price._hex)/ 1_000_000_000_000_000_000,
        //convert donation percenate from hex to number
        donationPercentage: Number(listedToken.donationPercentage._hex),
        tokenId: tokenId,
        contractAddress: listedToken.contractAddress,
        //convert listing id from hex to number
        listingId: Number(listedToken.listingId._hex),
        seller: listedToken.seller,
        owner: listedToken.owner,
        currentlyListed: listedToken.currentlyListed.toString(),
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function getTokenMetaData(contractAddress, tokenId) {
    //import ethers
    const ethers = require("ethers");
    //connect to wallet
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //get user authorization
    const signer = provider.getSigner();
    //store the wallet address
    const addr = (await signer.getAddress()).toLowerCase();
    //save the connected contract as a constant
    const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
    const marketplace_addr = MarketplaceJSON.address;

    //fetch token metadata from the server
    const baseURL = `${SERVER_LOCATION}/getTokenMetaData?contractAddress=${contractAddress}&tokenId=${tokenId}`;
    console.log("trying", baseURL);
    //make the get request
    const tokenData = await axios.get(baseURL).catch((error) => {
    //return immediately in the event of an error
      console.log("error", error);
      return;
    });
    console.log("getTokenMetadata", tokenData);

    params.listingId = tokenData.data.listingId;

    //find the current owner of the token
    tokenData.owner = await getTokenOwner(contractAddress, tokenId);
    console.log("Owner:", tokenData.owner);
    //create a boolean to figure out whether or not the current user can sell the token
    var canSell;
    //if the connected wallet is the same as the owner, the user can sell
    if (tokenData.owner.toLowerCase().trim() === currAddress.toLowerCase().trim()) {
        canSell = true;
    //otherwise the user cannot sell
    } else {
        canSell = false;
    }

    //token metadata
    console.log("TOKEN DATA", tokenData);
    let item = {
        price: tokenData.price,
        tokenId: tokenId,
        seller: tokenData.data.seller,
        contractAddress: tokenData.data.contract.address,
        owner: tokenData.owner,
        image: tokenData.data.metadata.image,
        name: tokenData.data.title,
        description: tokenData.data.metadata.description,
        canSell: canSell,
    }
    updateData(item);
    formParams.contractAddress = item.contractAddress;
    formParams.tokenId = item.tokenId;
    

    console.log("Item", item);
    
    
    console.log("OWNER:", tokenData.owner.trim());
    console.log("CONTRACT ADDRESS", marketplace_addr.trim());
    console.log(marketplace_addr.trim().localeCompare(String(tokenData.owner)));

    //if marketplace contract owns the token, display the sale data    
    if (String(tokenData.owner).toLowerCase() === marketplace_addr.toLowerCase()) {
        console.log("this token belongs to the smart contract");
        console.log("Listing Id", item.listingId);
        console.log("PARAMS", formParams);
        const mostRecentListing = await contract.getMostRecentListing(item.contractAddress, item.tokenId);
        console.log("Most recent listing", mostRecentListing);
        updateData(mostRecentListing);
        getNFTData(Number(mostRecentListing.listingId._hex));
        updateData(item);
        updateDataFetched(true);
        updateCurrAddress(addr); 
        return;
    }
    
    updateData(item);
    updateDataFetched(true);
    updateCurrAddress(addr);    
}


async function buyNFT(contractAddress, listingId, tokenId) {
    console.log("Attempting to buy");
    try {
        //import ethers
        const ethers = require("ethers");
        console.log("Imported ethers");
        //attempt to connect to user wallet
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        //user signs to authorize the connection
        const signer = provider.getSigner();
        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        console.log("Connected to wallet");
        //lookup the price of the token
        const salePrice = await contract.getListPrice(listingId);
        //convert price from hex to number for readability
        console.log("converted price to ether:", Number(salePrice._hex));
        updateMessage("Buying the NFT...(takes one block confirmation)");
        //call the contract to execute the sale
        let transaction = await contract.executeSale(listingId, {value:salePrice});
        //wait for the transaction to finish
        await transaction.wait();
        //inform the user that the operation was successful
        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    //if an error occurs, display the error message to the user
    catch(e) {
        alert("You cannot purchase this NFT");
    }
}

async function listAnyNFT(e) {
    try {
        //import ethers
        const ethers = require("ethers");
        console.log("importing ethers");
        //connect to wallet
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        console.log("successfully connected to wallet");
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        console.log("Pulled smart contract info");
        const tokenId = params.tokenId;
        console.log("found token id");
        const contractAddress = params.contractAddress;
        console.log("found contract address", contractAddress);
        const salePrice = await ethers.utils.parseUnits(formParams.price, "ether");
        console.log("Sale price", salePrice);
        //connect to the individual token contract
        const tokenContract = new ethers.Contract(contractAddress, erc721ABI, signer);
        console.log("Connected to contract");
        console.log("Connecting to NFT ABI");
        //get approval from the user to send the NFT
        const approved = await tokenContract.getApproved(tokenId);
        console.log("approved", approved);
        if (approved.toLowerCase() != MarketplaceJSON.address.toLowerCase()) {
            await tokenContract.approve(MarketplaceJSON.address, tokenId);
            alert("Awaiting approval...please click 'ok' or refresh the page once the transaction goes through");
        }
       
        console.log("getting contract list price");
        updateMessage("Attempting to list your token");
        let transaction = await contract.listAnyNFTCustom(params.contractAddress, params.tokenId, formParams.donationPercentage ,salePrice, { value: salePrice});
        console.log("waiting for transaction");
        await transaction.wait();
        alert("Token Successfully listed with Chosen Sanctuary!");
        updateMessage("");
    }
    catch(error) {
        alert("An error occured", error);
        updateMessage("");
    }
}
    //params will be passed from the form into the contract
    const params = useParams();

    const tokenId = params.tokenId;
    const contractAddress = params.contractAddress;
    const listingId = params.listingId;
    console.log("Contract address", params.contractAddress);
    console.log("params", params);
    console.log("Listing Id:", listingId)
    console.log("Current Address", currAddress);
    console.log("Form params", formParams);


    //if we have no data, retrieve the data
    if(!dataFetched) {
        getTokenMetaData(params.contractAddress, params.tokenId);
    }
    if(typeof data.image == "string") {
        data.image = GetIpfsUrlFromPinata(data.image);
    }
    if(data.currentlyListed == "true") {
        //if the token is currently listed for sale, render the following jsx
        return(
            <div style={{"min-height":"100vh"}}>
                <Navbar></Navbar>
                <div className="flex ml-20 mt-20">
                    <img src={data.image} alt="" className="w-2/5" />
                    <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                        <div>
                            Name: {data.name}
                        </div>
                        <div>
                            Token Id: {params.tokenId}
                        </div>
                        <div>
                            Listing Id: {data.listingId}
                        </div>
                        <div>
                            Description: {data.description}
                        </div>
                        <div>
                            Price: <span className="">{data.price + " ETH"}</span>
                        </div>
                        <div>
                            Donation Percentage <span classname="">{data.donationPercentage + "%"}</span>
                        </div>
                        <div>
                            Contract Address: <span className="text-sm">{data.contractAddress}</span>
                        </div>
                        <div>
                            Current Seller: <span className="text-sm">{data.seller}</span>
                        </div>
                        <div>For Sale: <span className="text-sm">{data.currentlyListed}</span></div>
                        <div>
                        { currAddress !== data.seller?
                            <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(contractAddress, data.listingId, tokenId)}>Buy this NFT</button>
                            : <div className="text-emerald-700">You cannot purchase NFTs that you already own</div>
                        }
                    
                        <div className="text-green text-center mt-3">{message}</div>
                        </div>
                    </div>
                </div>
            </div>
                )
            //if it is not listed for sale, render this instead
            } else {
                return(
                    <div style={{"min-height":"100vh"}}>
                        <Navbar></Navbar>
                        <div className="flex ml-20 mt-20">
                            <img src={data.image} alt="" className="w-2/5" />
                            <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                                <div>
                                    Name: {data.name}
                                </div>
                                <div>
                                    Token Id: {params.tokenId}
                                </div>
                                <div>
                                    Description: {data.description}
                                </div>
                                <div>
                                    Last Price: <span className="">{data.price + " ETH"}</span>
                                </div>
                                <div>
                                    Contract Address: <span className="text-sm">{data.contractAddress}</span>
                                </div>
                                <div>
                                    Current Owner: <span className="text-sm">{data.owner}</span>
                                </div>
                                <div>For Sale: <span className="text-sm">{data.currentlyListed}</span></div>
                                <div>
                                    <div className="text-emerald-700">Not for Sale</div>


                                    {                                     
                                    currAddress == data.owner &&

                                    <button className="enableEthereumButton bg-blue-500 hover: bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={listAnyNFT}>List For Sale</button>
                                    }
                                    {
                                    currAddress == data.owner &&
                                    <div className="mb-6">
                                    <label className="block text-black-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.001 ETH" step="0.001" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                                    </div>
                                    }
                                    {
                                    currAddress == data.owner &&
                                    <div className="mb-6">
                                    <label className="block text-black-500 text-sm font-bold mb-2" htmlFor="price">Donation Percentage</label>
                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="25%" step="25" min="25" max="100" value={formParams.donationPercentage} onChange={e => updateFormParams({...formParams, donationPercentage: e.target.value})}></input>
                                    </div>
                                    }

                            
                                <div className="text-green text-center mt-3">{message}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                        )
                    }
}