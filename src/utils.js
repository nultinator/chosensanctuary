export const SERVER_LOCATION = "http://3.19.103.107/api";
//export const SERVER_LOCATION = "http://172.31.40.87:5000/api";

export const GetIpfsUrlFromPinata = (pinataUrl) => {
    var IPFSUrl = pinataUrl.replace("https://gateway.pinata.cloud/", "https://ipfs.io/");
    //const lastIndex = IPFSUrl.length;
    //IPFSUrl = "https://ipfs.io/ipfs/"+IPFSUrl[lastIndex-1];
    return IPFSUrl;
};