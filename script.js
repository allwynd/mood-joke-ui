const getJokeBtn    = document.getElementById("getJokeBtn");
const jokeText      = document.getElementById("jokeText");
const jokePlaceholder = document.getElementById("jokePlaceholder");
const jokeBox       = document.getElementById("jokeBox");
const customMood    = document.getElementById("customMood");
const message       = document.getElementById("message");
const ratingSection = document.getElementById("ratingSection");
const pills         = document.querySelectorAll(".pill");

const API_BASE = window.ENV?.API_BASE ?? "https://mood-jokes-agent-api-h3bdera7eehee8dz.austriaeast-01.azurewebsites.net";
//"https://mood-jokes-agent-api-h3bdera7eehee8dz.austriaeast-01.azurewebsites.net";

let currentJoke = "";
let currentMood = "happy";
let selectedPill = document.querySelector(".pill.active");

/* ── Pill selection ─────────────────── */
pills.forEach(pill => {
  pill.addEventListener("click", () => {
    pills.forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    selectedPill = pill;
    currentMood = pill.dataset.mood;
    customMood.value = "";
  });
});

/* clear pill selection when typing custom mood */
customMood.addEventListener("input", () => {
  if (customMood.value.trim()) {
    pills.forEach(p => p.classList.remove("active"));
  } else if (selectedPill) {
    selectedPill.classList.add("active");
  }
});

/* submit on Enter inside the custom mood input */
customMood.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchJoke();
});

/* ── Fetch joke ─────────────────────── */
async function fetchJoke() {
  const mood = customMood.value.trim() || currentMood;
  currentMood = mood;

  /* loading state */
  getJokeBtn.classList.add("loading");
  getJokeBtn.disabled = true;
  message.textContent = "";
  message.className = "";

  /* clear previous rating */
  document.querySelectorAll(".rate-btn").forEach(b => b.classList.remove("selected"));
  ratingSection.classList.remove("active");

  try {
    const response = await fetch(`${API_BASE}/get-joke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood })
    });

    const data = await response.json();
    currentJoke = data.joke;

    /* show joke */
    jokePlaceholder.classList.add("hidden");
    jokeText.classList.remove("hidden");
    jokeText.textContent = currentJoke;
    jokeBox.classList.add("has-joke");

    /* animate */
    jokeText.classList.remove("pop-in");
    void jokeText.offsetWidth; /* reflow to restart animation */
    jokeText.classList.add("pop-in");

    /* enable rating */
    ratingSection.classList.add("active");

  } catch (err) {
    jokeText.textContent = "Oops, couldn't load a joke. Try again!";
    jokeBox.classList.remove("has-joke");
  } finally {
    getJokeBtn.classList.remove("loading");
    getJokeBtn.disabled = false;
  }
}

/* ── Buttons ────────────────────────── */
getJokeBtn.addEventListener("click", fetchJoke);

document.getElementById("continueBtn").addEventListener("click", fetchJoke);

document.getElementById("stopBtn").addEventListener("click", () => {
  jokeText.classList.remove("hidden");
  jokePlaceholder.classList.add("hidden");
  jokeBox.classList.remove("has-joke");
  jokeText.textContent = "Thanks for using Mood Jokes! Come back when you need a laugh 😄";
  ratingSection.classList.remove("active");
  message.textContent = "";
});

/* submit on Enter when focus is NOT in the custom mood input */
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement !== customMood) {
    fetchJoke();
  }
});

/* ── Rating ─────────────────────────── */
document.querySelectorAll(".rate-btn").forEach(button => {
  button.addEventListener("click", async () => {
    if (!currentJoke) return;

    /* visual selection */
    document.querySelectorAll(".rate-btn").forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");

    const rating = button.dataset.rate;

    try {
      await fetch(`${API_BASE}/rate-joke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: currentMood, joke: currentJoke, rating })
      });
      message.textContent = "Thanks for rating! ❤️";
      message.className = "success";
    } catch {
      message.textContent = "Couldn't save your rating.";
    }
  });
});