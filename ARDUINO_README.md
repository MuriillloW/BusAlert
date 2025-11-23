Arduino + HC-05 — Instruções rápidas

Conteúdo:
- Sketch: `arduino/hc05_led.ino`
- Objetivo: receber '1' para ligar LED no pino 4 e '0' para desligar

Fiação recomendada (Arduino UNO):
- HC-05 TXD -> Arduino pin 10 (SoftwareSerial RX)
- HC-05 RXD -> Arduino pin 11 (SoftwareSerial TX) através de um divisor de tensão (para reduzir 5V -> ~3.3V)
- HC-05 VCC -> 5V (ou 3.3V conforme módulo)
- HC-05 GND -> GND do Arduino
- LED -> pino 4 (com resistor de 220Ω para GND)

Observações importantes:
- Use SoftwareSerial para não conflitar com a Serial USB usada no upload / Serial Monitor.
- Verifique o baud do HC-05 (comum: 9600). Altere `bt.begin(...)` no sketch se necessário.
- Emparelhe o HC-05 no Android (Configurações > Bluetooth) antes de conectar pelo app.

Plugins e instalação no projeto Ionic/Capacitor (Android):
- Plugin Cordova (Bluetooth Serial): `cordova-plugin-bluetooth-serial`
- Plugin permissões Android (opcional): `cordova-plugin-android-permissions`
- Wrappers / pacotes já usados no projeto: `@awesome-cordova-plugins/bluetooth-serial` e `@awesome-cordova-plugins/android-permissions`

Comandos exemplo para instalar (no diretório do projeto):

```bash
ionic cordova plugin add cordova-plugin-bluetooth-serial
npm install @awesome-cordova-plugins/bluetooth-serial

ionic cordova plugin add cordova-plugin-android-permissions
npm install @awesome-cordova-plugins/android-permissions

npx cap sync
```

Notas finais:
- HC-05 é Bluetooth clássico (SPP). Web Bluetooth (BLE) não funciona com HC-05, portanto teste em um dispositivo Android com os plugins instalados.
- O app já envia '1' quando você clica em "Enviar teste". Foi adicionada uma ação "Desligar" que envia '0'.
