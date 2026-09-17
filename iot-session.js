const tasks = [
  {
    number: '01',
    title: 'HTTP LED Web Control',
    subtitle: 'Local Wi-Fi · HTTP REST · GPIO · Day 1',
    intro: 'This task connects an ESP32 to a local Wi-Fi network and turns it into a lightweight web server. A browser on the same network can call HTTP endpoints to switch the onboard LED on and off in real time.',
    explanation: 'The ESP32 first joins the configured Wi-Fi network. WebServer listens on port 80 and maps /api/on and /api/off to handler functions. Each handler changes GPIO 2, updates the LED state, sends a plain-text response to the browser and prints an event to the Serial Monitor. This demonstrates the complete embedded HTTP request-response cycle without depending on an external cloud service.',
    objectives: [
      'Understand the HTTP protocol and basic REST API design.',
      'Build a web interface that communicates with an embedded device.',
      'Implement GPIO digital output control on a microcontroller.',
      'Use a local-network solution with low latency and no cloud dependency.'
    ],
    steps: [
      'Install Arduino IDE and add ESP32 board support through Boards Manager.',
      'Use GPIO 2, which is connected to the ESP32 onboard LED; no extra wiring is required.',
      'Replace the Wi-Fi SSID and password in the sketch.',
      'Select ESP32 Dev Module and the correct serial port, then upload the sketch.',
      'Open Serial Monitor at 115200 baud and note the ESP32 IP address.',
      'From a device on the same network, open /api/on and /api/off in a browser.'
    ],
    hardware: ['ESP32 DevKit V4', 'USB A-to-Micro-B data cable', '2.4 GHz Wi-Fi network'],
    software: ['Arduino IDE', 'ESP32 WiFi.h library', 'WebServer.h library', 'Browser-based control panel'],
    code: `#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

WebServer server(80);
const int ledPin = 2;
bool ledState = false;

void handleOn() {
  digitalWrite(ledPin, HIGH);
  ledState = true;
  server.send(200, "text/plain", "ON");
  Serial.println("LED ON");
}

void handleOff() {
  digitalWrite(ledPin, LOW);
  ledState = false;
  server.send(200, "text/plain", "OFF");
  Serial.println("LED OFF");
}

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  server.on("/api/on", handleOn);
  server.on("/api/off", handleOff);
  server.begin();
}

void loop() {
  server.handleClient();
}`,
    photos: []
  },
  {
    number: '02',
    title: 'MQTT Cloud Dashboard with Relay Control',
    subtitle: 'Adafruit IO · MQTT Pub/Sub · 230V Relay · Day 2',
    intro: 'This task moves from local HTTP control to a cloud publish-subscribe model. Adafruit IO receives a command through its feed and publishes it over MQTT to the ESP32, which switches a relay connected to a bulb.',
    explanation: 'Unlike HTTP, where a client directly calls a server endpoint, MQTT uses a broker and topics. The ESP32 subscribes to the esp feed and waits for messages. When a publisher sends ON or OFF, Adafruit IO forwards the message to the ESP32 callback. The callback parses the command and changes the relay GPIO. This architecture allows the dashboard and device to be in different networks and can be extended to many devices and feeds.',
    objectives: [
      'Control an embedded device from anywhere through the internet.',
      'Understand MQTT publishers, subscribers, topics and brokers.',
      'Log control events to a cloud dashboard.',
      'Design a scalable remote-control pattern for IoT systems.'
    ],
    steps: [
      'Create an Adafruit IO account and obtain the username and IO key.',
      'Create or select an esp feed and configure the dashboard control.',
      'Replace the Wi-Fi and Adafruit IO credentials in the sketch.',
      'Connect the relay module to GPIO 26 and upload the firmware.',
      'Publish ON or OFF from the dashboard and observe the relay response.',
      'Use a suitable relay module and follow electrical safety procedures for mains loads.'
    ],
    hardware: ['ESP32 board', 'Relay module', 'Bulb and suitable holder', 'Low-voltage power and jumper wires'],
    software: ['Arduino IDE', 'Adafruit IO account', 'AdafruitIO_WiFi library', 'MQTT cloud dashboard'],
    safety: 'A 230V circuit is hazardous. Mains wiring must be isolated, enclosed and completed only by a qualified person. Test the firmware first with a safe low-voltage load.',
    code: `#include <AdafruitIO_WiFi.h>

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASSWORD"
#define IO_USERNAME "YOUR_ADAFRUIT_IO_USERNAME"
#define IO_KEY "YOUR_ADAFRUIT_IO_KEY"

AdafruitIO_WiFi io(IO_USERNAME, IO_KEY, WIFI_SSID, WIFI_PASS);
AdafruitIO_Feed *esp = io.feed("esp");

#define RELAY_PIN 26
#define RELAY_ON HIGH
#define RELAY_OFF LOW

void handleESPMessage(AdafruitIO_Data *data) {
  String command = data->toString();
  command.trim();
  command.toUpperCase();

  if (command == "ON") {
    digitalWrite(RELAY_PIN, RELAY_ON);
    Serial.println("BULB -> ON");
  } else if (command == "OFF") {
    digitalWrite(RELAY_PIN, RELAY_OFF);
    Serial.println("BULB -> OFF");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_OFF);

  esp->onMessage(handleESPMessage);
  io.connect();

  while (io.status() < AIO_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.println("ADAFRUIT IO CONNECTED!");
  esp->get();
}

void loop() {
  io.run();
}`,
    photos: []
  },
  {
    number: '03',
    title: 'Google Assistant Voice Control via IFTTT',
    subtitle: 'IFTTT · Webhooks · Voice API · Day 3',
    intro: 'This task adds a voice-control layer to Task 2. A Google Assistant trigger phrase activates an IFTTT applet, which sends a Webhook request to Adafruit IO. Adafruit IO then republishes the command over MQTT to the existing ESP32 firmware.',
    explanation: 'The voice interface is an additional input layer rather than a replacement for the MQTT device firmware. Google Assistant performs natural-language recognition and activates the configured IFTTT applet. IFTTT converts the recognised intent into an HTTP POST. Adafruit IO updates the feed and publishes the new value. Because the ESP32 already subscribes to that feed, the same callback used in Task 2 parses the command and drives the relay. This separates user interaction, cloud integration and hardware control into independent layers.',
    objectives: [
      'Connect voice intent recognition to an IoT workflow.',
      'Configure IFTTT Webhooks as an HTTP integration layer.',
      'Reuse the MQTT relay firmware from Task 2.',
      'Document an end-to-end voice-to-GPIO system architecture.'
    ],
    architecture: [
      'Voice input: “Hey Google, activate bulb on”',
      'Google Assistant: natural-language recognition and intent trigger',
      'IFTTT: receives the trigger and executes the applet',
      'Adafruit IO API: receives the Webhook POST and updates the feed',
      'MQTT: publishes the feed value to the ESP32 subscriber',
      'ESP32: parses ON/OFF and sets the relay GPIO',
      'Relay and bulb: the controlled output responds'
    ],
    steps: [
      'Create an IFTTT applet with Google Assistant as the If This trigger.',
      'Choose a phrase such as “activate bulb on” and create a second phrase for OFF.',
      'Select Webhooks as the Then That action.',
      'Configure a POST request to the Adafruit IO feed endpoint with ON or OFF as the value.',
      'Keep the ESP32 connected to the Adafruit IO feed from Task 2.',
      'Test the voice phrase and verify the IFTTT event, feed update, MQTT message and relay output.'
    ],
    webhook: 'Voice phrase → IFTTT Webhook POST → Adafruit IO feed update → MQTT message → ESP32 callback → relay output',
    code: `// The voice layer uses the MQTT firmware from Task 2.
// Configure two IFTTT Webhook actions:
//
// ON request:
//   POST the value ON to the Adafruit IO esp feed
//
// OFF request:
//   POST the value OFF to the Adafruit IO esp feed
//
// The existing ESP32 callback receives the value:

void handleESPMessage(AdafruitIO_Data *data) {
  String command = data->toString();
  command.trim();
  command.toUpperCase();

  if (command == "ON") {
    digitalWrite(RELAY_PIN, RELAY_ON);
    Serial.println("BULB -> ON");
  } else if (command == "OFF") {
    digitalWrite(RELAY_PIN, RELAY_OFF);
    Serial.println("BULB -> OFF");
  }
}`,
    photos: []
  },
  {
    number: '04',
    title: 'Forge — Full-Stack Smart Home',
    subtitle: 'ESP32 · Firebase · Web Dashboard · Intermediate',
    intro: 'Forge combines the earlier tasks into a production-style smart-home system with three layers: ESP32 hardware for sensing and relay control, Firebase for real-time cloud synchronisation, and a JavaScript dashboard for manual and automatic control.',
    explanation: 'The hardware layer samples temperature, humidity and ambient light. The cloud layer stores sensor history and synchronises commands using Firebase Realtime Database. The dashboard listens for changes with Firebase listeners, updates the user interface immediately and writes manual commands or automatic-mode settings back to the database. This creates a bidirectional system: sensor data travels up to the cloud, while control and configuration travel down to the ESP32.',
    objectives: [
      'Monitor temperature, humidity and ambient light with the ESP32.',
      'Synchronise relay state and configuration through Firebase RTDB.',
      'Implement manual and automatic operating modes.',
      'Build a dashboard with live values, controls and CSV export.'
    ],
    subsections: [
      ['04.1 — Hardware', 'ESP32 Environmental Monitoring & Relay Control', 'The ESP32 reads a DHT11 and LDR every two seconds. Fifteen LDR samples are averaged to reduce noise. The active-LOW relay is controlled according to the selected mode, and sensor data is pushed to Firebase.'],
      ['04.2 — Cloud', 'Firebase Cloud Backend & Real-Time Sync', 'Firebase Authentication identifies the user and Firebase Realtime Database stores the bulb state, operating mode, light threshold and timestamped sensor records. Database streams allow firmware and dashboard changes to be received without constant polling.'],
      ['04.3 — Dashboard', 'Web Dashboard & User Interface', 'The JavaScript client listens for sensor and relay updates, displays temperature and humidity, toggles the bulb, changes manual or automatic mode, adjusts the LDR threshold and exports readings as CSV.']
    ],
    dataPaths: ['/appliances/bulbState', '/settings/mode', '/settings/ldrThreshold', '/sensorData'],
    code: `// -------- ESP32 firmware: hardware and Firebase --------
#include <DHT.h>
#include <Firebase_ESP_Client.h>

#define DHT_PIN 4
#define LDR_PIN 34
#define RELAY_PIN 26
#define SENSOR_INTERVAL 2000

DHT dht(DHT_PIN, DHT11);
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int ldrThreshold = 2500;
bool relayState = false;
String mode = "manual";
unsigned long lastSensorPush = 0;

int readLDR() {
  int sum = 0;
  for (int i = 0; i < 15; i++) {
    sum += analogRead(LDR_PIN);
    delay(8);
  }
  return sum / 15;
}

void applyRelay(bool state) {
  relayState = state;
  // Active-LOW relay: LOW energises the relay.
  digitalWrite(RELAY_PIN, state ? LOW : HIGH);
  Serial.println(state ? "Relay: ON" : "Relay: OFF");
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);
  dht.begin();

  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  Firebase.begin(&config, &auth);

  Firebase.RTDB.beginStream(&fbdo, "/appliances/bulbState");
  Firebase.RTDB.beginStream(&fbdo, "/settings/mode");
  Firebase.RTDB.beginStream(&fbdo, "/settings/ldrThreshold");
  Serial.println("Forge system initialized!");
}

void loop() {
  if (Firebase.RTDB.readStream(&fbdo) && fbdo.streamAvailable()) {
    if (fbdo.dataPath() == "/appliances/bulbState") {
      bool newState = fbdo.to<bool>();
      if (mode == "manual" && newState != relayState) {
        applyRelay(newState);
      }
    }
    if (fbdo.dataPath() == "/settings/mode") mode = fbdo.to<String>();
    if (fbdo.dataPath() == "/settings/ldrThreshold") ldrThreshold = fbdo.to<int>();
  }

  if (millis() - lastSensorPush >= SENSOR_INTERVAL) {
    lastSensorPush = millis();
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int ldrValue = readLDR();

    if (mode == "automatic") {
      bool shouldBeOn = (ldrValue > ldrThreshold);
      if (shouldBeOn != relayState) {
        applyRelay(shouldBeOn);
        Firebase.RTDB.setBool(&fbdo, "/appliances/bulbState", relayState);
      }
    }

    FirebaseJson json;
    json.set("temperature", temperature);
    json.set("humidity", humidity);
    json.set("ldr", ldrValue);
    json.set("bulbState", relayState);
    json.set("mode", mode);
    json.set("timestamp/.sv", "timestamp");
    Firebase.RTDB.pushJSON(&fbdo, "/sensorData", &json);
  }
}

// -------- Web dashboard: Firebase client --------
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

onValue(ref(db, 'sensorData'), (snapshot) => {
  const values = snapshot.val() || {};
  const latest = Object.values(values).pop();
  if (!latest) return;
  tempCard.textContent = latest.temperature + '°C';
  humidityCard.textContent = latest.humidity + '%';
});

function toggleBulb() {
  const isOn = bulbOrb.classList.contains('on');
  set(ref(db, 'appliances/bulbState'), !isOn);
}

onValue(ref(db, 'appliances/bulbState'), (snapshot) => {
  bulbOrb.classList.toggle('on', snapshot.val());
});

function setMode(mode) {
  set(ref(db, 'settings/mode'), mode);
}

function setThreshold(value) {
  set(ref(db, 'settings/ldrThreshold'), parseInt(value, 10));
}

function exportCSV() {
  onValue(ref(db, 'sensorData'), (snapshot) => {
    let csv = 'Timestamp,Temperature,Humidity,LDR,Bulb State\\n';
    Object.values(snapshot.val() || {}).forEach(row => {
      csv += `${new Date(row.timestamp).toLocaleString()},${row.temperature},${row.humidity},${row.ldr},${row.bulbState}\\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'forge_sensor_data.csv';
    a.click();
  });
}`,
    photos: []
  }
];

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const photoSlots = task => `<div class="photo-box">${[0, 1, 2, 3].map((_, index) => `<div class="photo-slot" data-task="${task.number}" data-photo="${index}"><span>Photo ${index + 1}</span><button type="button" data-photo-button>+ Add photo URL</button></div>`).join('')}</div>`;

const renderTask = task => `<article class="iot-card">
  <div class="eyebrow">Task ${esc(task.number)}</div>
  <h2>${esc(task.title)}</h2>
  <div class="time-date">${esc(task.subtitle)}</div>
  <p>${esc(task.intro)}</p>
  <details>
    <summary>View detailed explanation and source code</summary>
    <h3>How the task works</h3><p>${esc(task.explanation)}</p>
    <h3>Learning objectives</h3><ul>${task.objectives.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
    ${task.steps ? `<h3>Implementation steps</h3><ol>${task.steps.map(item => `<li>${esc(item)}</li>`).join('')}</ol>` : ''}
    ${task.hardware ? `<h3>Hardware components</h3><ul>${task.hardware.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}
    ${task.software ? `<h3>Software tools</h3><ul>${task.software.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}
    ${task.safety ? `<div class="iot-warning"><strong>Safety note:</strong> ${esc(task.safety)}</div>` : ''}
    ${task.architecture ? `<h3>System architecture</h3><ol>${task.architecture.map(item => `<li>${esc(item)}</li>`).join('')}</ol>` : ''}
    ${task.webhook ? `<h3>Integration flow</h3><p>${esc(task.webhook)}</p>` : ''}
    ${task.subsections ? task.subsections.map(section => `<h3>${esc(section[0])} — ${esc(section[1])}</h3><p>${esc(section[2])}</p>`).join('') : ''}
    ${task.dataPaths ? `<h3>Firebase database paths</h3><ul>${task.dataPaths.map(path => `<li><code>${esc(path)}</code></li>`).join('')}</ul>` : ''}
    <h3>Full source code</h3><pre class="iot-code">${esc(task.code)}</pre>
  </details>
  <h3>Task photos</h3>${photoSlots(task)}
</article>`;

document.querySelector('#iot-tasks').innerHTML = tasks.map(renderTask).join('');

document.addEventListener('click', event => {
  const button = event.target.closest('[data-photo-button]');
  if (!button) return;
  const slot = button.closest('.photo-slot');
  const url = prompt('Paste an image URL for this task:');
  if (!url) return;
  slot.innerHTML = `<img src="${esc(url)}" alt="Task ${esc(slot.dataset.task)} photo ${esc(slot.dataset.photo)}"><button type="button" data-photo-button>Change photo</button>`;
});
