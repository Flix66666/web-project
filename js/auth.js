// js/auth.js

const USERS_KEY = "users";
const SESSION_KEY = "session";

// simple demo hash
function hash(password) {
  return btoa(password);
}

// 🔥 AUTO-SEED USERS (RUNS ONCE)
(function seedUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    const users = [
      {
        email: "user@test.com",
        password: hash("User@123"),
        role: "user",
        banned: false
      },
      {
        email: "admin@test.com",
        password: hash("Admin@123"),
        role: "admin",
        banned: false
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
})();

// LOGIN
export function login(email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find(
    u => u.email === email && u.password === hash(password)
  );

  if (!user) throw new Error("Invalid credentials");

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

// LOGOUT
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}


export function register(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.find(u => u.email === email)) {
    throw new Error("User already exists");
  }

  users.push({
    email,
    password: btoa(password),
    role: "user",
    banned: false
  });

  localStorage.setItem("users", JSON.stringify(users));
}

export function resetPassword(email, newPassword) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email);

  if (!user) throw new Error("User not found");

  user.password = btoa(newPassword);
  localStorage.setItem("users", JSON.stringify(users));
}
