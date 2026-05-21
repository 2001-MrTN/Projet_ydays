#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define DHTPIN 15
#define DHTTYPE DHT22

const char* ssid = "Thierry's Galaxy S21 5G";
const char* password = "ceih9118";

#define DATABASE_URL "https://dht-monitor-69917-default-rtdb.europe-west1.firebasedatabase.app"
#define API_KEY "AIzaSyB6se8-V09v5EZCZZzSAVUTL4ZSVaIwUig"

DHT dht(DHTPIN, DHTTYPE);

void sendToFirebase(float temp, float hum) {
  HTTPClient http;
  
  // 1. Mettre à jour latest (dernière valeur)
  String url = String(DATABASE_URL) + "/readings/latest.json?auth=" + API_KEY;
  String body = "{\"temperature\":" + String(temp, 1) + ",\"humidity\":" + String(hum, 1) + "}";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.PUT(body);
  http.end();

  // 2. Ajouter dans history (toutes les valeurs)
  String urlHistory = String(DATABASE_URL) + "/readings/history.json?auth=" + API_KEY;
  String bodyHistory = "{\"temperature\":" + String(temp, 1) + ",\"humidity\":" + String(hum, 1) + ",\"timestamp\":" + String(millis()) + "}";
  http.begin(urlHistory);
  http.addHeader("Content-Type", "application/json");
  http.POST(bodyHistory);
  http.end();

  Serial.println("Firebase OK ✓");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Connexion WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connecté !");
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Erreur lecture DHT22");
    delay(2000);
    return;
  }

  Serial.printf("Temp: %.1f°C | Hum: %.1f%%\n", temperature, humidity);
  sendToFirebase(temperature, humidity);
  delay(10000);
}