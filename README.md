# libp2p test project

Nothing to see here...  This is an incomplete experimental prototype.  There's nothing to use here.

## Proposal 0 (stupid)

- every node accepts sets for all keys
- node responds if it has a value for a key and if not, broadcasts and returns the first response

### Issues

- What happens if QmAlice responds with value for Key1(v1) before QmBruce can respond with Key1(v2)?
- should everyone be allowed to write?
- overwriting a key might be considered an attack vector

## Proposal 1 (unworkable)

### Overview

- each node becomes an authority for a key
- nodes will periodically broadcast their keys to their peers?
- if a request comes in for an unknown key, broadcast for it?
- timestamp is set with the value.  newest wins

### Issues

- overwrite attack - a key can be overwritten by anyone with anything

## Proposal 2 (undecided)

### Overview

- set requests are sent via signed requests
- key is stored with the public key for the signer for verification
- only the signer can alter the value
- if a key is requested and the node doesn't have the value, the node broadcasts and if it gets a response, stores values for requested keys
- if there's a collision, lowest UTC timestamp wins

### Issues

- fraudulent timestamps provided by nodes - possibly mitigated by signature including timestamp?

## Proposal 3 (doable)

### Overview

- set requests are sent via signed requests
- key is stored with the public key for the signer
- requests must be accompanied with a public key to fetch (keys are actually [pubkey+key])

### Issues

- Limited use cases.  Requester must know pubkey before making the request

## Proposal 4 (meh)

### Overview

- keys are set per node and use a multiaddr for a fully qualified key e.g /ip4/0.0.0.0/tcp/7755/QmXB5qhDpfHdYcySFL9YDBUrv1aA9y7mA5w93vZbuzhPXb/k2v/Key1
- setters must be authenticatedand authorized per node, each one has permissioned writers

### Issues

- Limited use cases.  Requester must know what node the key is set on
- Mildly Centralized.  If a node is known, why not just ask the node directly?
