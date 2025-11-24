import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonList, IonItem, IonSpinner, IonIcon, IonFooter, IonButtons  } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { BluetoothService } from '../services/bluetooth.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.page.html',
  styleUrls: ['./edit-user.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonList, IonItem, IonSpinner, IonIcon, IonFooter, IonButtons ],
  // note: BluetoothSerial is provided by the plugin package and injected at runtime on device
})
export class EditUserPage implements OnInit {
  devices: any[] = [];
  isScanning: boolean = false;
  connectedAddress: string | null = null;
  statusMessage: string = '';
  lastBtMessage: string | null = null;

  constructor(private btService: BluetoothService, private alertCtrl: AlertController, private navCtrl: NavController) {}

  ngOnInit() {}

  async showAlert(header: string, message: string) {
    const a = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await a.present();
  }

  // Lista dispositivos pareados (funciona no dispositivo com o plugin instalado)
  // Acesso ao objeto global do plugin (quando disponível)
  private getBluetooth(): any | null {
    const w = window as any;
    return w && w.bluetoothSerial ? w.bluetoothSerial : null;
  }

  async listDevices() {
    if (!this.btService.hasPlugin()) {
      await this.showAlert('Atenção', 'A listagem de dispositivos Bluetooth funciona apenas em dispositivo móvel com o plugin instalado.');
      return;
    }
    // Solicita permissões Android necessárias antes de listar
    try {
      const perms = await this.btService.requestAndroidPermissions();
      try { console.log('listDevices: permissions result from service', JSON.stringify(perms)); } catch(e) { console.log('listDevices: permissions result from service', perms); }

      // Se o serviço reportou permissões negadas, verifique explicitamente o estado atual
      if (perms && perms.denied && perms.denied.length > 0) {
        const w: any = window as any;
        const permsPlugin = w && w.plugins && w.plugins.permissions ? w.plugins.permissions : null;
        const stillDenied: string[] = [];

        for (const p of perms.denied) {
          let grantedNow = false;
          // Tenta checar por diferentes possíveis APIs expostas no WebView
          try {
            if ((w as any).AndroidPermissions && typeof (w as any).AndroidPermissions.checkPermission === 'function') {
              try {
                const ch = await (w as any).AndroidPermissions.checkPermission(p);
                if (ch && (ch.hasPermission === true || ch === 'GRANTED' || ch === 'OK')) grantedNow = true;
              } catch(e) { /* continue to other checks */ }
            }

            if (!grantedNow && permsPlugin && typeof permsPlugin.checkPermission === 'function') {
              const ok = await new Promise<boolean>((resolve) => {
                try {
                  permsPlugin.checkPermission(p, (status: any) => {
                    const has = status && (status.hasPermission === true || status === 'GRANTED' || status === 'OK');
                    resolve(!!has);
                  }, (err: any) => resolve(false));
                } catch (e) { resolve(false); }
              });
              if (ok) grantedNow = true;
            }
          } catch (e) {
            console.warn('Erro ao verificar permissão atual', p, e);
          }

          if (!grantedNow) stillDenied.push(p);
        }
      }
    } catch (errPerm: any) {
      console.error('Erro solicitando permissões', errPerm);
      await this.showAlert('Erro', 'Não foi possível solicitar permissões: ' + (errPerm?.message || errPerm));
      return;
    }

    // Pequeno atraso para permitir que o sistema finalize alterações de permissão antes de listar
    await new Promise((resolve) => setTimeout(resolve, 350));
    this.isScanning = true;
    this.devices = [];
    try {
      const devices = await this.btService.list();
      this.devices = Array.isArray(devices) ? devices : [];
      this.statusMessage = this.devices.length === 0 ? 'Nenhum dispositivo pareado encontrado.' : `Encontrados ${this.devices.length} dispositivos.`;
    } catch (err: any) {
      console.error('Erro listDevices', err);
      this.statusMessage = 'Erro ao listar dispositivos.';
      await this.showAlert('Erro', 'Falha ao listar dispositivos Bluetooth: ' + (err?.message || err));
    } finally {
      this.isScanning = false;
    }
  }

  // Conecta a um endereço Bluetooth (address) e mantém o estado
  async connect(address: string) {
    if (!this.btService.hasPlugin()) {
      await this.showAlert('Atenção', 'A conexão Bluetooth funciona apenas em dispositivo móvel com o plugin instalado.');
      return;
    }

    this.statusMessage = 'Conectando...';
    try {
      await this.btService.connect(address);
      this.connectedAddress = address;
      this.statusMessage = 'Conectado a ' + address;
      await this.showAlert('Conectado', 'Conexão estabelecida com ' + address);
      // tentar inscrever para mensagens do Arduino (terminadas em '\n')
      try {
        await this.btService.subscribe('\n', (data: any) => {
          try {
            const s = ('' + data).trim();
            console.log('Mensagem recebida via BT:', s);
            this.lastBtMessage = s;
          } catch (e) {
            console.error('Erro processando dado BT', e);
          }
        });
      } catch (e) {
        console.warn('Não foi possível inscrever para receber mensagens do dispositivo:', e);
      }
    } catch (err: any) {
      console.error('connect error', err);
      this.statusMessage = 'Erro ao conectar';
      await this.showAlert('Erro', 'Falha ao conectar: ' + (err?.message || err));
    }
  }

  async disconnect() {
    if (!this.btService.hasPlugin()) {
      await this.showAlert('Atenção', 'A desconexão Bluetooth funciona apenas em dispositivo móvel com o plugin instalado.');
      return;
    }

    try {
      // cancelar inscrição, se possível
      try { await this.btService.unsubscribe(); } catch (e) { /* ignore */ }
      await this.btService.disconnect();
      this.connectedAddress = null;
      this.statusMessage = 'Desconectado';
      await this.showAlert('Desconectado', 'Desconectado com sucesso.');
    } catch (err: any) {
      console.error('disconnect', err);
      await this.showAlert('Erro', 'Falha ao desconectar: ' + (err?.message || err));
    }
  }

  // Envia um comando simples para testar (ex: '1' para ligar LED)
  async sendTestCommand() {
    if (!this.connectedAddress) {
      await this.showAlert('Atenção', 'Nenhum dispositivo conectado.');
      return;
    }

    if (!this.btService.hasPlugin()) {
      await this.showAlert('Atenção', 'Envio de dados funciona apenas em dispositivo móvel com o plugin instalado.');
      return;
    }

    try {
      // Envia apenas o caractere '1'. Remova o \r\n para evitar enviar caracteres extras que o Arduino pode não entender ou interpretar como "desligar".
      await this.btService.write('1');
      this.statusMessage = 'LED Pino 4 Ligado';
      await this.showAlert('Sucesso', 'Comando para ligar LED (Pino 4) enviado.');
    } catch (err: any) {
      console.error('write error', err);
      await this.showAlert('Erro', 'Falha ao enviar comando: ' + (err?.message || err));
    }
  }

  // Envia '0' para desligar o LED no Arduino
  async sendOffCommand() {
    if (!this.connectedAddress) {
      await this.showAlert('Atenção', 'Nenhum dispositivo conectado.');
      return;
    }

    if (!this.btService.hasPlugin()) {
      await this.showAlert('Atenção', 'Envio de dados funciona apenas em dispositivo móvel com o plugin instalado.');
      return;
    }

    try {
      await this.btService.write('0');
      console.log('Dado enviado: 0');
      this.statusMessage = 'LED Pino 4 Desligado';
      await this.showAlert('Sucesso', 'Comando para desligar LED (Pino 4) enviado.');
    } catch (err: any) {
      console.error('write error', err);
      await this.showAlert('Erro', 'Falha ao enviar comando: ' + (err?.message || err));
    }
  }

  goUser() {
    this.navCtrl.navigateRoot('/user'); 
  }
  goFavoritos() {
    this.navCtrl.navigateRoot('/favoritos');
  }
  goHome() {
    this.navCtrl.navigateRoot('/home');
  }

}
