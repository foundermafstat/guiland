module guiland::game_core {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use aptos_std::simple_map::{Self, SimpleMap};
    use aptos_std::math64;
    use aptos_framework::randomness;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::event;

    // ============ КОНСТАНТЫ ============
    const GAME_VERSION: u64 = 1;
    const MAX_GUILD_MEMBERS: u64 = 100;
    const BASE_RESOURCE_RATE: u64 = 100; // GUI токенов в час
    const BATTLE_COOLDOWN: u64 = 3600; // 1 час в секундах
    const MAX_TERRITORIES_PER_GUILD: u64 = 10;

    // ============ КОДЫ ОШИБОК ============
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_INSUFFICIENT_RESOURCES: u64 = 4;
    const E_GUILD_FULL: u64 = 5;
    const E_NOT_GUILD_MEMBER: u64 = 6;
    const E_BATTLE_COOLDOWN: u64 = 7;
    const E_INVALID_TARGET: u64 = 8;
    const E_TERRITORY_OCCUPIED: u64 = 9;
    const E_ENHANCEMENT_FAILED: u64 = 10;

    // ============ СТРУКТУРЫ ДАННЫХ ============
    
    // Основные ресурсы игры
    struct Resources has store, copy, drop {
        gui_tokens: u64,
        treats: u64,
        crystals: u64,
        loyalty_points: u64,
    }

    // Характеристики персонажа/войска
    struct Stats has store, copy, drop {
        attack: u64,
        defense: u64,
        speed: u64,
        leadership: u64,
        strategy: u64,
        economy: u64,
    }

    // Информация об игроке
    struct Player has key {
        level: u64,
        experience: u64,
        resources: Resources,
        stats: Stats,
        guild_id: Option<u64>,
        last_battle: u64,
        reputation: u64,
        territories_owned: vector<u64>,
        equipment: vector<u64>, // NFT ID экипировки
    }

    // Структура гильдии
    struct Guild has store, drop, copy {
        id: u64,
        name: String,
        leader: address,
        members: vector<address>,
        treasury: Resources,
        territories: vector<u64>,
        level: u64,
        creation_time: u64,
        tax_rate: u64, // в процентах (0-15)
    }

    // Территория
    struct Territory has store, drop {
        id: u64,
        name: String,
        terrain_type: u8, // 0=равнина, 1=горы, 2=лес, 3=шахты, 4=порт
        owner: Option<address>,
        guild_id: Option<u64>,
        defense_rating: u64,
        resource_multiplier: u64, // в процентах
        buildings: SimpleMap<String, u64>, // название -> уровень
        last_collected: u64,
    }

    // NFT оружие/экипировка
    struct Equipment has key {
        id: u64,
        name: String,
        item_type: u8, // 0=оружие, 1=доспех, 2=аксессуар
        rarity: u8, // 0=обычный, 1=редкий, 2=эпический, 3=легендарный
        enhancement_level: u64,
        stats_bonus: Stats,
        owner: address,
        durability: u64,
    }

    // Результат битвы
    struct BattleResult has store, drop {
        attacker: address,
        defender: address,
        winner: address,
        attacker_losses: u64,
        defender_losses: u64,
        resources_gained: Resources,
        timestamp: u64,
    }

    // Глобальное состояние игры
    struct GameState has key {
        total_players: u64,
        total_guilds: u64,
        guilds: SimpleMap<u64, Guild>,
        territories: SimpleMap<u64, Territory>,
        next_guild_id: u64,
        next_territory_id: u64,
        next_equipment_id: u64,
        admin: address,
        paused: bool,
    }

    // ============ СОБЫТИЯ ============
    #[event]
    struct PlayerCreated has drop, store {
        player: address,
        timestamp: u64,
    }

    #[event]
    struct GuildCreated has drop, store {
        guild_id: u64,
        leader: address,
        name: String,
        timestamp: u64,
    }

    #[event]
    struct BattleEvent has drop, store {
        attacker: address,
        defender: address,
        result: BattleResult,
    }

    #[event]
    struct TerritoryConquered has drop, store {
        territory_id: u64,
        new_owner: address,
        old_owner: Option<address>,
        timestamp: u64,
    }

    // ============ ФУНКЦИИ ИНИЦИАЛИЗАЦИИ ============
    
    /// Инициализация игры (только админ)
    public entry fun initialize(admin: &signer) acquires GameState {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<GameState>(admin_addr), E_ALREADY_INITIALIZED);

        let game_state = GameState {
            total_players: 0,
            total_guilds: 0,
            guilds: simple_map::create(),
            territories: simple_map::create(),
            next_guild_id: 1,
            next_territory_id: 1,
            next_equipment_id: 1,
            admin: admin_addr,
            paused: false,
        };

        move_to(admin, game_state);
        
        // Создаём начальные территории
        create_initial_territories(admin);
    }

    /// Создание начальных территорий
    fun create_initial_territories(admin: &signer) acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game_state = borrow_global_mut<GameState>(admin_addr);
        
        let territory_names = vector[
            string::utf8(b"Crystal Mines"),
            string::utf8(b"Fertile Plains"),
            string::utf8(b"Mountain Fortress"),
            string::utf8(b"Trading Port"),
            string::utf8(b"Mystic Forest")
        ];

        let i = 0;
        while (i < vector::length(&territory_names)) {
            let territory = Territory {
                id: game_state.next_territory_id,
                name: *vector::borrow(&territory_names, i),
                terrain_type: (i as u8),
                owner: option::none(),
                guild_id: option::none(),
                defense_rating: 50 + (i * 20), // базовая защита
                resource_multiplier: 100 + (i * 25), // множитель ресурсов
                buildings: simple_map::create(),
                last_collected: timestamp::now_seconds(),
            };
            
            simple_map::add(&mut game_state.territories, game_state.next_territory_id, territory);
            game_state.next_territory_id = game_state.next_territory_id + 1;
            i = i + 1;
        };
    }

    // ============ ФУНКЦИИ ИГРОКА ============
    
    /// Создание нового игрока
    public entry fun create_player(account: &signer) acquires GameState {
        let addr = signer::address_of(account);
        assert!(!exists<Player>(addr), E_ALREADY_INITIALIZED);

        let player = Player {
            level: 1,
            experience: 0,
            resources: Resources {
                gui_tokens: 1000, // стартовые токены
                treats: 100,
                crystals: 10,
                loyalty_points: 0,
            },
            stats: Stats {
                attack: 10,
                defense: 10,
                speed: 10,
                leadership: 10,
                strategy: 10,
                economy: 10,
            },
            guild_id: option::none(),
            last_battle: 0,
            reputation: 0,
            territories_owned: vector::empty(),
            equipment: vector::empty(),
        };

        move_to(account, player);

        // Обновляем общую статистику
        let admin_addr = get_admin_address();
        let game_state = borrow_global_mut<GameState>(admin_addr);
        game_state.total_players = game_state.total_players + 1;

        event::emit(PlayerCreated {
            player: addr,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Повышение уровня персонажа
    public entry fun level_up(account: &signer) acquires Player {
        let addr = signer::address_of(account);
        let player = borrow_global_mut<Player>(addr);
        
        let required_exp = calculate_required_experience(player.level);
        assert!(player.experience >= required_exp, E_INSUFFICIENT_RESOURCES);

        player.experience = player.experience - required_exp;
        player.level = player.level + 1;

        // Начисляем стат-поинты в зависимости от уровня
        let stat_points = if (player.level <= 25) { 3 }
        else if (player.level <= 75) { 2 }
        else { 1 };

        // Автораспределение стат-поинтов (можно сделать выбор игрока)
        player.stats.attack = player.stats.attack + stat_points / 3;
        player.stats.defense = player.stats.defense + stat_points / 3;
        player.stats.speed = player.stats.speed + stat_points - (stat_points * 2 / 3);
    }

    /// Сбор ресурсов с территорий
    public entry fun collect_resources(account: &signer) acquires Player, GameState {
        let addr = signer::address_of(account);
        let player = borrow_global_mut<Player>(addr);
        let admin_addr = get_admin_address();
        let game_state = borrow_global_mut<GameState>(admin_addr);

        let current_time = timestamp::now_seconds();
        let total_gui_earned = 0;
        let total_treats_earned = 0;

        let i = 0;
        while (i < vector::length(&player.territories_owned)) {
            let territory_id = *vector::borrow(&player.territories_owned, i);
            let territory = simple_map::borrow_mut(&mut game_state.territories, &territory_id);

            let time_passed = current_time - territory.last_collected;
            let hours_passed = time_passed / 3600;

            if (hours_passed > 0) {
                let base_production = BASE_RESOURCE_RATE * hours_passed;
                let modified_production = base_production * territory.resource_multiplier / 100;
                
                total_gui_earned = total_gui_earned + modified_production;
                total_treats_earned = total_treats_earned + modified_production / 4;
                
                territory.last_collected = current_time;
            };
            i = i + 1;
        };

        player.resources.gui_tokens = player.resources.gui_tokens + total_gui_earned;
        player.resources.treats = player.resources.treats + total_treats_earned;
    }

    // ============ ФУНКЦИИ ГИЛЬДИЙ ============
    
    /// Создание новой гильдии
    public entry fun create_guild(account: &signer, name: String) acquires GameState, Player {
        let addr = signer::address_of(account);
        let player = borrow_global_mut<Player>(addr);
        
        assert!(option::is_none(&player.guild_id), E_NOT_AUTHORIZED);
        assert!(player.resources.gui_tokens >= 10000, E_INSUFFICIENT_RESOURCES);

        let admin_addr = get_admin_address();
        let game_state = borrow_global_mut<GameState>(admin_addr);

        let guild = Guild {
            id: game_state.next_guild_id,
            name,
            leader: addr,
            members: vector[addr],
            treasury: Resources {
                gui_tokens: 10000,
                treats: 1000,
                crystals: 100,
                loyalty_points: 0,
            },
            territories: vector::empty(),
            level: 1,
            creation_time: timestamp::now_seconds(),
            tax_rate: 5, // 5% по умолчанию
        };

        player.resources.gui_tokens = player.resources.gui_tokens - 10000;
        player.guild_id = option::some(game_state.next_guild_id);

        simple_map::add(&mut game_state.guilds, game_state.next_guild_id, guild);
        
        event::emit(GuildCreated {
            guild_id: game_state.next_guild_id,
            leader: addr,
            name: guild.name,
            timestamp: timestamp::now_seconds(),
        });

        game_state.next_guild_id = game_state.next_guild_id + 1;
        game_state.total_guilds = game_state.total_guilds + 1;
    }

    /// Присоединение к гильдии
    public entry fun join_guild(account: &signer, guild_id: u64) acquires Player, GameState {
        let addr = signer::address_of(account);
        let player = borrow_global_mut<Player>(addr);
        
        assert!(option::is_none(&player.guild_id), E_NOT_AUTHORIZED);

        let admin_addr = get_admin_address();
        let game_state = borrow_global_mut<GameState>(admin_addr);
        let guild = simple_map::borrow_mut(&mut game_state.guilds, &guild_id);

        assert!(vector::length(&guild.members) < MAX_GUILD_MEMBERS, E_GUILD_FULL);

        vector::push_back(&mut guild.members, addr);
        player.guild_id = option::some(guild_id);
    }

    /// Взносы в казну гильдии
    public entry fun contribute_to_guild(account: &signer, gui_amount: u64, treats_amount: u64) 
    acquires Player, GameState {
        let addr = signer::address_of(account);
        let player = borrow_global_mut<Player>(addr);
        
        assert!(option::is_some(&player.guild_id), E_NOT_GUILD_MEMBER);
        assert!(player.resources.gui_tokens >= gui_amount, E_INSUFFICIENT_RESOURCES);
        assert!(player.resources.treats >= treats_amount, E_INSUFFICIENT_RESOURCES);

        let guild_id = *option::borrow(&player.guild_id);
        let admin_addr = get_admin_address();
        let game_state = borrow_global_mut<GameState>(admin_addr);
        let guild = simple_map::borrow_mut(&mut game_state.guilds, &guild_id);

        player.resources.gui_tokens = player.resources.gui_tokens - gui_amount;
        player.resources.treats = player.resources.treats - treats_amount;
        
        guild.treasury.gui_tokens = guild.treasury.gui_tokens + gui_amount;
        guild.treasury.treats = guild.treasury.treats + treats_amount;

        // Начисляем очки лояльности
        player.resources.loyalty_points = player.resources.loyalty_points + gui_amount / 100;
    }

    // ============ БОЕВАЯ СИСТЕМА ============
    
    /// Атака на территорию (упрощенная версия для деплоя)
    public entry fun attack_territory(account: &signer, territory_id: u64) 
    acquires Player, GameState {
        let addr = signer::address_of(account);
        let player = borrow_global_mut<Player>(addr);
        
        let current_time = timestamp::now_seconds();
        assert!(current_time - player.last_battle >= BATTLE_COOLDOWN, E_BATTLE_COOLDOWN);

        let admin_addr = get_admin_address();
        let game_state = borrow_global_mut<GameState>(admin_addr);
        let territory = simple_map::borrow_mut(&mut game_state.territories, &territory_id);

        // Если территория не занята, автоматически захватываем
        if (option::is_none(&territory.owner)) {
            territory.owner = option::some(addr);
            vector::push_back(&mut player.territories_owned, territory_id);
            
            if (option::is_some(&player.guild_id)) {
                let guild_id = *option::borrow(&player.guild_id);
                territory.guild_id = option::some(guild_id);
                let guild = simple_map::borrow_mut(&mut game_state.guilds, &guild_id);
                vector::push_back(&mut guild.territories, territory_id);
            };

            event::emit(TerritoryConquered {
                territory_id,
                new_owner: addr,
                old_owner: option::none(),
                timestamp: current_time,
            });
            return
        };

        // Упрощенная логика: просто обновляем время последней битвы
        player.last_battle = current_time;
        
        // TODO: Реализовать полную боевую систему после деплоя
    }

    // ============ СИСТЕМА NFT ============
    
    /// Создание оружия/экипировки (только админ)
    #[lint::allow_unsafe_randomness]
    public entry fun mint_equipment(
        admin: &signer,
        recipient: address,
        name: String,
        item_type: u8,
        rarity: u8
    ) acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game_state = borrow_global_mut<GameState>(admin_addr);
        assert!(admin_addr == game_state.admin, E_NOT_AUTHORIZED);

        // Генерируем случайные характеристики на основе редкости
        let base_stats = if (rarity == 0) { 10 } // обычный
        else if (rarity == 1) { 20 } // редкий
        else if (rarity == 2) { 40 } // эпический
        else if (rarity == 3) { 80 } // легендарный
        else { 10 };

        let equipment = Equipment {
            id: game_state.next_equipment_id,
            name,
            item_type,
            rarity,
            enhancement_level: 0,
            stats_bonus: Stats {
                attack: base_stats + randomness::u64_range(0, base_stats / 2),
                defense: base_stats + randomness::u64_range(0, base_stats / 2),
                speed: base_stats + randomness::u64_range(0, base_stats / 2),
                leadership: base_stats + randomness::u64_range(0, base_stats / 2),
                strategy: base_stats + randomness::u64_range(0, base_stats / 2),
                economy: base_stats + randomness::u64_range(0, base_stats / 2),
            },
            owner: recipient,
            durability: 10000,
        };

        let equipment_obj = object::create_named_object(admin, b"equipment");
        let extend_ref = object::generate_extend_ref(&equipment_obj);
        let equipment_signer = object::generate_signer_for_extending(&extend_ref);
        move_to(&equipment_signer, equipment);

        game_state.next_equipment_id = game_state.next_equipment_id + 1;
    }

    /// Улучшение экипировки
    public entry fun enhance_equipment(account: &signer, equipment_id: u64) 
    acquires Player {
        let addr = signer::address_of(account);
        let player = borrow_global_mut<Player>(addr);
        // TODO: Реализовать правильный доступ к оборудованию по ID
        // Пока что функция закомментирована для упрощения деплоя
        
        /*
        let equipment = borrow_global_mut<Equipment>(equipment_id);
        assert!(equipment.owner == addr, E_NOT_AUTHORIZED);
        */

        /*
        let enhancement_cost = calculate_enhancement_cost(equipment.enhancement_level);
        assert!(player.resources.gui_tokens >= enhancement_cost, E_INSUFFICIENT_RESOURCES);

        let success_rate = calculate_enhancement_success_rate(equipment.enhancement_level);
        let random_roll = randomness::u64_range(1, 100);

        player.resources.gui_tokens = player.resources.gui_tokens - enhancement_cost;

        if (random_roll <= success_rate) {
            // Успешное улучшение
            equipment.enhancement_level = equipment.enhancement_level + 1;
            
            // Увеличиваем характеристики
            let bonus_increase = equipment.enhancement_level * 5;
            equipment.stats_bonus.attack = equipment.stats_bonus.attack + bonus_increase;
            equipment.stats_bonus.defense = equipment.stats_bonus.defense + bonus_increase;
        } else {
            // Неудачное улучшение - возможно понижение уровня
            if (equipment.enhancement_level >= 8) {
                let downgrade_chance = if (equipment.enhancement_level >= 8 && equipment.enhancement_level <= 12) { 25 }
                else if (equipment.enhancement_level >= 13 && equipment.enhancement_level <= 15) { 50 }
                else { 10 };
                
                let downgrade_roll = randomness::u64_range(1, 100);
                if (downgrade_roll <= downgrade_chance && equipment.enhancement_level > 0) {
                    equipment.enhancement_level = equipment.enhancement_level - 1;
                };
            };
        };
        */
    }

    // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
    
    /// Расчёт требуемого опыта для уровня
    fun calculate_required_experience(level: u64): u64 {
        if (level <= 10) { 1000 }
        else if (level <= 25) { 2500 }
        else if (level <= 50) { 5000 }
        else { 10000 }
    }

    /// Расчёт стоимости улучшения
    fun calculate_enhancement_cost(current_level: u64): u64 {
        if (current_level < 5) { 1000 * (current_level + 1) }
        else if (current_level < 10) { 10000 * (current_level - 4) }
        else { 100000 * (current_level - 9) }
    }

    /// Расчёт шанса успеха улучшения
    fun calculate_enhancement_success_rate(current_level: u64): u64 {
        if (current_level < 5) { 90 }
        else if (current_level < 10) { 70 }
        else { 40 }
    }

    /// Получение адреса админа
    fun get_admin_address(): address {
        @guiland
    }

    /// Расчёт результата битвы
    fun calculate_battle(attacker: address, defender: address, territory_id: u64): BattleResult 
    acquires Player, GameState {
        
        // Получаем характеристики атакующего
        let attacker_player = borrow_global<Player>(attacker);
        let attacker_power = attacker_player.stats.attack + attacker_player.stats.strategy;
        
        // Получаем характеристики защитника
        let defender_player = borrow_global<Player>(defender);
        let defender_power = defender_player.stats.defense + defender_player.stats.leadership;
        
        // Добавляем бонус территории для защитника
        let admin_addr = get_admin_address();
        let game_state = borrow_global<GameState>(admin_addr);
        let territory = simple_map::borrow(&game_state.territories, &territory_id);
        let total_defender_power = defender_power + territory.defense_rating;
        
        // Случайный фактор ±20%
        let attacker_final = attacker_power + randomness::u64_range(0, attacker_power / 5);
        let defender_final = total_defender_power + randomness::u64_range(0, total_defender_power / 5);
        
        let winner = if (attacker_final > defender_final) { attacker } else { defender };
        
        // Расчёт потерь (упрощённый)
        let power_diff = if (attacker_final > defender_final) { 
            attacker_final - defender_final 
        } else { 
            defender_final - attacker_final 
        };
        
        let attacker_losses = math64::min(power_diff / 10, attacker_power / 4);
        let defender_losses = math64::min(power_diff / 10, total_defender_power / 4);
        
        // Ресурсы, полученные победителем
        let resources_gained = Resources {
            gui_tokens: power_diff * 10,
            treats: power_diff * 2,
            crystals: power_diff / 10,
            loyalty_points: power_diff / 5,
        };
        
        BattleResult {
            attacker,
            defender,
            winner,
            attacker_losses,
            defender_losses,
            resources_gained,
            timestamp: timestamp::now_seconds(),
        }
    }

    // ============ VIEW ФУНКЦИИ ============
    
    #[view]
    public fun player_exists(player_addr: address): bool {
        exists<Player>(player_addr)
    }
    
    #[view]
    public fun get_player_info(player_addr: address): (u64, u64, Resources, Stats, Option<u64>, u64, u64, vector<u64>, vector<u64>) 
    acquires Player {
        let player = borrow_global<Player>(player_addr);
        (player.level, player.experience, player.resources, player.stats, player.guild_id, player.last_battle, player.reputation, player.territories_owned, player.equipment)
    }

    #[view]
    public fun get_territory_info(territory_id: u64): (String, u8, Option<address>, u64, u64) 
    acquires GameState {
        let admin_addr = get_admin_address();
        let game_state = borrow_global<GameState>(admin_addr);
        let territory = simple_map::borrow(&game_state.territories, &territory_id);
        
        (territory.name, territory.terrain_type, territory.owner, 
         territory.defense_rating, territory.resource_multiplier)
    }

    #[view]
    public fun get_guild_info(guild_id: u64): (String, address, u64, Resources, u64) 
    acquires GameState {
        let admin_addr = get_admin_address();
        let game_state = borrow_global<GameState>(admin_addr);
        let guild = simple_map::borrow(&game_state.guilds, &guild_id);
        
        (guild.name, guild.leader, vector::length(&guild.members), 
         guild.treasury, guild.level)
    }

    #[view]
    public fun get_game_stats(): (u64, u64, bool) acquires GameState {
        let admin_addr = get_admin_address();
        let game_state = borrow_global<GameState>(admin_addr);
        (game_state.total_players, game_state.total_guilds, game_state.paused)
    }

    // ============ АДМИНСКИЕ ФУНКЦИИ ============
    
    public entry fun pause_game(admin: &signer) acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game_state = borrow_global_mut<GameState>(admin_addr);
        assert!(admin_addr == game_state.admin, E_NOT_AUTHORIZED);
        game_state.paused = true;
    }

    public entry fun unpause_game(admin: &signer) acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game_state = borrow_global_mut<GameState>(admin_addr);
        assert!(admin_addr == game_state.admin, E_NOT_AUTHORIZED);
        game_state.paused = false;
    }

    public entry fun emergency_withdraw(admin: &signer, target: address, amount: u64) 
    acquires GameState {
        let admin_addr = signer::address_of(admin);
        let game_state = borrow_global<GameState>(admin_addr);
        assert!(admin_addr == game_state.admin, E_NOT_AUTHORIZED);
        
        // Экстренный вывод средств в критических ситуациях
        // Реализация зависит от используемой системы токенов
    }

    /// Функция для сброса состояния (только для разработки)
    public entry fun reset_game_state(admin: &signer) acquires GameState {
        let admin_addr = signer::address_of(admin);
        if (exists<GameState>(admin_addr)) {
            let GameState { 
                total_players: _, 
                total_guilds: _, 
                guilds: _, 
                territories: _, 
                next_guild_id: _, 
                next_territory_id: _, 
                next_equipment_id: _, 
                admin: _, 
                paused: _ 
            } = move_from<GameState>(admin_addr);
        };
    }
} 