'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { message } from 'antd';

// Типы данных из контракта
export interface Resources {
  gui_tokens: string;
  treats: string;
  crystals: string;
  loyalty_points: string;
}

export interface Stats {
  attack: string;
  defense: string;
  speed: string;
  leadership: string;
  strategy: string;
  economy: string;
}

export interface Player {
  level: string;
  experience: string;
  resources: Resources;
  stats: Stats;
  guild_id: string | null;
  last_battle: string;
  reputation: string;
  territories_owned: string[];
  equipment: string[];
}

export interface Territory {
  id: string;
  name: string;
  terrain_type: string;
  owner: string | null;
  guild_id: string | null;
  defense_rating: string;
  resource_multiplier: string;
  buildings: Record<string, string>;
  last_collected: string;
}

export interface Guild {
  id: string;
  name: string;
  leader: string;
  members: string[];
  treasury: Resources;
  territories: string[];
  level: string;
  creation_time: string;
  tax_rate: string;
}

export interface Equipment {
  id: string;
  name: string;
  item_type: string;
  rarity: string;
  enhancement_level: string;
  stats_bonus: Stats;
  owner: string;
  durability: string;
}

export interface BattleResult {
  attacker: string;
  defender: string;
  winner: string;
  attacker_losses: string;
  defender_losses: string;
  resources_gained: Resources;
  timestamp: string;
}

export function useGameContract() {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [player, setPlayer] = useState<Player | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [gameStats, setGameStats] = useState<{ total_players: string; total_guilds: string; paused: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false); // Флаг для предотвращения повторных вызовов
  const hasLoadedData = useRef(false); // Отслеживаем, была ли уже выполнена загрузка

  // Адрес контракта
  const CONTRACT_ADDRESS = '0xfd543cfe86eba6cd15d89deccaae5c791db4ca17979bb62703ca6891f87008e4';
  const MODULE_NAME = 'game_core';

  // Загрузка данных игрока
  const loadPlayerData = useCallback(async () => {
    if (!connected || !account) {
      console.log('loadPlayerData: кошелек не подключен или нет аккаунта');
      return;
    }
    
    // Для демо режима создаем фиктивные данные
    if (account.address === '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef') {
      console.log('Демо режим: создаем фиктивные данные игрока');
      const demoPlayer = {
        level: '1',
        experience: '0',
        resources: {
          gui_tokens: '1000',
          treats: '100',
          crystals: '10',
          loyalty_points: '0',
        },
        stats: {
          attack: '10',
          defense: '10',
          speed: '10',
          leadership: '10',
          strategy: '10',
          economy: '10',
        },
        guild_id: null,
        last_battle: '0',
        reputation: '0',
        territories_owned: [],
        equipment: [],
      };
      setPlayer(demoPlayer);
      return;
    }

    console.log('Начинаем загрузку данных игрока для адреса:', account.address);
    console.log('Текущее состояние player перед загрузкой:', player);
    console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
    console.log('account.address === CONTRACT_ADDRESS:', account.address === CONTRACT_ADDRESS);
    
    // Проверяем, что адрес кошелька не равен адресу контракта
    if (account.address === CONTRACT_ADDRESS) {
      console.error('ОШИБКА: Адрес кошелька равен адресу контракта!');
      console.error('Это означает, что кошелек не подключен правильно или используется демо режим');
      setPlayer(null);
      return;
    }

    let playerExists = false;

    try {
      // Сначала проверяем, существует ли игрок
      const existsResponse = await fetch(`/api/aptos/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::player_exists`,
          type_arguments: [],
          arguments: [account.address],
        }),
      });

      if (existsResponse.ok) {
        const existsData = await existsResponse.json();
        console.log('Проверка существования игрока:', existsData);
        
        if (!existsData.result) {
          console.log('Игрок не существует');
          setPlayer(null);
          return;
        }
        playerExists = true;
      }

      // Пробуем напрямую загрузить данные игрока
      const response = await fetch(`/api/aptos/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_player_info`,
          type_arguments: [],
          arguments: [account.address],
        }),
      });

      console.log('Ответ API:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Данные от API:', data);
        console.log('data.result:', data.result);
        console.log('data.result type:', typeof data.result);
        console.log('data.result length:', data.result?.length);
        console.log('data keys:', Object.keys(data));
        
        // Проверяем разные возможные структуры ответа
        const resultData = data.result || data.data || data;
        console.log('resultData:', resultData);
        
        if (resultData && Array.isArray(resultData) && resultData.length > 0) {
          console.log('Структура resultData:', resultData);
          console.log('Длина resultData:', resultData.length);
          
          // Проверяем, что у нас достаточно данных
          if (resultData.length < 9) {
            console.error('Недостаточно данных в ответе:', resultData);
            setPlayer(null);
            return;
          }
          
          const [level, experience, resources, stats, guildId, lastBattle, reputation, territoriesOwned, equipment] = resultData;
          
          console.log('Распарсенные данные:', {
            level, experience, resources, stats, guildId, lastBattle, reputation, territoriesOwned, equipment
          });
          
          // Проверяем, что resources и stats являются объектами
          if (!resources || typeof resources !== 'object' || !stats || typeof stats !== 'object') {
            console.error('Некорректная структура resources или stats:', { resources, stats });
            setPlayer(null);
            return;
          }
          
          const playerData = {
            level: level.toString(),
            experience: experience.toString(),
            resources: {
              gui_tokens: resources.gui_tokens?.toString() || '0',
              treats: resources.treats?.toString() || '0',
              crystals: resources.crystals?.toString() || '0',
              loyalty_points: resources.loyalty_points?.toString() || '0',
            },
            stats: {
              attack: stats.attack?.toString() || '0',
              defense: stats.defense?.toString() || '0',
              speed: stats.speed?.toString() || '0',
              leadership: stats.leadership?.toString() || '0',
              strategy: stats.strategy?.toString() || '0',
              economy: stats.economy?.toString() || '0',
            },
            guild_id: guildId?.vec?.length > 0 ? guildId.vec[0].toString() : null,
            last_battle: lastBattle.toString(),
            reputation: reputation.toString(),
            territories_owned: territoriesOwned?.map((id: any) => id.toString()) || [],
            equipment: equipment?.map((id: any) => id.toString()) || [],
          };
          
          console.log('Данные игрока загружены:', playerData);
          console.log('Устанавливаем состояние player:', playerData);
          console.log('Текущее состояние player перед установкой:', player);
          setPlayer(playerData);
          console.log('Состояние player установлено');
          
          // Проверяем, что состояние действительно изменилось
          setTimeout(() => {
            console.log('Состояние player после установки:', player);
          }, 100);
        } else {
          console.log('Нет данных игрока в ответе');
          setPlayer(null);
        }
      } else {
        const errorData = await response.json();
        console.error('Ошибка API при загрузке данных игрока:', errorData);
        
        // Если ошибка связана с тем, что игрок не найден, устанавливаем null
        if (errorData.error?.includes('RESOURCE_DOES_NOT_EXIST') || 
            errorData.error?.includes('not found') ||
            errorData.error?.includes('E_PLAYER_NOT_FOUND') ||
            errorData.details?.error_code === 'RESOURCE_DOES_NOT_EXIST') {
          console.log('Игрок не найден, устанавливаем null');
          setPlayer(null);
        } else {
          console.error('Неизвестная ошибка API:', errorData);
          // Если игрок существует, но данные не загружаются, попробуем еще раз
          if (playerExists) {
            setTimeout(() => {
              console.log('Повторная попытка загрузки данных игрока...');
              loadPlayerData();
            }, 2000);
          } else {
            setPlayer(null);
          }
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных игрока:', error);
      setPlayer(null);
    }
  }, [connected, account]);

  // Создание игрока
  const createPlayer = useCallback(async () => {
    if (!connected || !account) {
      message.error('Кошелек не подключен');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::create_player`,
        type_arguments: [],
        arguments: [],
      };

      const result = await signAndSubmitTransaction(payload);
      message.success('Игрок успешно создан!');
      await loadPlayerData();
    } catch (error: any) {
      console.error('Ошибка создания игрока:', error);
      
      // Если игрок уже существует, это не ошибка
      if (error.message?.includes('E_ALREADY_INITIALIZED') || 
          error.message?.includes('already initialized') ||
          error.message?.includes('0x2')) {
        message.info('Игрок уже существует! Загружаем данные...');
        // Принудительно загружаем данные игрока
        await loadPlayerData();
      } else {
        message.error('Ошибка создания игрока');
      }
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction, loadPlayerData]);

  // Сбор ресурсов
  const collectResources = useCallback(async () => {
    if (!connected || !account) {
      message.error('Кошелек не подключен');
      return;
    }

    setLoading(true);
    try {
             const payload = {
         function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::collect_resources`,
         type_arguments: [],
         arguments: [],
       };

      const result = await signAndSubmitTransaction(payload);
      message.success('Ресурсы собраны!');
      await loadPlayerData();
    } catch (error) {
      console.error('Ошибка сбора ресурсов:', error);
      message.error('Ошибка сбора ресурсов');
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction]);

  // Создание гильдии
  const createGuild = useCallback(async (name: string) => {
    if (!connected || !account) {
      message.error('Кошелек не подключен');
      return;
    }

    setLoading(true);
    try {
             const payload = {
         function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::create_guild`,
         type_arguments: [],
         arguments: [name],
       };

      const result = await signAndSubmitTransaction(payload);
      message.success('Гильдия создана!');
      await loadPlayerData();
      await loadGuildsData();
    } catch (error) {
      console.error('Ошибка создания гильдии:', error);
      message.error('Ошибка создания гильдии');
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction]);

  // Присоединение к гильдии
  const joinGuild = useCallback(async (guildId: string) => {
    if (!connected || !account) {
      message.error('Кошелек не подключен');
      return;
    }

    setLoading(true);
    try {
             const payload = {
         function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::join_guild`,
         type_arguments: [],
         arguments: [guildId],
       };

      const result = await signAndSubmitTransaction(payload);
      message.success('Вы присоединились к гильдии!');
      await loadPlayerData();
    } catch (error) {
      console.error('Ошибка присоединения к гильдии:', error);
      message.error('Ошибка присоединения к гильдии');
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction]);

  // Атака территории
  const attackTerritory = useCallback(async (territoryId: string) => {
    if (!connected || !account) {
      message.error('Кошелек не подключен');
      return;
    }

    setLoading(true);
    try {
             const payload = {
         function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::attack_territory`,
         type_arguments: [],
         arguments: [territoryId],
       };

      const result = await signAndSubmitTransaction(payload);
      message.success('Атака выполнена!');
      await loadPlayerData();
      await loadTerritoriesData();
    } catch (error) {
      console.error('Ошибка атаки:', error);
      message.error('Ошибка атаки');
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction]);

  // Загрузка данных территорий
  const loadTerritoriesData = useCallback(async () => {
    try {
      // Загружаем первые 10 территорий (можно сделать пагинацию)
      const territoriesData: Territory[] = [];
      
      for (let i = 1; i <= 5; i++) {
        try {
          console.log(`Загружаем территорию ${i}...`);
          const response = await fetch(`/api/aptos/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
               function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_territory_info`,
               type_arguments: [],
               arguments: [i.toString()],
             }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Территория ${i} данные:`, data);
            
            const resultData = data.result || data.data || data;
            if (resultData && Array.isArray(resultData) && resultData.length >= 5) {
              const [name, terrainType, owner, defenseRating, resourceMultiplier] = resultData;
            
              territoriesData.push({
                id: i.toString(),
                name,
                terrain_type: terrainType.toString(),
                owner: owner?.vec?.length > 0 ? owner.vec[0] : null,
                guild_id: null, // Нужно добавить в view функцию
                defense_rating: defenseRating.toString(),
                resource_multiplier: resourceMultiplier.toString(),
                buildings: {}, // Нужно добавить в view функцию
                last_collected: '0', // Нужно добавить в view функцию
              });
            }
          }
          
          // Добавляем задержку между запросами территорий
          if (i < 5) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Ошибка загрузки территории ${i}:`, error);
        }
      }
      
      setTerritories(territoriesData);
    } catch (error) {
      console.error('Ошибка загрузки территорий:', error);
    }
  }, []);

  // Загрузка данных гильдий
  const loadGuildsData = useCallback(async () => {
    try {
      // Сначала загружаем статистику игры
      const statsResponse = await fetch(`/api/aptos/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_game_stats`,
          type_arguments: [],
          arguments: [],
        }),
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Статистика игры данные:', statsData);
        
        const statsResultData = statsData.result || statsData.data || statsData;
        if (statsResultData && Array.isArray(statsResultData) && statsResultData.length >= 3) {
          const [totalPlayers, totalGuilds, paused] = statsResultData;
        
          setGameStats({
            total_players: totalPlayers.toString(),
            total_guilds: totalGuilds.toString(),
            paused,
          });

          // Загружаем информацию о гильдиях
          const totalGuildsNum = parseInt(totalGuilds.toString());
          const guildsData: Guild[] = [];
          
          for (let i = 1; i <= totalGuildsNum; i++) {
            try {
              const guildResponse = await fetch(`/api/aptos/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::get_guild_info`,
                  type_arguments: [],
                  arguments: [i.toString()],
                }),
              });

              if (guildResponse.ok) {
                const guildData = await guildResponse.json();
                console.log(`Данные гильдии ${i}:`, guildData);
                
                const guildResultData = guildData.result || guildData.data || guildData;
                if (guildResultData && Array.isArray(guildResultData) && guildResultData.length >= 5) {
                  const [name, leader, memberCount, treasury, level] = guildResultData;
                  
                  guildsData.push({
                    id: i.toString(),
                    name: name,
                    leader: leader,
                    members: [], // Пока не загружаем список участников
                    treasury: treasury,
                    territories: [], // Пока не загружаем список территорий
                    level: level.toString(),
                    creation_time: '0', // Пока не доступно в API
                    tax_rate: '0', // Пока не доступно в API
                  });
                }
              }
              
              // Добавляем небольшую задержку между запросами
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.error(`Ошибка загрузки гильдии ${i}:`, error);
            }
          }
          
          setGuilds(guildsData);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных гильдий:', error);
    }
  }, []);

  // Загрузка всех данных
  const loadAllData = useCallback(async () => {
    // Проверяем, не выполняется ли уже загрузка
    if (isLoadingData) {
      console.log('loadAllData уже выполняется, пропускаем');
      return;
    }
    
    // Проверяем, не загружены ли уже данные
    if (hasLoadedData.current) {
      console.log('Данные уже были загружены ранее, пропускаем loadAllData');
      return;
    }
    
    console.log('loadAllData вызван');
    console.log('Текущее состояние player в loadAllData:', player);
    setIsLoadingData(true);
    setLoading(true);
    
    try {
      // Выполняем запросы последовательно, а не параллельно
      console.log('Загружаем данные игрока...');
      await loadPlayerData();
      
      // Добавляем задержку между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Загружаем данные территорий...');
      await loadTerritoriesData();
      
      // Добавляем задержку между запросами
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Загружаем данные гильдий...');
      await loadGuildsData();
      
      console.log('loadAllData завершен успешно');
      console.log('Состояние player после loadAllData:', player);
      hasLoadedData.current = true; // Отмечаем, что данные были загружены
    } catch (error) {
      console.error('Ошибка в loadAllData:', error);
    } finally {
      console.log('Устанавливаем loading в false');
      setLoading(false);
      setIsLoadingData(false);
    }
  }, [loadPlayerData, loadTerritoriesData, loadGuildsData, isLoadingData]);

  // Очистка состояния при отключении кошелька
  useEffect(() => {
    if (!connected) {
      console.log('Кошелек отключен, очищаем состояние игры');
      setPlayer(null);
      setTerritories([]);
      setGuilds([]);
      setGameStats(null);
      setLoading(false);
      setIsLoadingData(false);
      hasLoadedData.current = false; // Сбрасываем флаг загрузки
    }
  }, [connected]);

  // Автозагрузка при подключении кошелька
  useEffect(() => {
    console.log('=== useEffect в useGameContract ===');
    console.log('connected:', connected);
    console.log('account:', account);
    console.log('current player state:', player);
    console.log('isLoadingData:', isLoadingData);
    console.log('hasLoadedData.current:', hasLoadedData.current);
    console.log('===============================');
    
    if (connected && account && !isLoadingData && !hasLoadedData.current) {
      console.log('Кошелек подключен, загружаем данные...');
      loadAllData();
    } else {
      console.log('Кошелек не подключен или нет аккаунта, или данные уже загружаются, или данные уже были загружены');
    }
  }, [connected, account, isLoadingData]);

  // Взносы в гильдию
  const contributeToGuild = useCallback(async (guiAmount: string, treatsAmount: string) => {
    if (!connected || !account) {
      message.error('Кошелек не подключен');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::contribute_to_guild`,
        type_arguments: [],
        arguments: [guiAmount, treatsAmount],
      };

      const result = await signAndSubmitTransaction(payload);
      message.success('Взнос в гильдию успешен!');
      await loadPlayerData();
    } catch (error) {
      console.error('Ошибка взноса в гильдию:', error);
      message.error('Ошибка взноса в гильдию');
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction]);

  // Повышение уровня
  const levelUp = useCallback(async () => {
    if (!connected || !account) {
      message.error('Кошелек не подключен');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        function: `${CONTRACT_ADDRESS}::${MODULE_NAME}::level_up`,
        type_arguments: [],
        arguments: [],
      };

      const result = await signAndSubmitTransaction(payload);
      message.success('Уровень повышен!');
      await loadPlayerData();
    } catch (error) {
      console.error('Ошибка повышения уровня:', error);
      message.error('Ошибка повышения уровня');
    } finally {
      setLoading(false);
    }
  }, [connected, account, signAndSubmitTransaction]);



  return {
    player,
    territories,
    guilds,
    gameStats,
    loading,
    createPlayer,
    collectResources,
    createGuild,
    joinGuild,
    contributeToGuild,
    attackTerritory,
    levelUp,
    loadAllData,
  };
} 