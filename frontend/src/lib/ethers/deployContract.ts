import { ethers } from "ethers";
import contractABI from "@/abi/FreelanceContract.json";

declare global {
  interface Window {
    ethereum: any;
  }
}

const bytecode = "608060405234801561001057600080fd5b50604051610ba1380380610ba183398181016040528101906100329190610162565b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600281905550600160038190555050506101a2565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100f9826100ce565b9050919050565b610109816100ee565b811461011457600080fd5b50565b60008151905061012681610100565b92915050565b6000819050919050565b61013f8161012c565b811461014a57600080fd5b50565b60008151905061015c81610136565b92915050565b60008060408385031215610179576101786100c9565b5b600061018785828601610117565b92505060206101988582860161014d565b9150509250929050565b6109f0806101b16000396000f3fe60806040526004361061007b5760003560e01c8063a37dda2c1161004e578063a37dda2c1461011b578063ae200e7914610146578063b030481314610171578063c438b40f1461019c5761007b565b806340d9f30a146100805780634757ace41461008a578063852ea203146100c7578063941cf415146100f0575b600080fd5b6100886101c5565b005b34801561009657600080fd5b506100b160048036038101906100ac91906105c1565b610299565b6040516100be9190610609565b60405180910390f35b3480156100d357600080fd5b506100ee60048036038101906100e991906105c1565b6102b9565b005b3480156100fc57600080fd5b506101056103bc565b6040516101129190610633565b60405180910390f35b34801561012757600080fd5b506101306103c2565b60405161013d919061068f565b60405180910390f35b34801561015257600080fd5b5061015b6103e8565b604051610168919061068f565b60405180910390f35b34801561017d57600080fd5b5061018661040c565b6040516101939190610633565b60405180910390f35b3480156101a857600080fd5b506101c360048036038101906101be91906105c1565b610412565b005b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610253576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161024a90610707565b60405180910390fd5b6002543414610297576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028e90610773565b60405180910390fd5b565b60046020528060005260406000206000915054906101000a900460ff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610349576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610340906107df565b60405180910390fd5b600354811461038d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103849061084b565b60405180910390fd5b60016004600083815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b60025481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60035481565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146104a0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610497906108b7565b60405180910390fd5b6004600082815260200190815260200160002060009054906101000a900460ff16610500576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104f790610923565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc6002549081150290604051600060405180830381858888f1935050505015801561056a573d6000803e3d6000fd5b506003600081548092919061057e90610972565b919050555050565b600080fd5b6000819050919050565b61059e8161058b565b81146105a957600080fd5b50565b6000813590506105bb81610595565b92915050565b6000602082840312156105d7576105d6610586565b5b60006105e5848285016105ac565b91505092915050565b60008115159050919050565b610603816105ee565b82525050565b600060208201905061061e60008301846105fa565b92915050565b61062d8161058b565b82525050565b60006020820190506106486000830184610624565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006106798261064e565b9050919050565b6106898161066e565b82525050565b60006020820190506106a46000830184610680565b92915050565b600082825260208201905092915050565b7f4f6e6c7920656d706c6f7965722063616e2066756e642e000000000000000000600082015250565b60006106f16017836106aa565b91506106fc826106bb565b602082019050919050565b60006020820190508181036000830152610720816106e4565b9050919050565b7f496e636f727265637420616d6f756e742e000000000000000000000000000000600082015250565b600061075d6011836106aa565b915061076882610727565b602082019050919050565b6000602082019050818103600083015261078c81610750565b9050919050565b7f4f6e6c7920667265656c616e6365722063616e20636f6d706c6574652e000000600082015250565b60006107c9601d836106aa565b91506107d482610793565b602082019050919050565b600060208201905081810360008301526107f8816107bc565b9050919050565b7f496e636f7272656374206d696c6573746f6e652e000000000000000000000000600082015250565b60006108356014836106aa565b9150610840826107ff565b602082019050919050565b6000602082019050818103600083015261086481610828565b9050919050565b7f4f6e6c7920656d706c6f7965722063616e20617070726f76652e000000000000600082015250565b60006108a1601a836106aa565b91506108ac8261086b565b602082019050919050565b600060208201905081810360008301526108d081610894565b9050919050565b7f4d696c6573746f6e65206e6f7420636f6d706c657465642e0000000000000000600082015250565b600061090d6018836106aa565b9150610918826108d7565b602082019050919050565b6000602082019050818103600083015261093c81610900565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061097d8261058b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036109af576109ae610943565b5b60018201905091905056fea2646970667358221220efefcc5846526f129d57a1d0c0d24a50fc25e4326cd6a35a1815892026de83f164736f6c634300081a0033";

export async function deployFreelanceContract(freelancer: string, milestoneAmount: number) {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask!");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const factory = new ethers.ContractFactory(contractABI, bytecode, signer);
    const contract = await factory.deploy(freelancer, ethers.parseEther(milestoneAmount.toString()));

    await contract.waitForDeployment();

    return await contract.getAddress(); // 🎉 Smart contract deployed!
  } catch (err) {
    console.error("Contract deploy failed:", err);
    return null;
  }
}
