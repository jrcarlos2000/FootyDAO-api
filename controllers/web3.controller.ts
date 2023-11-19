import dotenv from "dotenv";
import { ethers } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";
import sharp from "sharp";

dotenv.config();

// For Chiliz Chain
export const distributeRewards = async (req: any, res: any) => {
  const { userStringArray, totalAmount, fanTokenId, requestId } = req.params;
  // split commas
  const users = userStringArray.split(",");

  // create provider
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // create contract
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS!,
    [
      "function distributeRewards(address[] memory _users, uint256 _totalAmount, uint256 _fanTokenId, uint256 _requestId)",
    ],
    wallet
  );
  try {
    const tx = await contract.distributeRewards(
      users,
      totalAmount,
      fanTokenId,
      requestId
    );
    await tx.wait();
    console.log("distributed successfully");
    // return ok
    res.status(200).send("ok");
  } catch (error) {
    console.log("error distributing rewards");
    res.status(200).send("ok");
  }
};

export const uploadAndEncryptedFile = async (req: any, res: any) => {
  const { creatorAddr } = req.body;
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_OPTIMISM!
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const high_res_img_path =
    "/Users/carlosssramosss/work/quantum3labs/FootyDAO-server/sample.jpg";

  const low_res_img_path =
    "/Users/carlosssramosss/work/quantum3labs/FootyDAO-server/output.jpg";

  // resize image to lower resolution
  await sharp(high_res_img_path)
    .resize(200, 200)
    .jpeg()
    .toFile(low_res_img_path);

  //   upload low res pic
  const lowResImgUploadResponse = await lighthouse.upload(
    low_res_img_path,
    process.env.LIGHTHOUSE_API_KEY!
  );

  let messageRequested = (await lighthouse.getAuthMessage(wallet.address)).data
    .message;
  let signedMessage = await wallet.signMessage(messageRequested);
  const highResImgUploadResponse = await lighthouse.uploadEncrypted(
    high_res_img_path,
    process.env.LIGHTHOUSE_API_KEY!,
    wallet.address,
    signedMessage
  );

  const imgMetadata = {
    low_res_img: lowResImgUploadResponse.data.Hash,
    high_res_img: highResImgUploadResponse.data[0].Hash,
  };

  // share with the creator of this img
  await shareFile(creatorAddr, imgMetadata.high_res_img);

  const finalResponse = await lighthouse.uploadText(
    JSON.stringify(imgMetadata),
    process.env.LIGHTHOUSE_API_KEY!,
    "sample-cid"
  );
  res.status(200).send({
    cid: finalResponse.data.Hash,
  });
};

export const completePurchase = async (req: any, res: any) => {
  const { buyerAddr, cid } = req.body;
  await shareFile(buyerAddr, cid);
  res.status(200).send("ok");
};

const shareFile = async (addr: string, cid: string) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_OPTIMISM!
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

    const messageRequested = (await lighthouse.getAuthMessage(wallet.address))
      .data.message;
    const signedMessage = await wallet.signMessage(messageRequested);
    await lighthouse.shareFile(wallet.address, [addr], cid, signedMessage);
  } catch (error) {
    console.log(error);
  }
};

// JUST FOR TESTING TODO on the UI
export const tryGetDecryptKey = async (req: any, res: any) => {
  const { cid } = req.body;
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_OPTIMISM!
  );
  const wallet = new ethers.Wallet( // 0x51f9B9fcBDCb13029779bcaA3fbb34adCcf04BCC
    "0x3941e4ce0eaa73e7410404bf517f7684ee8e1ce2179eecde931d94359f244086",
    provider
  );
  console.log(wallet.address);
  const publicKey = wallet.address;

  let messageRequested = (await lighthouse.getAuthMessage(wallet.address)).data
    .message;
  let signedMessage = await wallet.signMessage(messageRequested);
  try {
    const key = await lighthouse.fetchEncryptionKey(
      cid,
      publicKey,
      signedMessage
    );
    res.status(200).send({
      key: key.data.key,
    });
    console.log(key);
  } catch (err) {
    res.status(400).send("error");
    console.log(err);
  }
};
