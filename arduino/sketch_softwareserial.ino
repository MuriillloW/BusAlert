/*
  Código Arduino para Bluetooth HC-05 nos pinos 10 e 11 (SoftwareSerial)
  Controla LED no pino 4.
*/

#include <SoftwareSerial.h>

// Definição dos pinos do Bluetooth
// RX do Arduino (liga no TX do Bluetooth - Pino 3 do HC-05)
// TX do Arduino (liga no RX do Bluetooth - Pino 2 do HC-05)
const int pinRX = 10; 
const int pinTX = 11;

// Cria a porta serial por software
SoftwareSerial bluetooth(pinRX, pinTX);

const int ledPin = 4;

void setup() {
  // Inicializa a comunicação serial padrão (USB) para debug no computador
  Serial.begin(9600);
  Serial.println("Iniciando Bluetooth...");

  // Inicializa a comunicação com o módulo Bluetooth
  // A maioria dos HC-05 vem com 9600 ou 38400. Tente 9600 primeiro.
  bluetooth.begin(9600); 
  
  pinMode(ledPin, OUTPUT);

  // Pisca 3 vezes para confirmar inicialização
  for(int i=0; i<3; i++) {
    digitalWrite(ledPin, HIGH);
    delay(200);
    digitalWrite(ledPin, LOW);
    delay(200);
  }
}

void loop() {
  // Verifica se há dados chegando do Bluetooth
  if (bluetooth.available() > 0) {
    char command = bluetooth.read();
    
    // Mostra no Monitor Serial do PC o que chegou (para debug)
    Serial.print("Recebido: ");
    Serial.println(command);

    if (command == '1') {
      // Liga o LED
      digitalWrite(ledPin, HIGH);
      
      // Mantém ligado por 10 segundos
      delay(10000);
      
      // Pisca 5 vezes
      for(int i=0; i<5; i++) {
        digitalWrite(ledPin, LOW);
        delay(500);
        digitalWrite(ledPin, HIGH);
        delay(500);
      }
      
      // Desliga o LED
      digitalWrite(ledPin, LOW);
    } 
    else if (command == '0') {
      digitalWrite(ledPin, LOW);
    }
  }
}
