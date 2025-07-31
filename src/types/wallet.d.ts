declare global {
  interface Window {
    petra?: {
      isConnected: () => boolean;
      connect: () => Promise<{ address: string }>;
      disconnect: () => Promise<void>;
      account: () => Promise<{ address: string }>;
      signAndSubmitTransaction: (payload: any) => Promise<any>;
      signTransaction: (payload: any) => Promise<any>;
      signMessage: (message: string) => Promise<any>;
    };
    martian?: {
      isConnected: () => boolean;
      connect: () => Promise<{ address: string }>;
      disconnect: () => Promise<void>;
      account: () => Promise<{ address: string }>;
      signAndSubmitTransaction: (payload: any) => Promise<any>;
    };
    pontem?: {
      isConnected: () => boolean;
      connect: () => Promise<{ address: string }>;
      disconnect: () => Promise<void>;
      account: () => Promise<{ address: string }>;
      signAndSubmitTransaction: (payload: any) => Promise<any>;
    };
    nightly?: {
      isConnected: () => boolean;
      connect: () => Promise<{ address: string }>;
      disconnect: () => Promise<void>;
      account: () => Promise<{ address: string }>;
      signAndSubmitTransaction: (payload: any) => Promise<any>;
    };
  }
}

export {}; 