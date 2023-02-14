/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  TrustedPool,
  TrustedPoolInterface,
} from "../../contracts/TrustedPool";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "address",
        name: "_tokenAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_tokenName",
        type: "string",
      },
      {
        components: [
          {
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "share",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "claimed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "accrued",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
        ],
        internalType: "struct PooledTemplate.Participant[]",
        name: "_participants",
        type: "tuple[]",
      },
    ],
    name: "createPooledContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_creator",
        type: "address",
      },
    ],
    name: "getContractAddressesByCreator",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_participants",
        type: "address",
      },
    ],
    name: "getContractAddressesByParticipant",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550613368806100606000396000f3fe60806040523480156200001157600080fd5b5060043610620000525760003560e01c80636bc9a76614620000575780638da5cb5b146200008d57806393d61b7714620000af578063b01585e914620000e5575b600080fd5b6200007560048036038101906200006f919062000576565b62000105565b60405162000084919062000676565b60405180910390f35b62000097620001d4565b604051620000a69190620006ab565b60405180910390f35b620000cd6004803603810190620000c7919062000576565b620001f8565b604051620000dc919062000676565b60405180910390f35b620001036004803603810190620000fd919062000a25565b620002c7565b005b6060600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805480602002602001604051908101604052809291908181526020018280548015620001c857602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190600101908083116200017d575b50505050509050919050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6060600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805480602002602001604051908101604052809291908181526020018280548015620002bb57602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001906001019080831162000270575b50505050509050919050565b60008151036200030e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620003059062000b55565b60405180910390fd5b600033858585856040516200032390620004ef565b6200033395949392919062000da2565b604051809103906000f08015801562000350573d6000803e3d6000fd5b509050600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550620003ff828262000406565b5050505050565b60005b8251811015620004ea57600260008483815181106200042d576200042c62000e14565b5b60200260200101516000015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020829080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508080620004e19062000e72565b91505062000409565b505050565b6124738062000ec083390190565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200053e8262000511565b9050919050565b620005508162000531565b81146200055c57600080fd5b50565b600081359050620005708162000545565b92915050565b6000602082840312156200058f576200058e62000507565b5b60006200059f848285016200055f565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b620005df8162000531565b82525050565b6000620005f38383620005d4565b60208301905092915050565b6000602082019050919050565b60006200061982620005a8565b620006258185620005b3565b93506200063283620005c4565b8060005b83811015620006695781516200064d8882620005e5565b97506200065a83620005ff565b92505060018101905062000636565b5085935050505092915050565b600060208201905081810360008301526200069281846200060c565b905092915050565b620006a58162000531565b82525050565b6000602082019050620006c260008301846200069a565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200071d82620006d2565b810181811067ffffffffffffffff821117156200073f576200073e620006e3565b5b80604052505050565b600062000754620004fd565b905062000762828262000712565b919050565b600067ffffffffffffffff821115620007855762000784620006e3565b5b6200079082620006d2565b9050602081019050919050565b82818337600083830152505050565b6000620007c3620007bd8462000767565b62000748565b905082815260208101848484011115620007e257620007e1620006cd565b5b620007ef8482856200079d565b509392505050565b600082601f8301126200080f576200080e620006c8565b5b813562000821848260208601620007ac565b91505092915050565b600067ffffffffffffffff821115620008485762000847620006e3565b5b602082029050602081019050919050565b600080fd5b600080fd5b600080fd5b6000819050919050565b6200087d8162000868565b81146200088957600080fd5b50565b6000813590506200089d8162000872565b92915050565b600060a08284031215620008bc57620008bb6200085e565b5b620008c860a062000748565b90506000620008da848285016200055f565b6000830152506020620008f0848285016200088c565b602083015250604062000906848285016200088c565b60408301525060606200091c848285016200088c565b606083015250608082013567ffffffffffffffff81111562000943576200094262000863565b5b6200095184828501620007f7565b60808301525092915050565b6000620009746200096e846200082a565b62000748565b905080838252602082019050602084028301858111156200099a576200099962000859565b5b835b81811015620009e857803567ffffffffffffffff811115620009c357620009c2620006c8565b5b808601620009d28982620008a3565b855260208501945050506020810190506200099c565b5050509392505050565b600082601f83011262000a0a5762000a09620006c8565b5b813562000a1c8482602086016200095d565b91505092915050565b6000806000806080858703121562000a425762000a4162000507565b5b600085013567ffffffffffffffff81111562000a635762000a626200050c565b5b62000a7187828801620007f7565b945050602062000a84878288016200055f565b935050604085013567ffffffffffffffff81111562000aa85762000aa76200050c565b5b62000ab687828801620007f7565b925050606085013567ffffffffffffffff81111562000ada5762000ad96200050c565b5b62000ae887828801620009f2565b91505092959194509250565b600082825260208201905092915050565b7f4d7573742068617665206174206c656173742031207061727469636970616e74600082015250565b600062000b3d60208362000af4565b915062000b4a8262000b05565b602082019050919050565b6000602082019050818103600083015262000b708162000b2e565b9050919050565b600081519050919050565b60005b8381101562000ba257808201518184015260208101905062000b85565b60008484015250505050565b600062000bbb8262000b77565b62000bc7818562000af4565b935062000bd981856020860162000b82565b62000be481620006d2565b840191505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b62000c268162000868565b82525050565b600082825260208201905092915050565b600062000c4a8262000b77565b62000c56818562000c2c565b935062000c6881856020860162000b82565b62000c7381620006d2565b840191505092915050565b600060a08301600083015162000c986000860182620005d4565b50602083015162000cad602086018262000c1b565b50604083015162000cc2604086018262000c1b565b50606083015162000cd7606086018262000c1b565b506080830151848203608086015262000cf1828262000c3d565b9150508091505092915050565b600062000d0c838362000c7e565b905092915050565b6000602082019050919050565b600062000d2e8262000bef565b62000d3a818562000bfa565b93508360208202850162000d4e8562000c0b565b8060005b8581101562000d90578484038952815162000d6e858262000cfe565b945062000d7b8362000d14565b925060208a0199505060018101905062000d52565b50829750879550505050505092915050565b600060a08201905062000db960008301886200069a565b818103602083015262000dcd818762000bae565b905062000dde60408301866200069a565b818103606083015262000df2818562000bae565b9050818103608083015262000e08818462000d21565b90509695505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600062000e7f8262000868565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820362000eb45762000eb362000e43565b5b60018201905091905056fe60806040523480156200001157600080fd5b5060405162002473380380620024738339818101604052810190620000379190620006f5565b84600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550836003908162000089919062000a1b565b5082600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160049081620000dc919062000a1b565b506000600760006101000a81548160ff0219169083600181111562000106576200010562000b02565b5b02179055506200011c816200013e60201b60201c565b60068190555062000133816200019960201b60201c565b505050505062000c17565b6000805b8251811015620001935782818151811062000162576200016162000b31565b5b602002602001015160200151826200017b919062000b8f565b915080806200018a9062000bca565b91505062000142565b50919050565b60005b8151811015620002fe576000828281518110620001be57620001bd62000b31565b5b602002602001015190506040518060800160405280826020015181526020018260400151815260200182606001518152602001826080015181525060086000836000015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082015181600001556020820151816001015560408201518160020155606082015181600301908162000271919062000a1b565b50905050806000015160096000600554815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060056000815480929190620002e29062000bca565b9190505550508080620002f59062000bca565b9150506200019c565b5050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620003438262000316565b9050919050565b620003558162000336565b81146200036157600080fd5b50565b60008151905062000375816200034a565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620003d08262000385565b810181811067ffffffffffffffff82111715620003f257620003f162000396565b5b80604052505050565b60006200040762000302565b9050620004158282620003c5565b919050565b600067ffffffffffffffff82111562000438576200043762000396565b5b620004438262000385565b9050602081019050919050565b60005b838110156200047057808201518184015260208101905062000453565b60008484015250505050565b6000620004936200048d846200041a565b620003fb565b905082815260208101848484011115620004b257620004b162000380565b5b620004bf84828562000450565b509392505050565b600082601f830112620004df57620004de6200037b565b5b8151620004f18482602086016200047c565b91505092915050565b600067ffffffffffffffff82111562000518576200051762000396565b5b602082029050602081019050919050565b600080fd5b600080fd5b600080fd5b6000819050919050565b6200054d8162000538565b81146200055957600080fd5b50565b6000815190506200056d8162000542565b92915050565b600060a082840312156200058c576200058b6200052e565b5b6200059860a0620003fb565b90506000620005aa8482850162000364565b6000830152506020620005c0848285016200055c565b6020830152506040620005d6848285016200055c565b6040830152506060620005ec848285016200055c565b606083015250608082015167ffffffffffffffff81111562000613576200061262000533565b5b6200062184828501620004c7565b60808301525092915050565b6000620006446200063e84620004fa565b620003fb565b905080838252602082019050602084028301858111156200066a576200066962000529565b5b835b81811015620006b857805167ffffffffffffffff8111156200069357620006926200037b565b5b808601620006a2898262000573565b855260208501945050506020810190506200066c565b5050509392505050565b600082601f830112620006da57620006d96200037b565b5b8151620006ec8482602086016200062d565b91505092915050565b600080600080600060a086880312156200071457620007136200030c565b5b6000620007248882890162000364565b955050602086015167ffffffffffffffff81111562000748576200074762000311565b5b6200075688828901620004c7565b9450506040620007698882890162000364565b935050606086015167ffffffffffffffff8111156200078d576200078c62000311565b5b6200079b88828901620004c7565b925050608086015167ffffffffffffffff811115620007bf57620007be62000311565b5b620007cd88828901620006c2565b9150509295509295909350565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200082d57607f821691505b602082108103620008435762000842620007e5565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620008ad7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200086e565b620008b986836200086e565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620008fc620008f6620008f08462000538565b620008d1565b62000538565b9050919050565b6000819050919050565b6200091883620008db565b62000930620009278262000903565b8484546200087b565b825550505050565b600090565b6200094762000938565b620009548184846200090d565b505050565b5b818110156200097c57620009706000826200093d565b6001810190506200095a565b5050565b601f821115620009cb57620009958162000849565b620009a0846200085e565b81016020851015620009b0578190505b620009c8620009bf856200085e565b83018262000959565b50505b505050565b600082821c905092915050565b6000620009f060001984600802620009d0565b1980831691505092915050565b600062000a0b8383620009dd565b9150826002028217905092915050565b62000a2682620007da565b67ffffffffffffffff81111562000a425762000a4162000396565b5b62000a4e825462000814565b62000a5b82828562000980565b600060209050601f83116001811462000a93576000841562000a7e578287015190505b62000a8a8582620009fd565b86555062000afa565b601f19841662000aa38662000849565b60005b8281101562000acd5784890151825560018201915060208501945060208101905062000aa6565b8683101562000aed578489015162000ae9601f891682620009dd565b8355505b6001600288020188555050505b505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600062000b9c8262000538565b915062000ba98362000538565b925082820190508082111562000bc45762000bc362000b60565b5b92915050565b600062000bd78262000538565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820362000c0c5762000c0b62000b60565b5b600182019050919050565b61184c8062000c276000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806326a4e8d21461005157806348c54b9d1461006d5780639e1a4d1914610077578063af8d201514610095575b600080fd5b61006b60048036038101906100669190610dcb565b6100cb565b005b610075610281565b005b61007f610567565b60405161008c9190610e11565b60405180910390f35b6100af60048036038101906100aa9190610e58565b61071f565b6040516100c2979695949392919061114e565b60405180910390f35b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000015411610150576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101479061121e565b60405180910390fd5b8060008173ffffffffffffffffffffffffffffffffffffffff163b036101ab576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101a29061128a565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461023c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610233906112f6565b60405180910390fd5b81600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610312576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161030990611362565b60405180910390fd5b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206002015411610397576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161038e906113ce565b60405180910390fd5b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020154905080600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206001016000828254610430919061141d565b925050819055506000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600201819055506000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb30846040518363ffffffff1660e01b81526004016104de929190611451565b6020604051808303816000875af11580156104fd573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061052191906114b2565b905080610563576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161055a9061152b565b60405180910390fd5b5050565b60008073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036105f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f090611362565b60405180910390fd5b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001541161067e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106759061121e565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016106d9919061154b565b602060405180830381865afa1580156106f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061071a919061157b565b905090565b600060606000606060008060606000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154116107b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107a89061121e565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166003600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166004600654600760009054906101000a900460ff166108188f8f61094a565b858054610824906115d7565b80601f0160208091040260200160405190810160405280929190818152602001828054610850906115d7565b801561089d5780601f106108725761010080835404028352916020019161089d565b820191906000526020600020905b81548152906001019060200180831161088057829003601f168201915b505050505095508380546108b0906115d7565b80601f01602080910402602001604051908101604052809291908181526020018280546108dc906115d7565b80156109295780601f106108fe57610100808354040283529160200191610929565b820191906000526020600020905b81548152906001019060200180831161090c57829003601f168201915b50505050509350965096509650965096509650965092959891949750929550565b60606000600554036109b257600067ffffffffffffffff81111561097157610970611608565b5b6040519080825280602002602001820160405280156109aa57816020015b610997610d23565b81526020019060019003908161098f5790505b509050610d1d565b82600554116109f6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109ed906116a9565b60405180910390fd5b82600554610a0491906116c9565b821115610a1c5782600554610a1991906116c9565b91505b60008267ffffffffffffffff811115610a3857610a37611608565b5b604051908082528060200260200182016040528015610a7157816020015b610a5e610d23565b815260200190600190039081610a565790505b50905060008073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610ad2576000610adb565b610ada610567565b5b90506000808690505b8587610af0919061141d565b811015610d15576000600860006009600085815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020604051806080016040529081600082015481526020016001820154815260200160028201548152602001600382018054610ba4906115d7565b80601f0160208091040260200160405190810160405280929190818152602001828054610bd0906115d7565b8015610c1d5780601f10610bf257610100808354040283529160200191610c1d565b820191906000526020600020905b815481529060010190602001808311610c0057829003601f168201915b505050505081525050905060008160200151600654836000015187610c4291906116fd565b610c4c919061176e565b610c5691906116c9565b90506040518060a001604052806009600086815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183600001518152602001836020015181526020018281526020018360600151815250868581518110610ce757610ce661179f565b5b60200260200101819052508380610cfd906117ce565b94505050508080610d0d906117ce565b915050610ae4565b508293505050505b92915050565b6040518060a00160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600081526020016000815260200160008152602001606081525090565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610d9882610d6d565b9050919050565b610da881610d8d565b8114610db357600080fd5b50565b600081359050610dc581610d9f565b92915050565b600060208284031215610de157610de0610d68565b5b6000610def84828501610db6565b91505092915050565b6000819050919050565b610e0b81610df8565b82525050565b6000602082019050610e266000830184610e02565b92915050565b610e3581610df8565b8114610e4057600080fd5b50565b600081359050610e5281610e2c565b92915050565b60008060408385031215610e6f57610e6e610d68565b5b6000610e7d85828601610e43565b9250506020610e8e85828601610e43565b9150509250929050565b610ea181610d8d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610ee1578082015181840152602081019050610ec6565b60008484015250505050565b6000601f19601f8301169050919050565b6000610f0982610ea7565b610f138185610eb2565b9350610f23818560208601610ec3565b610f2c81610eed565b840191505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60028110610f7757610f76610f37565b5b50565b6000819050610f8882610f66565b919050565b6000610f9882610f7a565b9050919050565b610fa881610f8d565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610fe381610d8d565b82525050565b610ff281610df8565b82525050565b600082825260208201905092915050565b600061101482610ea7565b61101e8185610ff8565b935061102e818560208601610ec3565b61103781610eed565b840191505092915050565b600060a08301600083015161105a6000860182610fda565b50602083015161106d6020860182610fe9565b5060408301516110806040860182610fe9565b5060608301516110936060860182610fe9565b50608083015184820360808601526110ab8282611009565b9150508091505092915050565b60006110c48383611042565b905092915050565b6000602082019050919050565b60006110e482610fae565b6110ee8185610fb9565b93508360208202850161110085610fca565b8060005b8581101561113c578484038952815161111d85826110b8565b9450611128836110cc565b925060208a01995050600181019050611104565b50829750879550505050505092915050565b600060e082019050611163600083018a610e98565b81810360208301526111758189610efe565b90506111846040830188610e98565b81810360608301526111968187610efe565b90506111a56080830186610e02565b6111b260a0830185610f9f565b81810360c08301526111c481846110d9565b905098975050505050505050565b7f4f6e6c7920666f72207061727469636970616e74000000000000000000000000600082015250565b6000611208601483610eb2565b9150611213826111d2565b602082019050919050565b60006020820190508181036000830152611237816111fb565b9050919050565b7f417267756d656e74206973206e6f7420636f6e74726163742061646472657373600082015250565b6000611274602083610eb2565b915061127f8261123e565b602082019050919050565b600060208201905081810360008301526112a381611267565b9050919050565b7f546f6b656e206164647265737320616c72656164792073657400000000000000600082015250565b60006112e0601983610eb2565b91506112eb826112aa565b602082019050919050565b6000602082019050818103600083015261130f816112d3565b9050919050565b7f546f6b656e20636f6e74726163742061646472657373206e6f20736574000000600082015250565b600061134c601d83610eb2565b915061135782611316565b602082019050919050565b6000602082019050818103600083015261137b8161133f565b9050919050565b7f546865726520617265206e6f7420746f6b656e7320666f7220636c61696d0000600082015250565b60006113b8601e83610eb2565b91506113c382611382565b602082019050919050565b600060208201905081810360008301526113e7816113ab565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061142882610df8565b915061143383610df8565b925082820190508082111561144b5761144a6113ee565b5b92915050565b60006040820190506114666000830185610e98565b6114736020830184610e02565b9392505050565b60008115159050919050565b61148f8161147a565b811461149a57600080fd5b50565b6000815190506114ac81611486565b92915050565b6000602082840312156114c8576114c7610d68565b5b60006114d68482850161149d565b91505092915050565b7f436c61696d206572726f72000000000000000000000000000000000000000000600082015250565b6000611515600b83610eb2565b9150611520826114df565b602082019050919050565b6000602082019050818103600083015261154481611508565b9050919050565b60006020820190506115606000830184610e98565b92915050565b60008151905061157581610e2c565b92915050565b60006020828403121561159157611590610d68565b5b600061159f84828501611566565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806115ef57607f821691505b602082108103611602576116016115a8565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f537461727420696e6465782067726561746572207468616e20636f756e74206f60008201527f66207061727469636970616e7473000000000000000000000000000000000000602082015250565b6000611693602e83610eb2565b915061169e82611637565b604082019050919050565b600060208201905081810360008301526116c281611686565b9050919050565b60006116d482610df8565b91506116df83610df8565b92508282039050818111156116f7576116f66113ee565b5b92915050565b600061170882610df8565b915061171383610df8565b925082820261172181610df8565b91508282048414831517611738576117376113ee565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061177982610df8565b915061178483610df8565b9250826117945761179361173f565b5b828204905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60006117d982610df8565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361180b5761180a6113ee565b5b60018201905091905056fea264697066735822122068641a2b3cdc403c5763387f3cf5e9f72aec239e7abe1202c43f93a79963595664736f6c63430008110033a264697066735822122031ba3fbeac681f9ed7a72fa0c6ab59f0bbb16f035db27213e7d4980f9bfec42764736f6c63430008110033";

type TrustedPoolConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TrustedPoolConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TrustedPool__factory extends ContractFactory {
  constructor(...args: TrustedPoolConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TrustedPool> {
    return super.deploy(overrides || {}) as Promise<TrustedPool>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TrustedPool {
    return super.attach(address) as TrustedPool;
  }
  override connect(signer: Signer): TrustedPool__factory {
    return super.connect(signer) as TrustedPool__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TrustedPoolInterface {
    return new utils.Interface(_abi) as TrustedPoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TrustedPool {
    return new Contract(address, _abi, signerOrProvider) as TrustedPool;
  }
}
