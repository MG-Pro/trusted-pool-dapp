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
  "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550613337806100606000396000f3fe60806040523480156200001157600080fd5b5060043610620000525760003560e01c80636bc9a76614620000575780638da5cb5b146200008d57806393d61b7714620000af578063b01585e914620000e5575b600080fd5b6200007560048036038101906200006f919062000576565b62000105565b60405162000084919062000676565b60405180910390f35b62000097620001d4565b604051620000a69190620006ab565b60405180910390f35b620000cd6004803603810190620000c7919062000576565b620001f8565b604051620000dc919062000676565b60405180910390f35b620001036004803603810190620000fd919062000a25565b620002c7565b005b6060600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805480602002602001604051908101604052809291908181526020018280548015620001c857602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190600101908083116200017d575b50505050509050919050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6060600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805480602002602001604051908101604052809291908181526020018280548015620002bb57602002820191906000526020600020905b8160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001906001019080831162000270575b50505050509050919050565b60008151036200030e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620003059062000b55565b60405180910390fd5b600033858585856040516200032390620004ef565b6200033395949392919062000da2565b604051809103906000f08015801562000350573d6000803e3d6000fd5b509050600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550620003ff828262000406565b5050505050565b60005b8251811015620004ea57600260008483815181106200042d576200042c62000e14565b5b60200260200101516000015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020829080600181540180825580915050600190039060005260206000200160009091909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508080620004e19062000e72565b91505062000409565b505050565b6124428062000ec083390190565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006200053e8262000511565b9050919050565b620005508162000531565b81146200055c57600080fd5b50565b600081359050620005708162000545565b92915050565b6000602082840312156200058f576200058e62000507565b5b60006200059f848285016200055f565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b620005df8162000531565b82525050565b6000620005f38383620005d4565b60208301905092915050565b6000602082019050919050565b60006200061982620005a8565b620006258185620005b3565b93506200063283620005c4565b8060005b83811015620006695781516200064d8882620005e5565b97506200065a83620005ff565b92505060018101905062000636565b5085935050505092915050565b600060208201905081810360008301526200069281846200060c565b905092915050565b620006a58162000531565b82525050565b6000602082019050620006c260008301846200069a565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200071d82620006d2565b810181811067ffffffffffffffff821117156200073f576200073e620006e3565b5b80604052505050565b600062000754620004fd565b905062000762828262000712565b919050565b600067ffffffffffffffff821115620007855762000784620006e3565b5b6200079082620006d2565b9050602081019050919050565b82818337600083830152505050565b6000620007c3620007bd8462000767565b62000748565b905082815260208101848484011115620007e257620007e1620006cd565b5b620007ef8482856200079d565b509392505050565b600082601f8301126200080f576200080e620006c8565b5b813562000821848260208601620007ac565b91505092915050565b600067ffffffffffffffff821115620008485762000847620006e3565b5b602082029050602081019050919050565b600080fd5b600080fd5b600080fd5b6000819050919050565b6200087d8162000868565b81146200088957600080fd5b50565b6000813590506200089d8162000872565b92915050565b600060a08284031215620008bc57620008bb6200085e565b5b620008c860a062000748565b90506000620008da848285016200055f565b6000830152506020620008f0848285016200088c565b602083015250604062000906848285016200088c565b60408301525060606200091c848285016200088c565b606083015250608082013567ffffffffffffffff81111562000943576200094262000863565b5b6200095184828501620007f7565b60808301525092915050565b6000620009746200096e846200082a565b62000748565b905080838252602082019050602084028301858111156200099a576200099962000859565b5b835b81811015620009e857803567ffffffffffffffff811115620009c357620009c2620006c8565b5b808601620009d28982620008a3565b855260208501945050506020810190506200099c565b5050509392505050565b600082601f83011262000a0a5762000a09620006c8565b5b813562000a1c8482602086016200095d565b91505092915050565b6000806000806080858703121562000a425762000a4162000507565b5b600085013567ffffffffffffffff81111562000a635762000a626200050c565b5b62000a7187828801620007f7565b945050602062000a84878288016200055f565b935050604085013567ffffffffffffffff81111562000aa85762000aa76200050c565b5b62000ab687828801620007f7565b925050606085013567ffffffffffffffff81111562000ada5762000ad96200050c565b5b62000ae887828801620009f2565b91505092959194509250565b600082825260208201905092915050565b7f4d7573742068617665206174206c656173742031207061727469636970616e74600082015250565b600062000b3d60208362000af4565b915062000b4a8262000b05565b602082019050919050565b6000602082019050818103600083015262000b708162000b2e565b9050919050565b600081519050919050565b60005b8381101562000ba257808201518184015260208101905062000b85565b60008484015250505050565b600062000bbb8262000b77565b62000bc7818562000af4565b935062000bd981856020860162000b82565b62000be481620006d2565b840191505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b62000c268162000868565b82525050565b600082825260208201905092915050565b600062000c4a8262000b77565b62000c56818562000c2c565b935062000c6881856020860162000b82565b62000c7381620006d2565b840191505092915050565b600060a08301600083015162000c986000860182620005d4565b50602083015162000cad602086018262000c1b565b50604083015162000cc2604086018262000c1b565b50606083015162000cd7606086018262000c1b565b506080830151848203608086015262000cf1828262000c3d565b9150508091505092915050565b600062000d0c838362000c7e565b905092915050565b6000602082019050919050565b600062000d2e8262000bef565b62000d3a818562000bfa565b93508360208202850162000d4e8562000c0b565b8060005b8581101562000d90578484038952815162000d6e858262000cfe565b945062000d7b8362000d14565b925060208a0199505060018101905062000d52565b50829750879550505050505092915050565b600060a08201905062000db960008301886200069a565b818103602083015262000dcd818762000bae565b905062000dde60408301866200069a565b818103606083015262000df2818562000bae565b9050818103608083015262000e08818462000d21565b90509695505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600062000e7f8262000868565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820362000eb45762000eb362000e43565b5b60018201905091905056fe60806040523480156200001157600080fd5b5060405162002442380380620024428339818101604052810190620000379190620006f5565b84600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550836003908162000089919062000a1b565b5082600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160049081620000dc919062000a1b565b506000600760006101000a81548160ff0219169083600181111562000106576200010562000b02565b5b02179055506200011c816200013e60201b60201c565b60068190555062000133816200019960201b60201c565b505050505062000c17565b6000805b8251811015620001935782818151811062000162576200016162000b31565b5b602002602001015160200151826200017b919062000b8f565b915080806200018a9062000bca565b91505062000142565b50919050565b60005b8151811015620002fe576000828281518110620001be57620001bd62000b31565b5b602002602001015190506040518060800160405280826020015181526020018260400151815260200182606001518152602001826080015181525060086000836000015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082015181600001556020820151816001015560408201518160020155606082015181600301908162000271919062000a1b565b50905050806000015160096000600554815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060056000815480929190620002e29062000bca565b9190505550508080620002f59062000bca565b9150506200019c565b5050565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620003438262000316565b9050919050565b620003558162000336565b81146200036157600080fd5b50565b60008151905062000375816200034a565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b620003d08262000385565b810181811067ffffffffffffffff82111715620003f257620003f162000396565b5b80604052505050565b60006200040762000302565b9050620004158282620003c5565b919050565b600067ffffffffffffffff82111562000438576200043762000396565b5b620004438262000385565b9050602081019050919050565b60005b838110156200047057808201518184015260208101905062000453565b60008484015250505050565b6000620004936200048d846200041a565b620003fb565b905082815260208101848484011115620004b257620004b162000380565b5b620004bf84828562000450565b509392505050565b600082601f830112620004df57620004de6200037b565b5b8151620004f18482602086016200047c565b91505092915050565b600067ffffffffffffffff82111562000518576200051762000396565b5b602082029050602081019050919050565b600080fd5b600080fd5b600080fd5b6000819050919050565b6200054d8162000538565b81146200055957600080fd5b50565b6000815190506200056d8162000542565b92915050565b600060a082840312156200058c576200058b6200052e565b5b6200059860a0620003fb565b90506000620005aa8482850162000364565b6000830152506020620005c0848285016200055c565b6020830152506040620005d6848285016200055c565b6040830152506060620005ec848285016200055c565b606083015250608082015167ffffffffffffffff81111562000613576200061262000533565b5b6200062184828501620004c7565b60808301525092915050565b6000620006446200063e84620004fa565b620003fb565b905080838252602082019050602084028301858111156200066a576200066962000529565b5b835b81811015620006b857805167ffffffffffffffff8111156200069357620006926200037b565b5b808601620006a2898262000573565b855260208501945050506020810190506200066c565b5050509392505050565b600082601f830112620006da57620006d96200037b565b5b8151620006ec8482602086016200062d565b91505092915050565b600080600080600060a086880312156200071457620007136200030c565b5b6000620007248882890162000364565b955050602086015167ffffffffffffffff81111562000748576200074762000311565b5b6200075688828901620004c7565b9450506040620007698882890162000364565b935050606086015167ffffffffffffffff8111156200078d576200078c62000311565b5b6200079b88828901620004c7565b925050608086015167ffffffffffffffff811115620007bf57620007be62000311565b5b620007cd88828901620006c2565b9150509295509295909350565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200082d57607f821691505b602082108103620008435762000842620007e5565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620008ad7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826200086e565b620008b986836200086e565b95508019841693508086168417925050509392505050565b6000819050919050565b6000620008fc620008f6620008f08462000538565b620008d1565b62000538565b9050919050565b6000819050919050565b6200091883620008db565b62000930620009278262000903565b8484546200087b565b825550505050565b600090565b6200094762000938565b620009548184846200090d565b505050565b5b818110156200097c57620009706000826200093d565b6001810190506200095a565b5050565b601f821115620009cb57620009958162000849565b620009a0846200085e565b81016020851015620009b0578190505b620009c8620009bf856200085e565b83018262000959565b50505b505050565b600082821c905092915050565b6000620009f060001984600802620009d0565b1980831691505092915050565b600062000a0b8383620009dd565b9150826002028217905092915050565b62000a2682620007da565b67ffffffffffffffff81111562000a425762000a4162000396565b5b62000a4e825462000814565b62000a5b82828562000980565b600060209050601f83116001811462000a93576000841562000a7e578287015190505b62000a8a8582620009fd565b86555062000afa565b601f19841662000aa38662000849565b60005b8281101562000acd5784890151825560018201915060208501945060208101905062000aa6565b8683101562000aed578489015162000ae9601f891682620009dd565b8355505b6001600288020188555050505b505050505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600062000b9c8262000538565b915062000ba98362000538565b925082820190508082111562000bc45762000bc362000b60565b5b92915050565b600062000bd78262000538565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820362000c0c5762000c0b62000b60565b5b600182019050919050565b61181b8062000c276000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806326a4e8d21461005157806348c54b9d1461006d5780639e1a4d1914610077578063af8d201514610095575b600080fd5b61006b60048036038101906100669190610d9a565b6100cb565b005b610075610281565b005b61007f610567565b60405161008c9190610de0565b60405180910390f35b6100af60048036038101906100aa9190610e27565b61071f565b6040516100c2979695949392919061111d565b60405180910390f35b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000015411610150576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610147906111ed565b60405180910390fd5b8060008173ffffffffffffffffffffffffffffffffffffffff163b036101ab576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101a290611259565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461023c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610233906112c5565b60405180910390fd5b81600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b600073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610312576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161030990611331565b60405180910390fd5b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206002015411610397576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161038e9061139d565b60405180910390fd5b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020154905080600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101600082825461043091906113ec565b925050819055506000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600201819055506000600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb30846040518363ffffffff1660e01b81526004016104de929190611420565b6020604051808303816000875af11580156104fd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105219190611481565b905080610563576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161055a906114fa565b60405180910390fd5b5050565b60008073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036105f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f090611331565b60405180910390fd5b6000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001541161067e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610675906111ed565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016106d9919061151a565b602060405180830381865afa1580156106f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061071a919061154a565b905090565b600060606000606060008060606000600860003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000154116107b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107a8906111ed565b60405180910390fd5b88600554116107f5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107ec906115e9565b60405180910390fd5b6005548811156108055760055497505b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166003600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166004600654600760009054906101000a900460ff1661086c8f8f61099e565b85805461087890611638565b80601f01602080910402602001604051908101604052809291908181526020018280546108a490611638565b80156108f15780601f106108c6576101008083540402835291602001916108f1565b820191906000526020600020905b8154815290600101906020018083116108d457829003601f168201915b5050505050955083805461090490611638565b80601f016020809104026020016040519081016040528092919081815260200182805461093090611638565b801561097d5780601f106109525761010080835404028352916020019161097d565b820191906000526020600020905b81548152906001019060200180831161096057829003601f168201915b50505050509350965096509650965096509650965092959891949750929550565b6060600060055403610a0657600067ffffffffffffffff8111156109c5576109c4611669565b5b6040519080825280602002602001820160405280156109fe57816020015b6109eb610cf2565b8152602001906001900390816109e35790505b509050610cec565b60008073ffffffffffffffffffffffffffffffffffffffff16600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610a64576000610a6d565b610a6c610567565b5b905060008367ffffffffffffffff811115610a8b57610a8a611669565b5b604051908082528060200260200182016040528015610ac457816020015b610ab1610cf2565b815260200190600190039081610aa95790505b50905060008590505b84811015610ce5576000600860006009600085815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020604051806080016040529081600082015481526020016001820154815260200160028201548152602001600382018054610b8290611638565b80601f0160208091040260200160405190810160405280929190818152602001828054610bae90611638565b8015610bfb5780601f10610bd057610100808354040283529160200191610bfb565b820191906000526020600020905b815481529060010190602001808311610bde57829003601f168201915b505050505081525050905060008160200151600654836000015187610c209190611698565b610c2a9190611709565b610c34919061173a565b90506040518060a001604052806009600086815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183600001518152602001836020015181526020018281526020018360600151815250848481518110610cc557610cc461176e565b5b602002602001018190525050508080610cdd9061179d565b915050610acd565b5080925050505b92915050565b6040518060a00160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600081526020016000815260200160008152602001606081525090565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610d6782610d3c565b9050919050565b610d7781610d5c565b8114610d8257600080fd5b50565b600081359050610d9481610d6e565b92915050565b600060208284031215610db057610daf610d37565b5b6000610dbe84828501610d85565b91505092915050565b6000819050919050565b610dda81610dc7565b82525050565b6000602082019050610df56000830184610dd1565b92915050565b610e0481610dc7565b8114610e0f57600080fd5b50565b600081359050610e2181610dfb565b92915050565b60008060408385031215610e3e57610e3d610d37565b5b6000610e4c85828601610e12565b9250506020610e5d85828601610e12565b9150509250929050565b610e7081610d5c565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610eb0578082015181840152602081019050610e95565b60008484015250505050565b6000601f19601f8301169050919050565b6000610ed882610e76565b610ee28185610e81565b9350610ef2818560208601610e92565b610efb81610ebc565b840191505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60028110610f4657610f45610f06565b5b50565b6000819050610f5782610f35565b919050565b6000610f6782610f49565b9050919050565b610f7781610f5c565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b610fb281610d5c565b82525050565b610fc181610dc7565b82525050565b600082825260208201905092915050565b6000610fe382610e76565b610fed8185610fc7565b9350610ffd818560208601610e92565b61100681610ebc565b840191505092915050565b600060a0830160008301516110296000860182610fa9565b50602083015161103c6020860182610fb8565b50604083015161104f6040860182610fb8565b5060608301516110626060860182610fb8565b506080830151848203608086015261107a8282610fd8565b9150508091505092915050565b60006110938383611011565b905092915050565b6000602082019050919050565b60006110b382610f7d565b6110bd8185610f88565b9350836020820285016110cf85610f99565b8060005b8581101561110b57848403895281516110ec8582611087565b94506110f78361109b565b925060208a019950506001810190506110d3565b50829750879550505050505092915050565b600060e082019050611132600083018a610e67565b81810360208301526111448189610ecd565b90506111536040830188610e67565b81810360608301526111658187610ecd565b90506111746080830186610dd1565b61118160a0830185610f6e565b81810360c083015261119381846110a8565b905098975050505050505050565b7f4f6e6c7920666f72207061727469636970616e74000000000000000000000000600082015250565b60006111d7601483610e81565b91506111e2826111a1565b602082019050919050565b60006020820190508181036000830152611206816111ca565b9050919050565b7f417267756d656e74206973206e6f7420636f6e74726163742061646472657373600082015250565b6000611243602083610e81565b915061124e8261120d565b602082019050919050565b6000602082019050818103600083015261127281611236565b9050919050565b7f546f6b656e206164647265737320616c72656164792073657400000000000000600082015250565b60006112af601983610e81565b91506112ba82611279565b602082019050919050565b600060208201905081810360008301526112de816112a2565b9050919050565b7f546f6b656e20636f6e74726163742061646472657373206e6f20736574000000600082015250565b600061131b601d83610e81565b9150611326826112e5565b602082019050919050565b6000602082019050818103600083015261134a8161130e565b9050919050565b7f546865726520617265206e6f7420746f6b656e7320666f7220636c61696d0000600082015250565b6000611387601e83610e81565b915061139282611351565b602082019050919050565b600060208201905081810360008301526113b68161137a565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006113f782610dc7565b915061140283610dc7565b925082820190508082111561141a576114196113bd565b5b92915050565b60006040820190506114356000830185610e67565b6114426020830184610dd1565b9392505050565b60008115159050919050565b61145e81611449565b811461146957600080fd5b50565b60008151905061147b81611455565b92915050565b60006020828403121561149757611496610d37565b5b60006114a58482850161146c565b91505092915050565b7f436c61696d206572726f72000000000000000000000000000000000000000000600082015250565b60006114e4600b83610e81565b91506114ef826114ae565b602082019050919050565b60006020820190508181036000830152611513816114d7565b9050919050565b600060208201905061152f6000830184610e67565b92915050565b60008151905061154481610dfb565b92915050565b6000602082840312156115605761155f610d37565b5b600061156e84828501611535565b91505092915050565b7f226669727374222067726561746572207468616e20636f756e74206f6620706160008201527f727469636970616e747300000000000000000000000000000000000000000000602082015250565b60006115d3602a83610e81565b91506115de82611577565b604082019050919050565b60006020820190508181036000830152611602816115c6565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061165057607f821691505b60208210810361166357611662611609565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b60006116a382610dc7565b91506116ae83610dc7565b92508282026116bc81610dc7565b915082820484148315176116d3576116d26113bd565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061171482610dc7565b915061171f83610dc7565b92508261172f5761172e6116da565b5b828204905092915050565b600061174582610dc7565b915061175083610dc7565b9250828203905081811115611768576117676113bd565b5b92915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60006117a882610dc7565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036117da576117d96113bd565b5b60018201905091905056fea264697066735822122099d54d61abbc05fedb77ba126515cc9485ed545ba31bda6dc72c317a7955b9a164736f6c63430008110033a26469706673582212205902cb08d70fa4bd4ac0834151cbf746a80774141173d32f8bf110149aa5c62d64736f6c63430008110033";

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