#include <SoftwareSerial.h>

const int BT_RX = 10; // RX do Arduino (conecta ao TX do HC-05)
const int BT_TX = 11; // TX do Arduino (conecta ao RX do HC-05) - usar divisor de tensão no RX do HC-05
const int LED_PIN = 4;

SoftwareSerial bt(BT_RX, BT_TX); // RX, TX

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(9600);       // Serial via USB (opcional, para debug)
  bt.begin(9600);           // Verifique o baud do seu HC-05 (comum: 9600)
  Serial.println("Arduino pronto. Aguardando comandos via BT...");
}

void loop() {
  if (bt.available()) {
    char c = (char)bt.read();
    Serial.print("Recebido via BT: ");
    Serial.println(c);

    if (c == '1') {
      digitalWrite(LED_PIN, HIGH);
      // opcional: enviar confirmação
      bt.println("OK:LED_ON");
    } else if (c == '0') {
      digitalWrite(LED_PIN, LOW);
      bt.println("OK:LED_OFF");
    } else {
      // ignorar ou tratar outros comandos
    }
  }

  // opcional: forward data do USB para Bluetooth (debug)
  if (Serial.available()) {
    char d = (char)Serial.read();
    bt.write(d);
  }
}
