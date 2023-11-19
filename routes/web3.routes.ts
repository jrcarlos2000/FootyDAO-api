import * as controller from "../controllers/web3.controller";

export default (app: any) => {
  app.use(function (req: any, res: any, next: any) {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });
  app.post(
    "/api/web3/distribute-rewards/:userStringArray/:totalAmount/:fanTokenId/:requestId",
    controller.distributeRewards
  );
  app.post(
    "/api/web3/upload-encrypted-file",
    controller.uploadAndEncryptedFile
  );
  app.post("/api/web3/complete-purchase", controller.completePurchase);
  app.post("/api/web3/try-decrypt", controller.tryGetDecryptKey);
};
