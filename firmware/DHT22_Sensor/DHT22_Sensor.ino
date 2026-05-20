#include <DHT.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#define DHTPIN 15
#define DHTTYPE DHT22

// WiFi
const char* ssid = "Thierry's Galaxy S21 5G";
const char* password = "ceih9118";

// Firebase
#define DATABASE_URL "TON_URL_FIREBASE"  // ex: https://dht-monitor-xxxxx-default-rtdb.europe-west1.firebasedatabase.app

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  dht.begin();

  // Connexion WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connexion au WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connecté !");

  // Configuration Firebase
  config.database_url = DATABASE_URL;
  config.signer.test_mode = true;  // mode test, pas besoin d'authentification

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Firebase connecté !");
}

void loop() {
  delay(10000);  // envoie toutes les 10 secondes

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Erreur de lecture du capteur !");
    return;
  }

  // Envoi vers Firebase
  if (Firebase.ready()) {
    Firebase.RTDB.setFloat(&fbdo, "/readings/latest/temperature", temperature);
    Firebase.RTDB.setFloat(&fbdo, "/readings/latest/humidity", humidity);

    Serial.print("Température envoyée : ");
    Serial.println(temperature);
    Serial.print("Humidité envoyée : ");
    Serial.println(humidity);
  }
}