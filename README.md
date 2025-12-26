# Attendance NFT - Proof of Attendance Smart Contract

A Clarity smart contract on the Stacks blockchain that enables event organizers to issue verifiable attendance NFTs to attendees. Built on the SIP-009 NFT standard, this contract provides a secure and transparent way to prove attendance at events.

## Overview

Attendance NFT is a blockchain-based solution for creating and managing event attendance credentials. Instead of traditional certificates or tickets, attendees receive non-fungible tokens (NFTs) that prove their presence at an event, making attendance verifiable and transferable on the blockchain.

### Key Features

- **Event Management**: Create events with customizable details (name, date, max attendees)
- **NFT Minting**: Issue unique attendance NFTs to verified attendees
- **SIP-009 Compliant**: Implements the standard Stacks NFT trait for compatibility
- **Transfer Support**: NFT holders can transfer their attendance tokens
- **Duplicate Prevention**: Prevents issuing multiple NFTs to the same attendee for an event
- **Event Capacity Control**: Enforce maximum attendee limits per event
- **Attendance Verification**: Query functions to verify attendance at specific events
- **Metadata Support**: Include token URIs for NFT metadata and visual representation

## Contract Architecture

### Data Structures

**Events Map**: Stores event details including:
- Event name
- Organizer principal address
- Event date
- Maximum attendees allowed
- Issued token count
- Active status

**Attendance Records**: Tracks which attendees received NFTs for specific events:
- Event ID and attendee address
- Token ID of the issued NFT
- Issuance timestamp

**Token-to-Event Map**: Maps each NFT token ID to its corresponding event for easy lookup

### Core Functions

#### Public Functions (State-Changing)

- `create-event(name, date, max-attendees)` - Create a new event
- `issue-attendance(event-id, attendee)` - Issue an NFT to an attendee (organizer only)
- `close-event(event-id)` - Close an event to stop issuing new NFTs (organizer only)
- `transfer(token-id, sender, recipient)` - Transfer an attendance NFT (SIP-009 standard)
- `set-base-uri(new-uri)` - Update the base URI for token metadata

#### Read-Only Functions

- `get-event(event-id)` - Retrieve event details
- `get-attendance-record(event-id, attendee)` - Get attendance record for an attendee
- `has-attended(event-id, attendee)` - Check if someone attended an event
- `get-event-for-token(token-id)` - Find which event an NFT belongs to
- `get-owner(token-id)` - Get the owner of an attendance NFT (SIP-009)
- `get-token-uri(token-id)` - Get metadata URI for an NFT (SIP-009)
- `get-last-token-id()` - Get the total number of NFTs minted
- `get-event-count()` - Get the total number of events created

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- [Clarinet](https://docs.hiro.so/stacks/clarinet) - Clarity smart contract development toolkit

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd attendance-nft
```

2. Install dependencies:
```bash
npm install
```

3. Verify the contract compiles:
```bash
clarinet check
```

## Usage

### Development & Testing

Run the test suite:
```bash
npm test
```

Run the Clarinet console for interactive testing:
```bash
clarinet console
```

### Deploying the Contract

#### Testnet Deployment
```bash
clarinet deployment generate --testnet
```

#### Mainnet Deployment
```bash
clarinet deployment generate --mainnet --low-cost
```

## Example Workflow

### 1. Create an Event
Event organizer calls `create-event` to set up a new event:
```
create-event "Tech Conference 2024" 1000000 100
→ Returns: event-id = 1
```

### 2. Issue Attendance NFTs
After the event, the organizer issues NFTs to attendees:
```
issue-attendance 1 'SP2ABC...XYZ (attendee principal)
→ Returns: token-id = 1
```

### 3. Verify Attendance
Anyone can verify if an address attended an event:
```
has-attended 1 'SP2ABC...XYZ
→ Returns: true
```

### 4. Transfer NFT
An attendee can transfer their attendance NFT to another user:
```
transfer 1 'SP2ABC...XYZ 'SP2NEW...USER
```

## Technical Details

### SIP-009 NFT Standard

This contract fully implements the SIP-009 standard, meaning:
- It can be listed on Stacks NFT marketplaces
- It's compatible with wallet applications that support SIP-009 tokens
- NFTs are transferable and verifiable across the ecosystem

### Trait Requirements

The contract depends on the mainnet NFT trait:
```
SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait
```

This is configured in `Clarinet.toml` and automatically resolved when deploying to mainnet.

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 100 | ERR-NOT-AUTHORIZED | Caller is not authorized to perform this action |
| 101 | ERR-NOT-TOKEN-OWNER | Caller does not own the token |
| 102 | ERR-EVENT-NOT-FOUND | Event does not exist |
| 103 | ERR-EVENT-CLOSED | Event is closed and not accepting new NFTs |
| 104 | ERR-ALREADY-ATTENDED | Attendee already received an NFT for this event |
| 105 | ERR-MAX-ATTENDEES-REACHED | Event has reached maximum attendee capacity |
| 106 | ERR-INVALID-EVENT-DATA | Invalid event input data |

## Project Structure

```
attendance-nft/
├── contracts/
│   └── attendance-nft.clar          # Main smart contract
├── tests/
│   └── attendance-nft.test.ts       # TypeScript unit tests
├── deployments/
│   ├── default.simnet-plan.yaml     # Simnet deployment configuration
│   └── default.mainnet-plan.yaml    # Mainnet deployment configuration
├── settings/
│   ├── Devnet.toml                  # Devnet configuration
│   └── Mainnet.toml                 # Mainnet configuration
├── Clarinet.toml                    # Project configuration
├── package.json                     # Node.js dependencies
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

## Security Considerations

- **Organizer-Only Actions**: Only the event organizer can issue NFTs and close events
- **Duplicate Prevention**: Attendees cannot receive multiple NFTs for the same event
- **Capacity Enforcement**: Maximum attendee limits are strictly enforced
- **Immutable Records**: Once issued, attendance records are permanent on the blockchain

## Future Enhancements

- Batch NFT minting for large events
- Event metadata standards (description, location, organizer details)
- Attendance verification via QR codes or signatures
- Royalty support for NFT resales
- DAO governance for contract upgrades

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue or submit a pull request on the repository.

## References

- [Stacks Documentation](https://docs.stacks.co/)
- [SIP-009 NFT Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md)
- [Clarity Language Reference](https://docs.stacks.co/reference/clarity)