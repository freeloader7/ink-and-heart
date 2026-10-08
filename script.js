const STORAGE_KEYS = {
  posts: "posts",
  profile: "profile",
  writingChats: "writingChats",
  datingChats: "datingChats",
  datingRequests: "datingRequests",
};

let posts = readJson(STORAGE_KEYS.posts, []);

let profile = readJson(STORAGE_KEYS.profile, {
  name: "",
  bio: "",
  dating: false,
  premium: false,
});

let writingChats = readJson(STORAGE_KEYS.writingChats, {});
let datingChats = readJson(STORAGE_KEYS.datingChats, {});
let datingRequests = readJson(STORAGE_KEYS.datingRequests, []);

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    alert("Storage is full or unavailable. Please free up space and try again.");
  }
}

function sanitizeText(value, maxLength = 2000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeKey(value) {
  return sanitizeText(value, 200)
    .replace(/[<>"'`]/g, "")
    .replace(/\u0000/g, "");
}

function showSection(id) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
  }

  if (id === "home") renderPosts();
  if (id === "dating") renderDating();
  if (id === "profile") renderProfile();
  if (id === "messages") renderMessages();
}

function createPost() {
  const title = sanitizeText(document.getElementById("postTitle").value, 120);
  const content = sanitizeText(document.getElementById("postContent").value, 5000);

  if (!title || !content) {
    alert("Please add a title and your writing.");
    return;
  }

  posts.unshift({
    id: Date.now(),
    author: profile.name || "Anonymous Writer",
    title,
    content,
    likes: 0,
    liked: false,
    comments: [],
  });

  writeJson(STORAGE_KEYS.posts, posts);
  document.getElementById("postTitle").value = "";
  document.getElementById("postContent").value = "";

  alert("Your work has been published.");
  showSection("home");
}

function renderPosts() {
  const container = document.getElementById("posts");
  const empty = document.getElementById("emptyHome");

  container.innerHTML = "";

  if (posts.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <div class="post-header">
        <div class="author">
          ${escapeHTML(post.author)}
          ${profile.premium ? '<span class="premium-stamp">PREMIUM</span>' : ""}
        </div>
      </div>

      <h2>${escapeHTML(post.title)}</h2>

      <div class="post-content">${escapeHTML(post.content)}</div>

      <div class="post-actions">
        <button
          type="button"
          class="like-btn ${post.liked ? "liked" : ""}"
          data-action="toggle-like"
          data-id="${post.id}"
        >
          ${post.liked ? "♥ Liked" : "♡ Like"}${post.likes > 0 ? ` ${post.likes}` : ""}
        </button>

        <button type="button" data-action="toggle-comments" data-id="${post.id}">💬 Comments</button>
        <button type="button" data-action="open-writing-chat" data-author="${escapeAttr(post.author)}">✉ Message</button>
      </div>

      <div class="comments" id="comments-${post.id}">
        <div id="comment-list-${post.id}"></div>

        <div class="comment-box">
          <input id="comment-input-${post.id}" placeholder="Write a comment..." />
          <button type="button" class="primary" data-action="add-comment" data-id="${post.id}">Send</button>
        </div>
      </div>
    `;

    container.appendChild(div);
    renderComments(post.id);
  });
}

function toggleLike(id) {
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  if (post.liked) {
    post.liked = false;
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.liked = true;
    post.likes += 1;
  }

  writeJson(STORAGE_KEYS.posts, posts);
  renderPosts();
}

function toggleComments(id) {
  const box = document.getElementById("comments-" + id);
  if (box) {
    box.classList.toggle("show");
  }
}

function addComment(id) {
  const input = document.getElementById("comment-input-" + id);
  const text = sanitizeText(input?.value || "", 500);

  if (!text) return;

  const post = posts.find((p) => p.id === id);
  if (!post) return;

  post.comments.push({
    author: sanitizeText(profile.name || "Anonymous", 80),
    text,
  });

  writeJson(STORAGE_KEYS.posts, posts);
  input.value = "";
  renderComments(id);
}

function renderComments(id) {
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  const box = document.getElementById("comment-list-" + id);
  if (!box) return;

  box.innerHTML = post.comments
    .map(
      (comment) => `
        <div style="background:#f4f2f4;padding:10px;border-radius:8px;margin-bottom:7px;">
          <strong>${escapeHTML(comment.author)}</strong><br />
          ${escapeHTML(comment.text)}
        </div>
      `
    )
    .join("");
}

function openWritingChat(author) {
  const safeAuthor = normalizeKey(author || "");
  if (!safeAuthor) return;

  showSection("messages");
  if (!writingChats[safeAuthor]) writingChats[safeAuthor] = [];
  renderWritingChat(safeAuthor);
}

function renderWritingChat(key) {
  const area = document.getElementById("chatArea");
  const safeKey = normalizeKey(key);

  area.innerHTML = `
    <div class="chat">
      <div class="chat-header">Writing discussion with ${escapeHTML(safeKey)}</div>

      <div class="chat-messages" id="chatMessages"></div>

      <div class="chat-input">
        <input id="chatInput" placeholder="Discuss the writing..." />
        <button type="button" data-action="send-writing-message" data-key="${escapeAttr(safeKey)}">Send</button>
      </div>
    </div>
  `;

  const messages = writingChats[safeKey] || [];
  const box = document.getElementById("chatMessages");

  messages.forEach((m) => {
    const div = document.createElement("div");
    div.className = "message " + (m.me ? "me" : "them");
    div.textContent = m.text;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function sendWritingMessage(key) {
  const input = document.getElementById("chatInput");
  const text = sanitizeText(input?.value || "", 800);

  if (!text) return;

  const safeKey = normalizeKey(key);
  if (!writingChats[safeKey]) writingChats[safeKey] = [];

  writingChats[safeKey].push({ text, me: true });
  writeJson(STORAGE_KEYS.writingChats, writingChats);

  input.value = "";
  renderWritingChat(safeKey);
}

function renderDating() {
  const container = document.getElementById("datingProfiles");
  const empty = document.getElementById("emptyDating");

  container.innerHTML = "";
  empty.style.display = "block";
}

function ringBell(user) {
  const person = normalizeKey(user);

  datingRequests.push({
    from: sanitizeText(profile.name || "Anonymous", 80),
    to: person,
    status: "pending",
  });

  writeJson(STORAGE_KEYS.datingRequests, datingRequests);
  alert("Love Interest Sent");
}

function acceptLoveInterest(name) {
  const safeName = normalizeKey(name);
  const request = datingRequests.find(
    (r) => normalizeKey(r.from) === safeName && r.status === "pending"
  );

  if (!request) return;

  request.status = "accepted";
  writeJson(STORAGE_KEYS.datingRequests, datingRequests);

  if (!datingChats[safeName]) datingChats[safeName] = [];
  writeJson(STORAGE_KEYS.datingChats, datingChats);
  showDatingChat(safeName);
}

function declineLoveInterest(name) {
  const safeName = normalizeKey(name);
  const request = datingRequests.find(
    (r) => normalizeKey(r.from) === safeName && r.status === "pending"
  );

  if (!request) return;

  request.status = "declined";
  writeJson(STORAGE_KEYS.datingRequests, datingRequests);
  renderMessages();
}

function showDatingChat(name) {
  const safeName = normalizeKey(name);
  showSection("messages");

  const area = document.getElementById("chatArea");

  area.innerHTML = `
    <div class="chat">
      <div class="chat-header">Dating Chat with ${escapeHTML(safeName)}</div>
      <div class="chat-messages" id="datingMessages"></div>

      <div class="chat-input">
        <input id="datingInput" placeholder="Write a message..." />
        <button type="button" data-action="send-dating-message" data-key="${escapeAttr(safeName)}">Send</button>
      </div>
    </div>
  `;

  renderDatingMessages(safeName);
}

function renderDatingMessages(name) {
  const safeName = normalizeKey(name);
  const box = document.getElementById("datingMessages");
  if (!box) return;

  box.innerHTML = "";

  const messages = datingChats[safeName] || [];
  messages.forEach((m) => {
    const div = document.createElement("div");
    div.className = "message " + (m.me ? "me" : "them");
    div.textContent = m.text;
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function sendDatingMessage(name) {
  const input = document.getElementById("datingInput");
  const text = sanitizeText(input?.value || "", 800);

  if (!text) return;

  const safeName = normalizeKey(name);
  if (!datingChats[safeName]) datingChats[safeName] = [];

  datingChats[safeName].push({ text, me: true });
  writeJson(STORAGE_KEYS.datingChats, datingChats);

  input.value = "";
  renderDatingMessages(safeName);
}

function renderMessages() {
  const area = document.getElementById("chatArea");
  area.innerHTML = "";

  const pending = datingRequests.filter((r) => r.status === "pending");

  if (pending.length > 0) {
    pending.forEach((request) => {
      const notification = document.createElement("div");
      notification.className = "notification";

      notification.innerHTML = `
        <strong>Love Interest Sent</strong>
        <p>${escapeHTML(request.from)} is interested in getting to know you.</p>

        <button type="button" class="accept" data-action="accept-love-interest" data-name="${escapeAttr(request.from)}">
          Accept
        </button>

        <button type="button" class="decline" data-action="decline-love-interest" data-name="${escapeAttr(request.from)}">
          Decline
        </button>
      `;

      area.appendChild(notification);
    });
  }

  const empty = document.createElement("div");
  empty.className = "empty";
  empty.innerHTML = `
    <h3>Your conversations</h3>
    <p>Your writing and dating conversations will appear here.</p>
  `;

  area.appendChild(empty);
}

function saveProfile() {
  const name = sanitizeText(document.getElementById("profileName").value, 80);
  const bio = sanitizeText(document.getElementById("profileBio").value, 500);
  const dating = Boolean(document.getElementById("datingInterest").checked);

  profile.name = name;
  profile.bio = bio;
  profile.dating = dating;

  writeJson(STORAGE_KEYS.profile, profile);
  alert("Profile saved.");
  renderProfile();
}

function renderProfile() {
  document.getElementById("profileName").value = profile.name || "";
  document.getElementById("profileBio").value = profile.bio || "";
  document.getElementById("datingInterest").checked = Boolean(profile.dating);

  document.getElementById("profilePreview").innerHTML = `
    <div class="profile">
      <div class="avatar">${(profile.name || "U").charAt(0).toUpperCase()}</div>

      <div class="profile-info">
        <strong>${escapeHTML(profile.name || "Your Name")}</strong>
        ${profile.premium ? '<span class="premium-stamp">PREMIUM</span>' : ""}
        <p>${escapeHTML(profile.bio || "Your bio will appear here.")}</p>
      </div>
    </div>
  `;
}

function subscribe() {
  profile.premium = true;
  writeJson(STORAGE_KEYS.profile, profile);

  document.getElementById("paymentStatus").textContent =
    "Premium status enabled for this demo.";

  renderProfile();
}

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action, section, id, author, key, name } = button.dataset;

  switch (action) {
    case "show-section":
      showSection(section);
      break;
    case "create-post":
      createPost();
      break;
    case "save-profile":
      saveProfile();
      break;
    case "subscribe":
      subscribe();
      break;
    case "toggle-like":
      toggleLike(Number(id));
      break;
    case "toggle-comments":
      toggleComments(Number(id));
      break;
    case "add-comment":
      addComment(Number(id));
      break;
    case "open-writing-chat":
      openWritingChat(author || "");
      break;
    case "send-writing-message":
      sendWritingMessage(key || "");
      break;
    case "send-dating-message":
      sendDatingMessage(key || "");
      break;
    case "accept-love-interest":
      acceptLoveInterest(name || "");
      break;
    case "decline-love-interest":
      declineLoveInterest(name || "");
      break;
    default:
      break;
  }
});

renderPosts();
renderDating();
renderProfile();
