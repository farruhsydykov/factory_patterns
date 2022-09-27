# Factory Patters

This repo demonstrates factory patterns.

### Reads:
[Contract factories and clones  #2](https://soliditydeveloper.com/clonefactory)
- This article shows how contract factories work and dives deeper in clone factories. I recommend this article over the next one because it also shows a need of replacing `constructor` with an `initialize` function in implementation contracts.
- __IMPORTANT:__ A repo with CloneFactory given in this article is outdates, I recommend using OpenZeppelin's Clones library

[EIP-1167: Minimal Proxy Contract](https://eips.ethereum.org/EIPS/eip-1167)
- This is required to understand why OpenZeppelin's Clone factory functions work the way they work.
    TL;DR: Minimal proxy is SO MINIMAL that the exact code of a contract that delegates any all to the implementation address is: - "363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3" where bytes 10-29 (bebebebe...) represent the implementation address. To be honest it took me some time to understant why the hell Clone library's functions did not copy proxy's implementation -_-

[Learn Solidity: The Factory Pattern](https://betterprogramming.pub/learn-solidity-the-factory-pattern-75d11c3e7d29)
- __IMPORTANT:__ A repo with CloneFactory given in this article is outdates, I recommend using OpenZeppelin's Clones library

[Diving into Smart Contract’s Minimal Proxy “EIP-1167”](https://medium.com/coinmonks/diving-into-smart-contracts-minimal-proxy-eip-1167-3c4e7f1a41b8)
- This article opens up `initialize` function 

[DelegateCall: Calling Another Contract Function in Solidity](https://medium.com/coinmonks/delegatecall-calling-another-contract-function-in-solidity-b579f804178c)
- Deep dive to `delegateCall()`

# TODO:
- Add clone factories and test them
- Write a short article on this topic