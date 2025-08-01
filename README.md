# GUILAND - Aptos Blockchain Game

A comprehensive blockchain game built on Aptos with guild systems, territory management, NFT equipment, and strategic gameplay mechanics.

## 🎮 Game Overview

GUILAND is a full-stack blockchain game that combines strategic territory control, guild management, and NFT-based equipment systems. Players can create characters, join guilds, conquer territories, and engage in strategic battles while earning resources and building their power.

## 🏗️ Technical Architecture

### Smart Contract Architecture (`sources/game_core.move`)

The game is built on a sophisticated Move smart contract with the following core systems:

#### Core Data Structures

```move
// Player character with stats and resources
struct Player has key {
    level: u64,
    experience: u64,
    resources: Resources,
    stats: Stats,
    guild_id: Option<u64>,
    last_battle: u64,
    reputation: u64,
    territories_owned: vector<u64>,
    equipment: vector<u64>,
}

// Guild system with treasury and member management
struct Guild has store, drop, copy {
    id: u64,
    name: String,
    leader: address,
    members: vector<address>,
    treasury: Resources,
    territories: vector<u64>,
    level: u64,
    creation_time: u64,
    tax_rate: u64,
}

// Territory with resource production and defense
struct Territory has store, drop {
    id: u64,
    name: String,
    terrain_type: u8,
    owner: Option<address>,
    guild_id: Option<u64>,
    defense_rating: u64,
    resource_multiplier: u64,
    buildings: SimpleMap<String, u64>,
    last_collected: u64,
}
```

#### Game Mechanics Implementation

**1. Resource System**
- **GUI Tokens**: Primary currency for transactions and guild creation
- **Treats**: Secondary resource for guild contributions
- **Crystals**: Premium resource for equipment enhancement
- **Loyalty Points**: Guild contribution tracking

**2. Character Progression**
- Experience-based leveling system
- Automatic stat point distribution
- Level-based experience requirements
- Reputation system for social interactions

**3. Guild Management**
- Creation cost: 10,000 GUI tokens
- Maximum 100 members per guild
- Treasury system with tax rates (0-15%)
- Territory ownership tracking
- Member management with leader controls

**4. Territory Control**
- 5 initial territories with different terrain types
- Resource production based on time and multipliers
- Defense ratings for battle calculations
- Building system for territory improvements

**5. Battle System**
- Cooldown-based combat (1 hour between battles)
- Stat-based battle calculations with randomness
- Territory defense bonuses
- Resource rewards for victories

**6. NFT Equipment System**
- Rarity-based equipment generation (Common, Rare, Epic, Legendary)
- Enhancement system with success/failure mechanics
- Durability system
- Stat bonuses for character progression

#### Smart Contract Functions

**Player Management**
```move
public entry fun create_player(account: &signer)
public entry fun level_up(account: &signer)
public entry fun collect_resources(account: &signer)
```

**Guild Operations**
```move
public entry fun create_guild(account: &signer, name: String)
public entry fun join_guild(account: &signer, guild_id: u64)
public entry fun contribute_to_guild(account: &signer, gui_amount: u64, treats_amount: u64)
```

**Territory Control**
```move
public entry fun attack_territory(account: &signer, territory_id: u64)
```

**NFT Equipment**
```move
public entry fun mint_equipment(admin: &signer, recipient: address, name: String, item_type: u8, rarity: u8)
public entry fun enhance_equipment(account: &signer, equipment_id: u64)
```

### Frontend Architecture

#### Technology Stack
- **Framework**: Next.js 14 with App Router
- **UI Library**: Ant Design 5.12.0
- **Styling**: Tailwind CSS 3.3.0
- **Blockchain Integration**: Aptos TypeScript SDK 3.1.3
- **Wallet Support**: Multiple wallet adapters (Petra, Martian, Pontem, Nightly)
- **Language**: TypeScript 5.0.0

#### Key Components

**1. Wallet Integration (`src/components/WalletProvider.tsx`)**
- Multi-wallet support with fallback to demo mode
- Network switching (testnet/mainnet)
- Transaction signing and submission
- Connection state management

**2. Game Contract Hook (`src/hooks/useGameContract.ts`)**
- Smart contract interaction abstraction
- Player data management
- Real-time state synchronization
- Error handling and retry logic

**3. API Layer (`src/app/api/aptos/view/route.ts`)**
- Proxy for Aptos view function calls
- Rate limiting and error handling
- Response caching and optimization
- Network request management

**4. Game Interface (`src/app/game/page.tsx`)**
- Tabbed interface for different game systems
- Real-time data display
- Interactive controls for all game actions
- Responsive design for multiple screen sizes

#### State Management

The application uses React hooks for state management with the following patterns:

```typescript
// Game state management
const [player, setPlayer] = useState<Player | null>(null);
const [territories, setTerritories] = useState<Territory[]>([]);
const [guilds, setGuilds] = useState<Guild[]>([]);
const [gameStats, setGameStats] = useState<GameStats | null>(null);

// Loading states
const [loading, setLoading] = useState(false);
const [isLoadingData, setIsLoadingData] = useState(false);
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Aptos CLI
- Aptos wallet (Petra, Martian, Pontem, or Nightly)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd guiland

# Install dependencies
npm install

# Install Aptos CLI (Windows)
winget install Aptos.AptosCLI

# Or via npm
npm install -g @aptos-labs/aptos-cli
```

### Smart Contract Deployment

#### Automated Deployment (Recommended)

```bash
# Run deployment script
.\scripts\deploy.ps1
```

#### Manual Deployment

```bash
# 1. Initialize Aptos CLI
npm run aptos:init

# 2. Get test tokens
npm run account:fund

# 3. Compile contract
npm run compile

# 4. Deploy contract
npm run deploy

# 5. Initialize game (after getting contract address)
npm run init
```

### Frontend Development

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` based on `env.example`:

```env
APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
CONTRACT_ADDRESS=your_contract_address
MODULE_NAME=guiland::game_core
NEXT_PUBLIC_APTOS_NETWORK=testnet
```

### Supported Wallets

- **Petra Wallet**: Primary Aptos wallet
- **Martian Wallet**: Alternative Aptos wallet
- **Pontem Wallet**: Aptos ecosystem wallet
- **Nightly Wallet**: Development wallet
- **Demo Mode**: For testing without wallet

## 🎯 Game Features

### Core Gameplay

**Character System**
- Create and customize characters
- Level up with experience points
- Distribute stat points automatically
- Build reputation through actions

**Resource Management**
- Collect GUI tokens from territories
- Earn treats and crystals
- Contribute to guild treasury
- Manage loyalty points

**Guild System**
- Create guilds with 10,000 GUI tokens
- Manage up to 100 members
- Control territory ownership
- Set tax rates for treasury

**Territory Control**
- Conquer 5 different terrain types
- Build defensive structures
- Generate resources over time
- Strategic positioning

**Combat System**
- Stat-based battle calculations
- Territory defense bonuses
- Cooldown periods between battles
- Resource rewards for victories

**NFT Equipment**
- Rarity-based equipment generation
- Enhancement system with risks
- Durability management
- Stat bonuses for characters

### Advanced Mechanics

**Economic System**
- Resource production rates
- Guild tax collection
- Territory resource multipliers
- Market dynamics

**Social Features**
- Guild member management
- Leader controls and permissions
- Alliance and war declarations
- Event creation and management

**Strategic Elements**
- Territory defense optimization
- Resource allocation strategies
- Guild cooperation mechanics
- Battle timing and coordination

## 📊 Technical Specifications

### Smart Contract Metrics

- **Total Lines**: 709 lines of Move code
- **Functions**: 25+ public functions
- **Events**: 4 event types for tracking
- **Data Structures**: 8 core structures
- **Error Codes**: 10+ error handling codes

### Performance Characteristics

- **Transaction Speed**: Sub-second finality
- **Scalability**: Aptos parallel execution
- **Gas Efficiency**: Optimized Move code
- **Storage**: Efficient resource management

### Security Features

- **Access Control**: Admin-only functions
- **Input Validation**: Comprehensive checks
- **Error Handling**: Detailed error codes
- **Resource Safety**: Move's built-in safety

## 🧪 Testing

```bash
# Move contract tests
npm run test:move

# JavaScript tests
npm test

# Linting
npm run lint
```

## 📚 API Reference

### View Functions (Read-Only)

```typescript
// Player information
get_player_info(address: string): Player

// Territory details
get_territory_info(territoryId: number): Territory

// Guild information
get_guild_info(guildId: number): Guild

// Game statistics
get_game_stats(): GameStats
```

### Entry Functions (State-Changing)

```typescript
// Player actions
create_player(): void
level_up(): void
collect_resources(): void

// Guild operations
create_guild(name: string): void
join_guild(guildId: string): void
contribute_to_guild(guiAmount: string, treatsAmount: string): void

// Territory control
attack_territory(territoryId: string): void

// Equipment management
mint_equipment(recipient: string, name: string, itemType: number, rarity: number): void
enhance_equipment(equipmentId: string): void
```

## 🚀 Production Deployment

### Mainnet Deployment

1. Update `Move.toml` for mainnet configuration
2. Change environment variables to mainnet
3. Deploy with mainnet profile
4. Update contract address in frontend code

### Monitoring and Maintenance

- Transaction monitoring
- Error tracking and alerting
- Performance metrics
- User analytics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License

## 🆘 Support

- **Documentation**: [deploy.md](./deploy.md)
- **Issues**: GitHub Issues
- **Community**: Discord server

## 🔮 Roadmap

### Phase 1: Core Systems ✅
- Basic player management
- Guild system
- Territory control
- Resource collection

### Phase 2: Advanced Features 🚧
- Enhanced battle system
- NFT marketplace
- Advanced guild features
- Mobile optimization

### Phase 3: Expansion 📋
- Additional territories
- New equipment types
- Tournament system
- Cross-chain integration 