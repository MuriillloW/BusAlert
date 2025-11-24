import { Injectable, inject } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';


@Injectable({ providedIn: 'root' })
export class BluetoothService {
  // For Web Bluetooth fallback
  private webDevice: any | null = null;
  private webServer: any | null = null;
  // Tenta injetar AndroidPermissions de forma opcional (pode não existir em web)
  private androidPermissions: AndroidPermissions | null = inject(AndroidPermissions, { optional: true }) as any;

  constructor() {}

  private getBluetooth(): any | null {
    const w = window as any;
    return w && w.bluetoothSerial ? w.bluetoothSerial : null;
  }

  private getPermissionsPlugin(): any | null {
    const w = window as any;
    return w && w.plugins && w.plugins.permissions ? w.plugins.permissions : null;
  }

  // Detecta se existe algum mecanismo disponível: plugin clássico, Web Bluetooth, ou cordova
  hasPlugin(): boolean {
    const w = window as any;
    const hasClassic = !!this.getBluetooth();
    const hasWeb = !!(navigator && (navigator as any).bluetooth);
    const hasCordova = !!w.cordova;
    return hasClassic || hasWeb || hasCordova;
  }

  // Lista dispositivos pareados (Cordova Bluetooth Serial) ou solicita dispositivo via Web Bluetooth
  async list(): Promise<any[]> {
    const bt = this.getBluetooth();
    if (bt) {
      return await new Promise<any[]>((resolve, reject) => {
        bt.list((res: any) => resolve(res), (err: any) => reject(err));
      });
    }

    // Fallback: Web Bluetooth (navegador/Capacitor WebView com suporte)
    if (navigator && (navigator as any).bluetooth) {
      try {
        // requestDevice opens a picker and returns a single device selected by the user
        const device = await (navigator as any).bluetooth.requestDevice({ acceptAllDevices: true });
        this.webDevice = device;
        return [{ name: device.name || 'Sem nome', address: device.id }];
      } catch (err) {
        throw err;
      }
    }

    throw new Error('bluetooth-plugin-not-available');
  }

  // Conecta a um endereço Bluetooth (address). Tenta conexão segura, se falhar tenta insegura (comum em HC-05/06)
  async connect(address: string): Promise<void> {
    const bt = this.getBluetooth();
    if (bt) {
      return await new Promise<void>((resolve, reject) => {
        // Tenta conectar (secure)
        bt.connect(address, 
          () => resolve(), 
          (err: any) => {
            console.warn('Conexão segura falhou, tentando insegura...', err);
            // Fallback para conexão insegura
            bt.connectInsecure(address, 
              () => resolve(), 
              (err2: any) => reject(err2)
            );
          }
        );
      });
    }

    if (navigator && (navigator as any).bluetooth) {
      try {
        // On Web Bluetooth we typically need user to pick device. We call requestDevice again
        const device = await (navigator as any).bluetooth.requestDevice({ acceptAllDevices: true });
        this.webDevice = device;
        const server = await device.gatt.connect();
        this.webServer = server;
        return;
      } catch (err) {
        throw err;
      }
    }

    throw new Error('bluetooth-plugin-not-available');
  }

  async disconnect(): Promise<void> {
    const bt = this.getBluetooth();
    if (bt) {
      return await new Promise<void>((resolve, reject) => {
        bt.disconnect(() => resolve(), (err: any) => reject(err));
      });
    }

    if (this.webDevice) {
      try {
        if (this.webDevice.gatt && this.webDevice.gatt.connected) {
          this.webDevice.gatt.disconnect();
        }
        this.webDevice = null;
        this.webServer = null;
        return;
      } catch (err) {
        throw err;
      }
    }

    throw new Error('bluetooth-plugin-not-available');
  }

  // Escrever dados - para Web Bluetooth tentamos encontrar uma characteristic com propriedade 'write'
  async write(data: string): Promise<void> {
    const bt = this.getBluetooth();
    if (bt) {
      return await new Promise<void>((resolve, reject) => {
        bt.write(data, () => resolve(), (err: any) => reject(err));
      });
    }

    if (this.webServer) {
      try {
        const services = await this.webServer.getPrimaryServices();
        for (const service of services) {
          const chars = await service.getCharacteristics();
          for (const c of chars) {
            const props = c.properties || {};
            if (props.write || props.writeWithoutResponse) {
              const encoder = new TextEncoder();
              const buf = encoder.encode(data);
              await c.writeValue(buf);
              return;
            }
          }
        }
        throw new Error('no-writable-characteristic-found');
      } catch (err) {
        throw err;
      }
    }

    throw new Error('bluetooth-plugin-not-available');
  }

  // Solicita permissões Android via plugin cordova-plugin-android-permissions se disponível
  async requestAndroidPermissions(): Promise<{ granted: string[]; denied: string[] } | null> {
    console.log('requestAndroidPermissions: starting');
    const perms = this.getPermissionsPlugin();

    // Preferir constantes fornecidas pelo wrapper quando disponíveis,
    // caso contrário usar os nomes completos (compatibilidade com window.plugins.permissions)
    const toRequest = (() => {
      try {
        if (this.androidPermissions && (this.androidPermissions as any).PERMISSION) {
          const P: any = (this.androidPermissions as any).PERMISSION;
          return [P.ACCESS_FINE_LOCATION || 'android.permission.ACCESS_FINE_LOCATION', P.BLUETOOTH_SCAN || 'android.permission.BLUETOOTH_SCAN', P.BLUETOOTH_CONNECT || 'android.permission.BLUETOOTH_CONNECT'];
        }
      } catch (e) { /* ignore */ }
      return ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.BLUETOOTH_SCAN', 'android.permission.BLUETOOTH_CONNECT'];
    })();
    // Se o AndroidPermissions (wrapper) estiver disponível, use-o (mais granular)
    if (this.androidPermissions) {
      const granted: string[] = [];
      const denied: string[] = [];

      for (const p of toRequest) {
        try {
          const maybePermission = (this.androidPermissions && (this.androidPermissions as any).PERMISSION && (this.androidPermissions as any).PERMISSION[p]) ? (this.androidPermissions as any).PERMISSION[p] : p;
          const checkRes: any = await this.androidPermissions.checkPermission(maybePermission as any);
          const has = checkRes && (checkRes.hasPermission === true || checkRes.permission === 'GRANTED' || checkRes.hasPermission === 'GRANTED');
          if (has) {
            granted.push(p);
            continue;
          }

          // solicita a permissão explicitamente
          const reqRes: any = await this.androidPermissions.requestPermission(maybePermission as any);
          const ok = reqRes && (reqRes.hasPermission === true || reqRes.permission === 'GRANTED' || reqRes === 'GRANTED');
          if (ok) granted.push(p);
          else denied.push(p);
        } catch (e) {
          // melhor log do erro (inclui propriedades não enumeráveis)
          try {
            console.warn('Erro ao checar/solicitar permissão', p, JSON.stringify(e, Object.getOwnPropertyNames(e)));
          } catch (j) {
            console.warn('Erro ao checar/solicitar permissão', p, e);
          }
          denied.push(p);
        }
      }

      // Se houver o plugin cordova de permissões, faça uma verificação final cruzada
      try {
        const permsPlugin = this.getPermissionsPlugin();
        if (permsPlugin) {
          const finalGranted: string[] = [];
          const finalDenied: string[] = [];
          for (const p of toRequest) {
            const hasNow = await new Promise<boolean>((resolve) => {
              try {
                permsPlugin.checkPermission(p, (status: any) => {
                  const has = status && (status.hasPermission === true || status === 'GRANTED' || status === 'OK');
                  resolve(!!has);
                }, (err: any) => resolve(false));
              } catch (e) { resolve(false); }
            });
            if (hasNow) finalGranted.push(p); else finalDenied.push(p);
          }
          // sobrescreve granted/denied com verificação final
          try { console.log('requestAndroidPermissions final check (permissions plugin):', JSON.stringify({ granted: finalGranted, denied: finalDenied })); } catch(e) { console.log('requestAndroidPermissions final check (permissions plugin):', { granted: finalGranted, denied: finalDenied }); }
          return { granted: finalGranted, denied: finalDenied };
        }
      } catch (e) {
        console.warn('Erro ao fazer verificação final de permissões', e);
      }

      try { console.log('requestAndroidPermissions result (androidPermissions):', JSON.stringify({ granted, denied })); } catch(e) { console.log('requestAndroidPermissions result (androidPermissions):', { granted, denied }); }
      return { granted, denied };
    }

    // Fallback: use window.plugins.permissions (Cordova) se disponível
    if (!perms) return null;

    const result = await new Promise<{ granted: string[]; denied: string[] }>((resolve) => {
      perms.requestPermissions(toRequest, (status: any) => {
        const granted: string[] = [];
        const denied: string[] = [];
        try {
          for (const p of toRequest) {
            const has = status && status[p];
            if (has === true || has === 'OK' || has === 'GRANTED') granted.push(p);
            else denied.push(p);
          }
        } catch (e) {
          // fallback: assume granted none
        }
        resolve({ granted, denied });
      }, (err: any) => {
        resolve({ granted: [], denied: toRequest });
      });
    });

    // Faça uma verificação final, pois alguns WebViews/plugins podem relatar estado incorreto logo após request
    try {
      const permsPlugin = this.getPermissionsPlugin();
      if (permsPlugin) {
        const finalGranted: string[] = [];
        const finalDenied: string[] = [];
        for (const p of toRequest) {
          const hasNow = await new Promise<boolean>((resolve) => {
            try {
              permsPlugin.checkPermission(p, (status: any) => {
                const has = status && (status.hasPermission === true || status === 'GRANTED' || status === 'OK');
                resolve(!!has);
              }, (err: any) => resolve(false));
            } catch (e) { resolve(false); }
          });
          if (hasNow) finalGranted.push(p); else finalDenied.push(p);
        }
        try { console.log('requestAndroidPermissions result (permissions plugin final):', JSON.stringify({ granted: finalGranted, denied: finalDenied })); } catch(e) { console.log('requestAndroidPermissions result (permissions plugin final):', { granted: finalGranted, denied: finalDenied }); }
        return { granted: finalGranted, denied: finalDenied };
      }
    } catch (e) {
      console.warn('Erro ao fazer verificação final (fallback) de permissões', e);
    }

    try { console.log('requestAndroidPermissions result (permissions plugin):', JSON.stringify(result)); } catch(e) { console.log('requestAndroidPermissions result (permissions plugin):', result); }

    return result as { granted: string[]; denied: string[] };
  }

  // Ler uma vez (plugin classic)
  async read(): Promise<string> {
    const bt = this.getBluetooth();
    if (bt) {
      return await new Promise<string>((resolve, reject) => {
        bt.read((data: any) => resolve(data), (err: any) => reject(err));
      });
    }

    throw new Error('bluetooth-plugin-not-available');
  }

  // Subscribe por delimitador (ex: '\n') e chama onData para cada mensagem recebida
  async subscribe(delimiter: string, onData: (data: string) => void): Promise<void> {
    const bt = this.getBluetooth();
    if (bt) {
      return await new Promise<void>((resolve, reject) => {
        try {
          bt.subscribe(delimiter,
            (data: any) => {
              try { onData(data); } catch (e) { console.error('onData handler error', e); }
            },
            (err: any) => {
              console.error('bt.subscribe error', err);
            }
          );
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }

    throw new Error('bluetooth-plugin-not-available');
  }

  // Cancela subscription (plugin classic)
  async unsubscribe(): Promise<void> {
    const bt = this.getBluetooth();
    if (bt) {
      return await new Promise<void>((resolve, reject) => {
        bt.unsubscribe(() => resolve(), (err: any) => reject(err));
      });
    }

    return;
  }
}
