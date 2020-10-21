import { startExpressServer } from "./express";
// tslint:disable: no-console

console.info("Server starting...");

(async ()=>{
  try{
    await startExpressServer();
  }catch(e){
    console.error(e);
  }
})();
