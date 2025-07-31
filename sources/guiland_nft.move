module guiland::guiland_nft {
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::resource_account;
    use aptos_framework::object::{Self, Object, ConstructorRef, ExtendRef, BurnRef};
    use aptos_framework::property_map::{Self, PropertyMap};
    use aptos_framework::transfer_policy::{Self, TransferPolicy, TransferPolicyCapability};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::fungible_asset::{Self, FungibleAsset};
    use aptos_framework::fungible_metadata::{Self, FungibleMetadata};
    use aptos_framework::metadata::{Self, MetadataRef};
    use aptos_framework::royalty::{Self, Royalty};
    use aptos_framework::token::{Self, Token, TokenId, TokenRef, TokenStore};
    use aptos_framework::token_store;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::event_store;

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EINVALID_TOKEN_ID: u64 = 2;
    const ETOKEN_NOT_FOUND: u64 = 3;
    const EINSUFFICIENT_BALANCE: u64 = 4;

    /// Events
    struct MintEvent has drop, store {
        token_id: TokenId,
        amount: u64,
        recipient: address,
    }

    struct TransferEvent has drop, store {
        token_id: TokenId,
        amount: u64,
        from: address,
        to: address,
    }

    struct BurnEvent has drop, store {
        token_id: TokenId,
        amount: u64,
        owner: address,
    }

    /// Resource account capabilities
    struct GUILANDNFT has key {
        signer_cap: account::SignerCapability,
        transfer_policy_cap: TransferPolicyCapability<Token>,
        burn_ref: BurnRef,
        extend_ref: ExtendRef,
        constructor_ref: ConstructorRef,
        mint_events: EventHandle<MintEvent>,
        transfer_events: EventHandle<TransferEvent>,
        burn_events: EventHandle<BurnEvent>,
    }

    /// Initialize the GUILAND NFT module
    fun init_module(account: &signer) {
        // Create resource account
        let (resource_signer, signer_cap) = resource_account::create_resource_account(account, string::utf8(b"guiland_nft_seed"));
        
        // Create transfer policy
        let transfer_policy = transfer_policy::create<Token>(&resource_signer, option::none());
        let transfer_policy_cap = transfer_policy::create_policy_cap<Token>(&resource_signer, transfer_policy);

        // Create object
        let constructor_ref = object::create_object_from_account(account);
        let object_signer = object::generate_signer_for_extending(&constructor_ref);
        let transfer_ref = object::generate_transfer_ref_for_extending(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        let burn_ref = object::generate_burn_ref(&constructor_ref);

        // Create token store
        token::initialize_token_store(&object_signer);

        // Create event handles
        let mint_events = event::new_event_handle<MintEvent>(&object_signer);
        let transfer_events = event::new_event_handle<TransferEvent>(&object_signer);
        let burn_events = event::new_event_handle<BurnEvent>(&object_signer);

        // Store capabilities
        move_to(account, GUILANDNFT {
            signer_cap,
            transfer_policy_cap,
            burn_ref,
            extend_ref,
            constructor_ref,
            mint_events,
            transfer_events,
            burn_events,
        });
    }

    /// Mint a new NFT
    public entry fun mint_nft(
        account: &signer,
        name: String,
        description: String,
        uri: String,
        royalty_payee_address: address,
        royalty_points_denominator: u64,
        royalty_points_numerator: u64,
    ) acquires GUILANDNFT {
        let guiland_nft = borrow_global_mut<GUILANDNFT>(@guiland);
        let object_signer = object::generate_signer_for_extending(&guiland_nft.constructor_ref);

        // Create token ID
        let token_data_id = token::create_tokendata(
            &object_signer,
            string::utf8(b"GUILAND NFT"),
            name,
            string::utf8(b"GUILAND NFT Collection"),
            uri,
            royalty_payee_address,
            royalty_points_denominator,
            royalty_points_numerator,
            string::utf8(b"GUILAND"),
            1, // property version
            string::utf8(b""), // property keys
            string::utf8(b""), // property types
            string::utf8(b""), // property values
        );

        let token_id = token::create_tokendata_id(&object_signer, token_data_id);

        // Mint token
        let token = token::mint_token(&object_signer, token_id, 1);
        let token_ref = object::generate_token_ref(&guiland_nft.constructor_ref, token_id);

        // Transfer to caller
        let token_store = token_store::get_token_store<GUILANDNFT>(&account);
        token::deposit_token(&account, token, token_store);

        // Emit event
        event::emit_event(&mut guiland_nft.mint_events, MintEvent {
            token_id,
            amount: 1,
            recipient: account::get_address(account),
        });
    }

    /// Transfer NFT
    public entry fun transfer_nft(
        from: &signer,
        to: address,
        token_id: TokenId,
        amount: u64,
    ) acquires GUILANDNFT {
        let guiland_nft = borrow_global_mut<GUILANDNFT>(@guiland);
        
        // Transfer token
        let token = token::withdraw_token(from, token_id, amount);
        token::deposit_token(&account::create_signer_with_capability(&guiland_nft.signer_cap), token, token_store::get_token_store<GUILANDNFT>(&to));

        // Emit event
        event::emit_event(&mut guiland_nft.transfer_events, TransferEvent {
            token_id,
            amount,
            from: account::get_address(from),
            to,
        });
    }

    /// Burn NFT
    public entry fun burn_nft(
        account: &signer,
        token_id: TokenId,
        amount: u64,
    ) acquires GUILANDNFT {
        let guiland_nft = borrow_global_mut<GUILANDNFT>(@guiland);
        
        // Burn token
        let token = token::withdraw_token(account, token_id, amount);
        token::burn_token(&guiland_nft.burn_ref, token_id, amount, token);

        // Emit event
        event::emit_event(&mut guiland_nft.burn_events, BurnEvent {
            token_id,
            amount,
            owner: account::get_address(account),
        });
    }

    /// Get token balance
    public fun get_token_balance(owner: address, token_id: TokenId): u64 {
        token::balance_of(owner, token_id)
    }

    /// Get token data
    public fun get_token_data(token_id: TokenId): token::TokenData {
        token::get_token_data(token_id)
    }
} 