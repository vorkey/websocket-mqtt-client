const $ = (id) => document.getElementById(id);
let client = null;
let connected = false;

document.querySelectorAll(".card-header").forEach((header) => {
  header.addEventListener("click", () => {
    header.nextElementSibling.classList.toggle("active");
  });
});

const log = (text) => {
  const msgBox = $("messages");
  const time = new Date().toLocaleTimeString();
  msgBox.textContent += `\n[${time}] ${text}`;
  msgBox.scrollTop = msgBox.scrollHeight;
};

const setStatus = (text, type) => {
  const status = $("status");
  status.textContent = text;
  status.style.background =
    type === "success"
      ? "var(--accent3)"
      : type === "danger"
        ? "var(--accent1)"
        : "var(--primary)";
};

$("clearBtn").addEventListener("click", () => {
  $("messages").textContent = "";
});

$("connectBtn").addEventListener("click", () => {
  const protocol = $("protocol").value;
  const broker = $("broker").value;
  const port = parseInt($("port").value);
  const path = $("path").value;

  const clientID = "web_" + Math.random().toString(16).substr(2, 8);

  client = new Paho.MQTT.Client(broker, port, path, clientID);

  client.onConnectionLost = () => {
    connected = false;
    setStatus("CONNECTION LOST", "danger");
    log("Connection lost");
  };

  client.onMessageArrived = (message) => {
    log(`Topic: ${message.destinationName} | ${message.payloadString}`);
  };

  client.connect({
    useSSL: protocol === "wss",
    timeout: 5,
    onSuccess: () => {
      connected = true;
      setStatus(`CONNECTED TO: ${broker.toUpperCase()}`, "success");
      log("Connected");
    },
    onFailure: (err) => {
      setStatus("CONNECTION FAILED", "danger");
      log("Failed: " + err.errorMessage);
    },
  });
});

$("subscribeBtn").addEventListener("click", () => {
  if (!connected) return alert("Not connected");
  const topic = $("subtopic").value;
  client.subscribe(topic);
  log("Subscribed: " + topic);
});

$("publishBtn").addEventListener("click", () => {
  if (!connected) return alert("Not connected");
  const topic = $("pubtopic").value;
  const msg = $("message").value;
  const message = new Paho.MQTT.Message(msg);
  message.destinationName = topic;
  client.send(message);
  log("Sent: " + msg);
});
