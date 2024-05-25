import InputData from "./inputData";

export default interface InputGetterInterface {  
  getInputFrame(id: string): InputData;
}