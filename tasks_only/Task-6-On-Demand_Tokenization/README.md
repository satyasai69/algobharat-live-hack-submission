# Algorand Token Reissuer

This project demonstrates a token reissuance system built on Algorand blockchain. It allows for creating and reissuing tokens with configurable limits and timeframes.

## Features

- Create Algorand Standard Assets (ASA) with custom metadata
- Store token information in MongoDB
- Reissue tokens with configurable limits and timelock periods
- Email-based user identification with secure hashing

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following configuration:
   ```
   # Algorand Configuration
   ALGOD_TOKEN=your_algod_token
   ALGOD_SERVER=http://localhost
   ALGOD_PORT=4001

   # MongoDB Configuration
   MONGO_URI=your_mongodb_connection_string
   MONGO_DB=reissuer

   # Reissue Configuration
   REISSUE_LIMIT=1
   REISSUE_LOCK=86400
   ```

3. Make sure MongoDB is running and accessible

## Usage

### Issue a new token

```
npm run issue
```

This creates a new ASA for a user and stores the token information in MongoDB.

### Reissue a token

```
npm run reissue
```

This creates a new ASA to replace an existing one, with checks for:
- Reissue limits (configurable in .env)
- Timelock period (configurable in .env)

## Project Structure

- `issue.ts` - Script to issue new tokens
- `reissue.ts` - Script to reissue tokens
- `utils.ts` - Utility functions for Algorand operations
- `db.ts` - MongoDB connection and schema
- `types.ts` - TypeScript type definitions
- `metadata.json` - Sample token metadata

## Technical Details

- Built with TypeScript and ES modules
- Uses Algorand SDK for blockchain interactions
- MongoDB for persistent storage
- Configurable reissue limits and timelock periods 