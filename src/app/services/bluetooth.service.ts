import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';


@Injectable({ providedIn: 'root' })
export class BluetoothService {
  // For Web Bluetooth fallback
  private webDevice: any | null = null;
  private webServer: any | null = null;

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
    const perms = this.getPermissionsPlugin();
    if (!perms) return null;

    const toRequest = [
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT'
    ];

    return await new Promise((resolve) => {
      perms.requestPermissions(toRequest, (status: any) => {
        // status may be an object with permission booleans
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
