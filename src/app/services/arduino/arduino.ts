import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class Arduino {

  private mac = "00:11:22:33:44:55"; // MAC do HC-05
  private isConnected = false;

  constructor(
    private bt: BluetoothSerial,
    private platform: Platform
  ) {}

  async sendAlert() {
    await this.platform.ready();

    if (!this.isConnected) {
      return this.connectAndTurnOn();
    } else {
      return this.disconnectAndTurnOff();
    }
  }

  private connectAndTurnOn(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sub = this.bt.connect(this.mac).subscribe(() => {
        this.isConnected = true;
        this.bt.write("1").then(() => {
          console.log("Conectado + LED ON");
          resolve();
        }).catch(err => {
          console.error('Erro ao escrever para dispositivo', err);
          reject(err);
        });
      }, err => {
        console.error("Erro ao conectar", err);
        reject(err);
      });

      // Caso a conexão demore demais, pode-se adicionar timeout aqui (opcional)
    });
  }

  private async disconnectAndTurnOff(): Promise<void> {
    try {
      await this.bt.write("0"); // apaga ANTES da desconexão
    } catch (e) {
      console.warn('Erro escrevendo 0 antes de desconectar', e);
    }
    try {
      await this.bt.disconnect();
      this.isConnected = false;
      console.log("Desconectado + LED OFF");
    } catch (e) {
      console.error('Erro ao desconectar', e);
      // mesmo em caso de erro, atualiza estado
      this.isConnected = false;
      throw e;
    }
  }
}