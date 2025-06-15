# Algorand Marketplace v1.0.1

A full-stack decentralized marketplace application built on Algorand blockchain using AlgoKit. This platform enables users to create, list, buy, and sell digital assets in a secure and decentralized environment.

## Features

- Create and manage digital assets on Algorand blockchain
- List assets for sale with customizable pricing
- Place bids and make offers on listed assets
- Secure transaction processing through smart contracts
- User-friendly interface for marketplace interactions
- Wallet integration for seamless asset management

## Architecture

### Smart Contracts

- Asset creation and management
- Marketplace operations (listing, bidding, buying)
- Escrow management for secure transactions
- Transaction verification and processing

### Frontend Application

- React-based user interface with modern design
- Real-time asset listing and price updates
- Integrated wallet connection
- Transaction history and portfolio tracking

## Setup

### Prerequisites

1. Install [Docker](https://www.docker.com/)
2. Install [AlgoKit](https://github.com/algorandfoundation/algokit-cli#install)
3. Basic understanding of Algorand blockchain and smart contracts

### Initial Setup

1. Clone this repository to your local machine
2. Run `algokit project bootstrap all` to install dependencies and set up the environment
3. Execute `algokit generate env-file -a target_network localnet` in the `marketplace-contracts` directory
4. Build the project with `algokit project run build`

### Project Structure

This project is organized as a monorepo with two main components:

- Smart Contracts: [marketplace-contracts](projects/marketplace-contracts/README.md)
- Frontend Application: [marketplace-frontend](projects/marketplace-frontend/README.md)

## Development

### Tools and Technologies

- **Backend**: Python, AlgoKit, Poetry
- **Frontend**: React, TailwindCSS, daisyUI
- **Testing**: pytest, jest, playwright
- **Quality**: Black, ESLint, Prettier

### VS Code Integration

Preconfigured development environment for VS Code users:

- Smart contract development tools
- Frontend development extensions
- Debugging configurations

## Deployment

### Local Development

1. Start the local network: `algokit localnet start`
2. Deploy contracts: `algokit deploy localnet`
3. Launch frontend: Navigate to marketplace-frontend and run `npm start`

### TestNet Deployment

- Smart contracts are deployed to TestNet via AlgoNode
- Frontend can be deployed to Netlify, Vercel, or similar platforms
- CI/CD workflows handle automated deployments

## Integration

### Smart Contract Integration

1. Contract artifacts are automatically generated during build
2. TypeScript clients are created in `frontend/src/contracts`
3. Example interactions available in `AppCalls.tsx`

### Wallet Connection

- Supports multiple Algorand wallets
- Secure transaction signing
- Balance and asset management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.
