let posts = JSON.parse(localStorage.getItem("posts") || "[]");

let profile = JSON.parse(
  localStorage.getItem("profile") ||
    '{"name":"","bio":"","dating":false,"premium":false}'
);

let writingChats = JSON.parse(localStorage.getItem("writingChats") || "{}");
let datingChats = JSON.parse(localStorage.getItem("datingChats") || "{}");
let datingRequests = JSON.parse(localStorage.getItem("datingRequests") || "[]");

function showSection(id) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  if (id === "home") renderPosts();
  if (id === "dating") renderDating();
  if (id === "profile") renderProfile();
  if (id === "messages") renderMessages();
}

function createPost() {
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();

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

  localStorage.setItem("posts", JSON.stringify(posts));
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
        <button class="like-btn ${post.liked ? "liked" : ""}" onclick="toggleLike(${post.id})">
          ${post.liked ? "♥ Liked" : "♡ Like"}${post.likes > 0 ? ` ${post.likes}` : ""}
        </button>

        <button onclick="toggleComments(${post.id})">💬 Comments</button>
        <button onclick="openWritingChat('${escapeAttr(post.author)}')">✉ Message</button>
      </div>

      <div class="comments" id="comments-${post.id}">
        <div id="comment-list-${post.id}"></div>

        <div class="comment-box">
          <input id="comment-input-${post.id}" placeholder="Write a comment..." />
          <button class="primary" onclick="addComment(${post.id})">Send</button>
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

  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

function toggleComments(id) {
  const box = document.getElementById("comments-" + id);
  box.classList.toggle("show");
}

function addComment(id) {
  const input = document.getElementById("comment-input-" + id);
  const text = input.value.trim();

  if (!text) return;

  const post = posts.find((p) => p.id === id);
  if (!post) return;

  post.comments.push({
    author: profile.name || "Anonymous",
    text,
  });

  localStorage.setItem("posts", JSON.stringify(posts));
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
  showSection("messages");

  const key = author;
  if (!writingChats[key]) writingChats[key] = [];

  renderWritingChat(key);
}

function renderWritingChat(key) {
  const area = document.getElementById("chatArea");

  area.innerHTML = `
    <div class="chat">
      <div class="chat-header">Writing discussion with ${escapeHTML(key)}</div>

      <div class="chat-messages" id="chatMessages"></div>

      <div class="chat-input">
        <input id="chatInput" placeholder="Discuss the writing..." />
        <button onclick="sendWritingMessage('${escapeAttr(key)}')">Send</button>
      </div>
    </div>
  `;

  const messages = writingChats[key] || [];
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
  const text = input.value.trim();

  if (!text) return;

  if (!writingChats[key]) writingChats[key] = [];

  writingChats[key].push({ text, me: true });
  localStorage.setItem("writingChats", JSON.stringify(writingChats));

  input.value = "";
  renderWritingChat(key);
}

function renderDating() {
  const container = document.getElementById("datingProfiles");
  const empty = document.getElementById("emptyDating");

  container.innerHTML = "";

  empty.style.display = "block";
}

function ringBell(user) {
  datingRequests.push({
    from: profile.name || "Anonymous",
    to: user,
    status: "pending",
  });

  localStorage.setItem("datingRequests", JSON.stringify(datingRequests));
  alert("Love Interest Sent");
}

function acceptLoveInterest(name) {
  const request = datingRequests.find(
    (r) => r.from === name && r.status === "pending"
  );

  if (!request) return;

  request.status = "accepted";
  localStorage.setItem("datingRequests", JSON.stringify(datingRequests));

  const key = name;
  if (!datingChats[key]) datingChats[key] = [];

  localStorage.setItem("datingChats", JSON.stringify(datingChats));
  showDatingChat(key);
}

function declineLoveInterest(name) {
  const request = datingRequests.find(
    (r) => r.from === name && r.status === "pending"
  );

  if (!request) return;

  request.status = "declined";
  localStorage.setItem("datingRequests", JSON.stringify(datingRequests));
  renderMessages();
}

function showDatingChat(name) {
  showSection("messages");

  const area = document.getElementById("chatArea");

  area.innerHTML = `
    <div class="chat">
      <div class="chat-header">Dating Chat with ${escapeHTML(name)}</div>
      <div class="chat-messages" id="datingMessages"></div>

      <div class="chat-input">
        <input id="datingInput" placeholder="Write a message..." />
        <button onclick="sendDatingMessage('${escapeAttr(name)}')">Send</button>
      </div>
    </div>
  `;

  renderDatingMessages(name);
}

function renderDatingMessages(name) {
  const box = document.getElementById("datingMessages");
  if (!box) return;

  box.innerHTML = "";

  const messages = datingChats[name] || [];
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
  const text = input.value.trim();

  if (!text) return;

  if (!datingChats[name]) datingChats[name] = [];

  datingChats[name].push({ text, me: true });
  localStorage.setItem("datingChats", JSON.stringify(datingChats));

  input.value = "";
  renderDatingMessages(name);
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

        <button class="accept" onclick="acceptLoveInterest('${escapeAttr(request.from)}')">
          Accept
        </button>

        <button class="decline" onclick="declineLoveInterest('${escapeAttr(request.from)}')">
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
  const name = document.getElementById("profileName").value.trim();
  const bio = document.getElementById("profileBio").value.trim();
  const dating = document.getElementById("datingInterest").checked;

  profile.name = name;
  profile.bio = bio;
  profile.dating = dating;

  localStorage.setItem("profile", JSON.stringify(profile));
  alert("Profile saved.");
  renderProfile();
}

function renderProfile() {
  document.getElementById("profileName").value = profile.name || "";
  document.getElementById("profileBio").value = profile.bio || "";
  document.getElementById("datingInterest").checked = profile.dating || false;

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
  localStorage.setItem("profile", JSON.stringify(profile));

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
  return String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

renderPosts();
renderDating();
renderProfile();
