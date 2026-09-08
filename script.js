/* =========================================================
   INLIB - SISTEM INVENTARIS PERPUSTAKAAN
   SCRIPT.JS
   ========================================================= */

/* =========================================================
   1. LOCAL STORAGE
   ========================================================= */

const STORAGE_KEY = "inlib_inventory";
const HISTORY_KEY = "inlib_history";
const THEME_KEY = "inlib_theme";
const LOGIN_KEY = "inlib_current_user";

/* =========================================================
   2. USER LOGIN
   ========================================================= */

const USERS = [
  {
    username: "fadhil",
    password: "121212",
    name: "Fadhil",
    role: "Admin",
  },

  {
    username: "nopal",
    password: "131313",
    name: "Nopal",
    role: "Admin",
  },
];

let currentUser = null;

/* =========================================================
   3. DATA GLOBAL
   ========================================================= */

let inventory = [];
let historyData = [];

let currentDeleteId = null;
let toastTimeout;

/* =========================================================
   4. DOM ELEMENT
   ========================================================= */

const splashScreen = document.getElementById("splashScreen");

const loginScreen = document.getElementById("loginScreen");

const app = document.getElementById("app");

/* LOGIN */

const loginForm = document.getElementById("loginForm");

const loginUsername = document.getElementById("loginUsername");

const loginPassword = document.getElementById("loginPassword");

const loginError = document.getElementById("loginError");

const togglePassword = document.getElementById("togglePassword");

/* USER */

const headerUserName = document.getElementById("headerUserName");

const headerUserRole = document.getElementById("headerUserRole");

const sidebarUserName = document.getElementById("sidebarUserName");

const sidebarUserRole = document.getElementById("sidebarUserRole");

const logoutButton = document.getElementById("logoutButton");

const settingsLogoutButton = document.getElementById("settingsLogoutButton");

/* FORM */

const inventoryForm = document.getElementById("inventoryForm");

const editId = document.getElementById("editId");

const itemName = document.getElementById("itemName");

const itemCode = document.getElementById("itemCode");

const itemRoom = document.getElementById("itemRoom");

const itemQuantity = document.getElementById("itemQuantity");

const itemCondition = document.getElementById("itemCondition");

/* SEARCH */

const searchInput = document.getElementById("searchInput");

const roomFilter = document.getElementById("roomFilter");

const conditionFilter = document.getElementById("conditionFilter");

const inventoryList = document.getElementById("inventoryList");

/* DASHBOARD */

const totalItems = document.getElementById("totalItems");

const goodItems = document.getElementById("goodItems");

const minorItems = document.getElementById("minorItems");

const majorItems = document.getElementById("majorItems");

const conditionChart = document.getElementById("conditionChart");

const lowStockList = document.getElementById("lowStockList");

const recentInventory = document.getElementById("recentInventory");

/* ITEM STATISTICS */

const totalItemTypes = document.getElementById("totalItemTypes");

const totalItemUnits = document.getElementById("totalItemUnits");

const highestStockItem = document.getElementById("highestStockItem");

const lowStockCount = document.getElementById("lowStockCount");

/* ROOM STATISTICS */

const totalRooms = document.getElementById("totalRooms");

const occupiedRooms = document.getElementById("occupiedRooms");

const damagedRooms = document.getElementById("damagedRooms");

const roomStatistics = document.getElementById("roomStatistics");

/* NOTIFICATION */

const notificationsList = document.getElementById("notificationsList");

const notificationBadge = document.getElementById("notificationBadge");

/* HISTORY */

const historyList = document.getElementById("historyList");

const clearHistory = document.getElementById("clearHistory");

/* DELETE */

const deleteModal = document.getElementById("deleteModal");

const cancelDelete = document.getElementById("cancelDelete");

const confirmDelete = document.getElementById("confirmDelete");

/* TOAST */

const toast = document.getElementById("toast");

const toastIcon = document.getElementById("toastIcon");

const toastTitle = document.getElementById("toastTitle");

const toastMessage = document.getElementById("toastMessage");

/* THEME */

const themeToggle = document.getElementById("themeToggle");

const settingsThemeToggle = document.getElementById("settingsThemeToggle");

/* SETTINGS */

const exportData = document.getElementById("exportData");

const importDataButton = document.getElementById("importDataButton");

const importDataInput = document.getElementById("importDataInput");

const backupData = document.getElementById("backupData");

const clearAllData = document.getElementById("clearAllData");

/* PREVIEW */

const previewName = document.getElementById("previewName");

const previewCode = document.getElementById("previewCode");

const previewRoom = document.getElementById("previewRoom");

const previewQuantity = document.getElementById("previewQuantity");

const previewCondition = document.getElementById("previewCondition");

/* =========================================================
   5. START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  loadTheme();

  setupLogin();

  setupSplashScreen();

  setupNavigation();

  setupInventoryForm();

  setupSearchAndFilter();

  setupDeleteModal();

  setupThemeToggle();

  setupSettings();

  setupMobileSidebar();

  renderAll();

  setupServiceWorker();
});

/* =========================================================
   6. SPLASH SCREEN
   ========================================================= */

function setupSplashScreen() {
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add("hide");
    }

    const savedUser = sessionStorage.getItem(LOGIN_KEY);

    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);

        showApplication();
      } catch {
        sessionStorage.removeItem(LOGIN_KEY);

        showLogin();
      }
    } else {
      showLogin();
    }
  }, 1800);
}

/* =========================================================
   7. LOGIN SETUP
   ========================================================= */

function setupLogin() {
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (togglePassword) {
    togglePassword.addEventListener("click", () => {
      if (!loginPassword) return;

      const isPassword = loginPassword.type === "password";

      loginPassword.type = isPassword ? "text" : "password";

      togglePassword.textContent = isPassword ? "🙈" : "👁️";
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  if (settingsLogoutButton) {
    settingsLogoutButton.addEventListener("click", logout);
  }
}

/* =========================================================
   8. HANDLE LOGIN
   ========================================================= */

function handleLogin(event) {
  event.preventDefault();

  if (!loginUsername || !loginPassword) {
    return;
  }

  const username = loginUsername.value.trim().toLowerCase();

  const password = loginPassword.value;

  const user = USERS.find(
    (account) => account.username === username && account.password === password,
  );

  if (!user) {
    if (loginError) {
      loginError.textContent = "Username atau password salah.";
    }

    loginPassword.value = "";

    loginPassword.focus();

    return;
  }

  currentUser = {
    username: user.username,
    name: user.name,
    role: user.role,
  };

  sessionStorage.setItem(LOGIN_KEY, JSON.stringify(currentUser));

  if (loginError) {
    loginError.textContent = "";
  }

  updateUserInformation();

  showApplication();

  if (loginForm) {
    loginForm.reset();
  }

  showToast("success", "Login berhasil", `Selamat datang, ${user.name}.`);
}

/* =========================================================
   9. SHOW APPLICATION
   ========================================================= */

function showApplication() {
  if (loginScreen) {
    loginScreen.classList.add("hidden");
  }

  if (app) {
    app.classList.remove("hidden");
  }

  updateUserInformation();
}

/* =========================================================
   10. SHOW LOGIN
   ========================================================= */

function showLogin() {
  if (app) {
    app.classList.add("hidden");
  }

  if (loginScreen) {
    loginScreen.classList.remove("hidden");
  }

  if (loginUsername) {
    setTimeout(() => {
      loginUsername.focus();
    }, 100);
  }
}

/* =========================================================
   11. LOGOUT
   ========================================================= */

function logout() {
  const confirmed = confirm("Apakah Anda yakin ingin logout?");

  if (!confirmed) {
    return;
  }

  sessionStorage.removeItem(LOGIN_KEY);

  currentUser = null;

  showLogin();

  navigateTo("dashboard");

  showToast("success", "Logout berhasil", "Anda telah keluar dari akun.");
}

/* =========================================================
   12. USER INFORMATION
   ========================================================= */

function updateUserInformation() {
  if (!currentUser) {
    return;
  }

  if (headerUserName) {
    headerUserName.textContent = currentUser.name;
  }

  if (headerUserRole) {
    headerUserRole.textContent = currentUser.role;
  }

  if (sidebarUserName) {
    sidebarUserName.textContent = currentUser.name;
  }

  if (sidebarUserRole) {
    sidebarUserRole.textContent = currentUser.role;
  }
}

/* =========================================================
   13. LOAD DATA
   ========================================================= */

function loadData() {
  try {
    const savedInventory = localStorage.getItem(STORAGE_KEY);

    const savedHistory = localStorage.getItem(HISTORY_KEY);

    inventory = savedInventory ? JSON.parse(savedInventory) : [];

    historyData = savedHistory ? JSON.parse(savedHistory) : [];

    if (!Array.isArray(inventory)) {
      inventory = [];
    }

    if (!Array.isArray(historyData)) {
      historyData = [];
    }
  } catch (error) {
    console.error("Gagal membaca LocalStorage:", error);

    inventory = [];
    historyData = [];
  }
}

/* =========================================================
   14. SAVE DATA
   ========================================================= */

function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(historyData));
}

/* =========================================================
   15. RENDER ALL
   ========================================================= */

function renderAll() {
  renderDashboard();

  renderInventory();

  renderNotifications();

  renderHistory();

  updateRoomFilter();
}

/* =========================================================
   16. DASHBOARD
   ========================================================= */

function renderDashboard() {
  const total = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const good = inventory
    .filter((item) => item.condition === "Baik")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const minor = inventory
    .filter((item) => item.condition === "Rusak Ringan")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const major = inventory
    .filter((item) => item.condition === "Rusak Berat")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (totalItems) {
    totalItems.textContent = total;
  }

  if (goodItems) {
    goodItems.textContent = good;
  }

  if (minorItems) {
    minorItems.textContent = minor;
  }

  if (majorItems) {
    majorItems.textContent = major;
  }

  renderConditionChart(good, minor, major, total);

  renderLowStock();

  renderRecentInventory();

  renderItemStatistics();

  renderRoomStatistics();
}
/* =========================================================
   17. ITEM STATISTICS
   ========================================================= */

function renderItemStatistics() {
  if (
    !totalItemTypes ||
    !totalItemUnits ||
    !highestStockItem ||
    !lowStockCount
  ) {
    return;
  }

  /* TOTAL JENIS BARANG */

  const totalTypes = inventory.length;

  /* TOTAL SEMUA UNIT BARANG */

  const totalUnits = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  /* BARANG DENGAN STOK TERBANYAK */

  const highestStock = inventory.reduce((highest, item) => {
    const quantity = Number(item.quantity || 0);

    if (!highest || quantity > Number(highest.quantity || 0)) {
      return item;
    }

    return highest;
  }, null);

  /* JUMLAH BARANG DENGAN STOK RENDAH */

  const lowStock = inventory.filter(
    (item) => Number(item.quantity || 0) <= 2,
  ).length;

  /* TAMPILKAN DATA */

  totalItemTypes.textContent = totalTypes;

  totalItemUnits.textContent = totalUnits;

  if (highestStock) {
    highestStockItem.textContent = `${highestStock.name} (${highestStock.quantity})`;
  } else {
    highestStockItem.textContent = "-";
  }

  lowStockCount.textContent = lowStock;
}
/* =========================================================
   17. ROOM STATISTICS
   ========================================================= */

function renderRoomStatistics() {
  if (!roomStatistics) {
    return;
  }

  const roomMap = {};

  inventory.forEach((item) => {
    const room = String(item.room || "Tanpa Ruangan").trim();

    if (!roomMap[room]) {
      roomMap[room] = {
        total: 0,
        good: 0,
        minor: 0,
        major: 0,
      };
    }

    const quantity = Number(item.quantity || 0);

    roomMap[room].total += quantity;

    if (item.condition === "Baik") {
      roomMap[room].good += quantity;
    } else if (item.condition === "Rusak Ringan") {
      roomMap[room].minor += quantity;
    } else if (item.condition === "Rusak Berat") {
      roomMap[room].major += quantity;
    }
  });

  const rooms = Object.entries(roomMap).sort((a, b) => b[1].total - a[1].total);

  const totalRoomCount = rooms.length;

  const occupiedRoomCount = rooms.filter(([, data]) => data.total > 0).length;

  const damagedRoomCount = rooms.filter(
    ([, data]) => data.minor > 0 || data.major > 0,
  ).length;

  if (totalRooms) {
    totalRooms.textContent = totalRoomCount;
  }

  if (occupiedRooms) {
    occupiedRooms.textContent = occupiedRoomCount;
  }

  if (damagedRooms) {
    damagedRooms.textContent = damagedRoomCount;
  }

  if (rooms.length === 0) {
    roomStatistics.innerHTML = `
            <div class="empty-room">
                🏫 Belum ada data ruangan.
            </div>
        `;

    return;
  }

  const maxTotal = Math.max(...rooms.map(([, data]) => data.total));

  roomStatistics.innerHTML = rooms
    .map(([room, data]) => {
      const percentage =
        maxTotal > 0 ? Math.round((data.total / maxTotal) * 100) : 0;

      return `
                        <div class="room-stat-item">

                            <div class="room-stat-top">

                                <span class="room-stat-name">
                                    🏫 ${escapeHTML(room)}
                                </span>

                                <span class="room-stat-total">
                                    ${data.total} unit
                                </span>

                            </div>


                            <div class="room-stat-track">

                                <div
                                    class="room-stat-bar"
                                    style="width:${percentage}%"
                                ></div>

                            </div>


                            <div class="room-stat-detail">

                                <span>
                                    ✓ Baik: ${data.good}
                                </span>

                                <span>
                                    ⚠ Rusak: ${data.minor + data.major}
                                </span>

                            </div>

                        </div>
                    `;
    })
    .join("");
}

/* =========================================================
   18. CONDITION CHART
   ========================================================= */

function renderConditionChart(good, minor, major, total) {
  if (!conditionChart) {
    return;
  }

  if (total === 0) {
    conditionChart.innerHTML = `
            <div class="empty-chart">
                <span>📊</span>
                <p>Belum ada data inventaris.</p>
            </div>
        `;

    return;
  }

  const goodPercent = Math.round((good / total) * 100);

  const minorPercent = Math.round((minor / total) * 100);

  const majorPercent = Math.round((major / total) * 100);

  conditionChart.innerHTML = `

        <div class="chart-bars">

            <div class="chart-row">

                <span class="chart-label">
                    Baik
                </span>

                <div class="chart-track">

                    <div
                        class="chart-bar good"
                        style="width:${goodPercent}%"
                    ></div>

                </div>

                <span class="chart-value">
                    ${good}
                </span>

            </div>


            <div class="chart-row">

                <span class="chart-label">
                    Rusak Ringan
                </span>

                <div class="chart-track">

                    <div
                        class="chart-bar warning"
                        style="width:${minorPercent}%"
                    ></div>

                </div>

                <span class="chart-value">
                    ${minor}
                </span>

            </div>


            <div class="chart-row">

                <span class="chart-label">
                    Rusak Berat
                </span>

                <div class="chart-track">

                    <div
                        class="chart-bar danger"
                        style="width:${majorPercent}%"
                    ></div>

                </div>

                <span class="chart-value">
                    ${major}
                </span>

            </div>

        </div>
    `;
}

/* =========================================================
   19. LOW STOCK
   ========================================================= */

function getLowStockItems() {
  return inventory

    .filter((item) => Number(item.quantity) <= 2)

    .sort((a, b) => Number(a.quantity) - Number(b.quantity));
}

function renderLowStock() {
  if (!lowStockList) {
    return;
  }

  const lowStock = getLowStockItems();

  if (lowStock.length === 0) {
    lowStockList.innerHTML = `
            <div class="empty-state small">

                <span>✅</span>

                <p>
                    Semua stok masih aman.
                </p>

            </div>
        `;

    return;
  }

  lowStockList.innerHTML = lowStock
    .slice(0, 5)
    .map(
      (item) => `
                    <div class="notification-item">

                        <div class="notification-icon">
                            ⚠️
                        </div>

                        <div class="notification-info">

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <span>
                                ${escapeHTML(item.room)}
                            </span>

                        </div>

                        <div class="notification-quantity">
                            ${item.quantity} unit
                        </div>

                    </div>
                `,
    )
    .join("");
}

/* =========================================================
   20. RECENT INVENTORY
   ========================================================= */

function renderRecentInventory() {
  if (!recentInventory) {
    return;
  }

  const recent = [...inventory]

    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    .slice(0, 5);

  if (recent.length === 0) {
    recentInventory.innerHTML = `
            <div class="empty-state small">

                <span>📚</span>

                <h4>
                    Belum ada inventaris
                </h4>

                <p>
                    Tambahkan barang pertama.
                </p>

            </div>
        `;

    return;
  }

  recentInventory.innerHTML = recent
    .map(
      (item) => `
                    <div class="recent-item">

                        <div class="recent-icon">
                            📚
                        </div>

                        <div class="recent-info">

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <span>
                                ${escapeHTML(item.code)}
                            </span>

                        </div>

                        <span
                            class="
                                recent-status
                                ${getStatusClass(item.condition)}
                            "
                        >
                            ${escapeHTML(item.condition)}
                        </span>

                    </div>
                `,
    )
    .join("");
}

/* =========================================================
   21. INVENTORY RENDER
   ========================================================= */

function renderInventory() {
  if (!inventoryList) {
    return;
  }

  const filtered = getFilteredInventory();

  if (filtered.length === 0) {
    inventoryList.innerHTML = `
            <div class="empty-state">

                <span>📚</span>

                <h4>
                    ${
                      inventory.length === 0
                        ? "Belum ada data inventaris"
                        : "Data tidak ditemukan"
                    }
                </h4>

                <p>
                    ${
                      inventory.length === 0
                        ? "Silakan tambahkan barang ke inventaris perpustakaan."
                        : "Coba ubah kata kunci atau filter pencarian."
                    }
                </p>

            </div>
        `;

    return;
  }

  inventoryList.innerHTML = filtered
    .map((item) => createInventoryCard(item))
    .join("");

  document.querySelectorAll(".edit-item").forEach((button) => {
    button.addEventListener("click", () => {
      editInventory(button.dataset.id);
    });
  });

  document.querySelectorAll(".delete-item").forEach((button) => {
    button.addEventListener("click", () => {
      openDeleteModal(button.dataset.id);
    });
  });
}

/* =========================================================
   22. INVENTORY CARD
   ========================================================= */

function createInventoryCard(item) {
  return `
        <article class="inventory-card">

            <div class="inventory-top">

                <div class="inventory-book">
                    📚
                </div>

                <span
                    class="
                        recent-status
                        ${getStatusClass(item.condition)}
                    "
                >
                    ${escapeHTML(item.condition)}
                </span>

            </div>


            <h3>
                ${escapeHTML(item.name)}
            </h3>


            <div class="inventory-code">
                ${escapeHTML(item.code)}
            </div>


            <div class="inventory-details">

                <div class="inventory-detail">

                    <span>
                        Ruangan
                    </span>

                    <strong>
                        ${escapeHTML(item.room)}
                    </strong>

                </div>


                <div class="inventory-detail">

                    <span>
                        Jumlah
                    </span>

                    <strong>
                        ${Number(item.quantity)} unit
                    </strong>

                </div>

            </div>


            <div class="inventory-actions">

                <button
                    class="inventory-action edit-item"
                    data-id="${escapeHTML(item.id)}"
                >
                    ✏️ Edit
                </button>


                <button
                    class="inventory-action delete delete-item"
                    data-id="${escapeHTML(item.id)}"
                >
                    🗑️ Hapus
                </button>

            </div>

        </article>
    `;
}

/* =========================================================
   23. SEARCH & FILTER
   ========================================================= */

function setupSearchAndFilter() {
  if (searchInput) {
    searchInput.addEventListener("input", renderInventory);
  }

  if (roomFilter) {
    roomFilter.addEventListener("change", renderInventory);
  }

  if (conditionFilter) {
    conditionFilter.addEventListener("change", renderInventory);
  }

  const resetFilter = document.getElementById("resetFilter");

  if (resetFilter) {
    resetFilter.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
      }

      if (roomFilter) {
        roomFilter.value = "";
      }

      if (conditionFilter) {
        conditionFilter.value = "";
      }

      renderInventory();
    });
  }
}

/* =========================================================
   24. FILTER DATA
   ========================================================= */

function getFilteredInventory() {
  const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const selectedRoom = roomFilter ? roomFilter.value : "";

  const selectedCondition = conditionFilter ? conditionFilter.value : "";

  return inventory.filter((item) => {
    const name = String(item.name || "").toLowerCase();

    const code = String(item.code || "").toLowerCase();

    const matchesKeyword = name.includes(keyword) || code.includes(keyword);

    const matchesRoom = !selectedRoom || item.room === selectedRoom;

    const matchesCondition =
      !selectedCondition || item.condition === selectedCondition;

    return matchesKeyword && matchesRoom && matchesCondition;
  });
}

/* =========================================================
   25. ROOM FILTER
   ========================================================= */

function updateRoomFilter() {
  if (!roomFilter) {
    return;
  }

  const currentValue = roomFilter.value;

  const rooms = [
    ...new Set(inventory.map((item) => item.room).filter(Boolean)),
  ].sort();

  roomFilter.innerHTML = `

        <option value="">
            Semua Ruangan
        </option>

        ${rooms
          .map(
            (room) => `
                    <option
                        value="${escapeHTML(room)}"
                    >
                        ${escapeHTML(room)}
                    </option>
                `,
          )
          .join("")}

    `;

  if (rooms.includes(currentValue)) {
    roomFilter.value = currentValue;
  }
}

/* =========================================================
   26. INVENTORY FORM
   ========================================================= */

function setupInventoryForm() {
  if (!inventoryForm) {
    return;
  }

  inventoryForm.addEventListener("submit", handleFormSubmit);

  const cancelButton = document.getElementById("cancelForm");

  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      resetForm();

      navigateTo("dashboard");
    });
  }

  [itemName, itemCode, itemRoom, itemQuantity, itemCondition]

    .filter(Boolean)

    .forEach((input) => {
      input.addEventListener("input", updatePreview);

      input.addEventListener("change", updatePreview);
    });

  updatePreview();
}

/* =========================================================
   27. HANDLE FORM
   ========================================================= */

function handleFormSubmit(event) {
  event.preventDefault();

  const name = itemName.value.trim();

  const code = itemCode.value.trim();

  const room = itemRoom.value.trim();

  const quantity = Number(itemQuantity.value);

  const condition = itemCondition.value;

  if (!name) {
    showToast("error", "Data belum lengkap", "Nama barang wajib diisi.");

    itemName.focus();

    return;
  }

  if (!code) {
    showToast("error", "Data belum lengkap", "Kode inventaris wajib diisi.");

    itemCode.focus();

    return;
  }

  if (!room) {
    showToast("error", "Data belum lengkap", "Nama ruangan wajib diisi.");

    itemRoom.focus();

    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    showToast("error", "Jumlah tidak valid", "Jumlah barang minimal 1.");

    itemQuantity.focus();

    return;
  }

  if (!condition) {
    showToast("error", "Data belum lengkap", "Silakan pilih kondisi barang.");

    itemCondition.focus();

    return;
  }

  const existingCode = inventory.find(
    (item) =>
      String(item.code).toLowerCase() === code.toLowerCase() &&
      item.id !== editId.value,
  );

  if (existingCode) {
    showToast(
      "error",
      "Kode sudah digunakan",
      "Gunakan kode inventaris yang berbeda.",
    );

    itemCode.focus();

    return;
  }

  /* EDIT */

  if (editId.value) {
    const index = inventory.findIndex((item) => item.id === editId.value);

    if (index !== -1) {
      inventory[index] = {
        ...inventory[index],

        name,
        code,
        room,
        quantity,
        condition,

        updatedAt: new Date().toISOString(),
      };

      addHistory("edit", `Mengubah data "${name}".`);

      saveInventory();

      renderAll();

      resetForm();

      navigateTo("inventory");

      showToast("success", "Data diperbarui", "Perubahan berhasil disimpan.");
    }

    return;
  }

  /* TAMBAH */

  const now = new Date().toISOString();

  const newItem = {
    id: generateId(),

    name,

    code,

    room,

    quantity,

    condition,

    createdAt: now,

    updatedAt: now,
  };

  inventory.unshift(newItem);

  addHistory("add", `Menambahkan "${name}" ke inventaris.`);

  saveInventory();

  renderAll();

  resetForm();

  navigateTo("inventory");

  showToast(
    "success",
    "Data berhasil ditambahkan",
    `${name} berhasil masuk inventaris.`,
  );
}

/* =========================================================
   28. EDIT
   ========================================================= */

function editInventory(id) {
  const item = inventory.find((inventoryItem) => inventoryItem.id === id);

  if (!item) {
    return;
  }

  editId.value = item.id;

  itemName.value = item.name;

  itemCode.value = item.code;

  itemRoom.value = item.room;

  itemQuantity.value = item.quantity;

  itemCondition.value = item.condition;

  const formTitle = document.querySelector("#addPage h2");

  if (formTitle) {
    formTitle.textContent = "Edit Inventaris";
  }

  const submitButton = inventoryForm.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.innerHTML = "💾 Simpan Perubahan";
  }

  updatePreview();

  navigateTo("add");
}

/* =========================================================
   29. RESET FORM
   ========================================================= */

function resetForm() {
  if (!inventoryForm) {
    return;
  }

  inventoryForm.reset();

  editId.value = "";

  const formTitle = document.querySelector("#addPage h2");

  if (formTitle) {
    formTitle.textContent = "Tambah Inventaris";
  }

  const submitButton = inventoryForm.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.innerHTML = "💾 Simpan Data";
  }

  updatePreview();
}

/* =========================================================
   30. PREVIEW
   ========================================================= */

function updatePreview() {
  if (previewName) {
    previewName.textContent = itemName?.value.trim() || "Nama Barang";
  }

  if (previewCode) {
    previewCode.textContent = itemCode?.value.trim() || "INV-000";
  }

  if (previewRoom) {
    previewRoom.textContent = itemRoom?.value.trim() || "Belum dipilih";
  }

  if (previewQuantity) {
    previewQuantity.textContent = itemQuantity?.value
      ? `${itemQuantity.value} unit`
      : "0 unit";
  }

  if (previewCondition) {
    const condition = itemCondition?.value || "Belum dipilih";

    previewCondition.textContent = condition;

    previewCondition.className = `recent-status ${getStatusClass(condition)}`;
  }
}

/* =========================================================
   31. DELETE MODAL
   ========================================================= */

function setupDeleteModal() {
  if (cancelDelete) {
    cancelDelete.addEventListener("click", closeDeleteModal);
  }

  if (confirmDelete) {
    confirmDelete.addEventListener("click", deleteInventory);
  }

  if (deleteModal) {
    deleteModal.addEventListener("click", (event) => {
      if (event.target === deleteModal) {
        closeDeleteModal();
      }
    });
  }
}

function openDeleteModal(id) {
  currentDeleteId = id;

  if (!deleteModal) {
    return;
  }

  deleteModal.classList.remove("hidden");
}

function closeDeleteModal() {
  currentDeleteId = null;

  if (!deleteModal) {
    return;
  }

  deleteModal.classList.add("hidden");
}

/* =========================================================
   32. DELETE INVENTORY
   ========================================================= */

function deleteInventory() {
  if (!currentDeleteId) {
    return;
  }

  const item = inventory.find(
    (inventoryItem) => inventoryItem.id === currentDeleteId,
  );

  if (!item) {
    closeDeleteModal();

    return;
  }

  inventory = inventory.filter(
    (inventoryItem) => inventoryItem.id !== currentDeleteId,
  );

  addHistory("delete", `Menghapus "${item.name}" dari inventaris.`);

  saveInventory();

  renderAll();

  closeDeleteModal();

  showToast("success", "Data dihapus", `${item.name} berhasil dihapus.`);
}

/* =========================================================
   33. NOTIFICATIONS
   ========================================================= */

function renderNotifications() {
  if (!notificationsList) {
    return;
  }

  const lowStock = getLowStockItems();

  if (lowStock.length === 0) {
    notificationsList.innerHTML = `
            <div class="empty-state">

                <span>🔔</span>

                <h4>
                    Tidak ada notifikasi
                </h4>

                <p>
                    Semua stok barang masih aman.
                </p>

            </div>
        `;

    updateNotificationBadge(0);

    return;
  }

  notificationsList.innerHTML = lowStock
    .map(
      (item) => `
                    <div class="notification-item">

                        <div class="notification-icon">
                            ⚠️
                        </div>

                        <div class="notification-info">

                            <strong>
                                Stok rendah:
                                ${escapeHTML(item.name)}
                            </strong>

                            <span>
                                Kode:
                                ${escapeHTML(item.code)}
                                •
                                Ruangan:
                                ${escapeHTML(item.room)}
                            </span>

                        </div>

                        <div class="notification-quantity">
                            ${item.quantity} unit
                        </div>

                    </div>
                `,
    )
    .join("");

  updateNotificationBadge(lowStock.length);
}

/* =========================================================
   34. NOTIFICATION BADGE
   ========================================================= */

function updateNotificationBadge(count) {
  document.querySelectorAll(".nav-badge").forEach((badge) => {
    badge.textContent = count;

    badge.style.display = count > 0 ? "inline-flex" : "none";
  });
}

/* =========================================================
   35. HISTORY
   ========================================================= */

function addHistory(type, description) {
  const entry = {
    id: generateId(),

    type,

    description,

    time: new Date().toISOString(),
  };

  historyData.unshift(entry);

  historyData = historyData.slice(0, 100);

  saveHistory();

  renderHistory();
}

function renderHistory() {
  if (!historyList) {
    return;
  }

  if (historyData.length === 0) {
    historyList.innerHTML = `
            <div class="empty-state">

                <span>🕘</span>

                <h4>
                    Belum ada riwayat
                </h4>

                <p>
                    Aktivitas inventaris akan muncul di sini.
                </p>

            </div>
        `;

    return;
  }

  historyList.innerHTML = historyData
    .map(
      (entry) => `

                    <div class="history-item">

                        <div
                            class="
                                history-icon
                                ${escapeHTML(entry.type)}
                            "
                        >
                            ${getHistoryIcon(entry.type)}
                        </div>


                        <div class="history-content">

                            <strong>
                                ${getHistoryTitle(entry.type)}
                            </strong>

                            <p>
                                ${escapeHTML(entry.description)}
                            </p>

                        </div>


                        <div class="history-time">
                            ${formatDate(entry.time)}
                        </div>

                    </div>

                `,
    )
    .join("");
}

/* =========================================================
   36. HISTORY ICON
   ========================================================= */

function getHistoryIcon(type) {
  if (type === "add") {
    return "➕";
  }

  if (type === "edit") {
    return "✏️";
  }

  if (type === "delete") {
    return "🗑️";
  }

  return "📝";
}

function getHistoryTitle(type) {
  if (type === "add") {
    return "Data Ditambahkan";
  }

  if (type === "edit") {
    return "Data Diperbarui";
  }

  if (type === "delete") {
    return "Data Dihapus";
  }

  return "Aktivitas";
}

/* =========================================================
   37. CLEAR HISTORY
   ========================================================= */

if (clearHistory) {
  clearHistory.addEventListener("click", () => {
    if (historyData.length === 0) {
      showToast("info", "Riwayat kosong", "Belum ada riwayat untuk dihapus.");

      return;
    }

    const confirmed = confirm(
      "Apakah Anda yakin ingin menghapus semua riwayat?",
    );

    if (!confirmed) {
      return;
    }

    historyData = [];

    saveHistory();

    renderHistory();

    showToast(
      "success",
      "Riwayat dihapus",
      "Semua riwayat aktivitas telah dihapus.",
    );
  });
}

/* =========================================================
   38. NAVIGATION
   ========================================================= */

function setupNavigation() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;

      navigateTo(page);
    });
  });
}

function navigateTo(pageName) {
  const pages = document.querySelectorAll(".page");

  pages.forEach((page) => {
    page.classList.remove("active-page");
  });

  const target = document.getElementById(`${pageName}Page`);

  if (target) {
    target.classList.add("active-page");
  }

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  const pageTitles = {
    dashboard: "Dashboard",

    inventory: "Data Inventaris",

    add: "Tambah Inventaris",

    notifications: "Notifikasi",

    history: "Riwayat Aktivitas",

    settings: "Pengaturan",
  };

  const headerTitle = document.querySelector(".header-title");

  if (headerTitle) {
    headerTitle.textContent = pageTitles[pageName] || "InLib";
  }

  const sidebar = document.querySelector(".sidebar");

  const overlay = document.getElementById("sidebarOverlay");

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  if (overlay) {
    overlay.classList.remove("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =========================================================
   39. MOBILE SIDEBAR
   ========================================================= */

function setupMobileSidebar() {
  const menuButton = document.querySelector(".menu-button");

  const sidebar = document.querySelector(".sidebar");

  const overlay = document.getElementById("sidebarOverlay");

  if (!menuButton || !sidebar) {
    return;
  }

  menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");

    if (overlay) {
      overlay.classList.toggle("active");
    }
  });

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");

      overlay.classList.remove("active");
    });
  }
}

/* =========================================================
   40. DARK MODE
   ========================================================= */

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }

  updateThemeButtons();
}

function setupThemeToggle() {
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (settingsThemeToggle) {
    settingsThemeToggle.addEventListener("click", toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");

  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);

  localStorage.setItem(THEME_KEY, newTheme);

  updateThemeButtons();

  showToast(
    "success",
    newTheme === "dark" ? "Dark Mode" : "Light Mode",
    newTheme === "dark"
      ? "Tema gelap berhasil digunakan."
      : "Tema terang berhasil digunakan.",
  );
}

function updateThemeButtons() {
  const theme = document.documentElement.getAttribute("data-theme");

  if (themeToggle) {
    themeToggle.innerHTML = theme === "dark" ? "☀️" : "🌙";

    themeToggle.title =
      theme === "dark" ? "Gunakan Light Mode" : "Gunakan Dark Mode";
  }

  if (settingsThemeToggle) {
    settingsThemeToggle.innerHTML =
      theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
  }
}

/* =========================================================
   41. SETTINGS
   ========================================================= */

function setupSettings() {
  if (exportData) {
    exportData.addEventListener("click", exportInventory);
  }

  if (importDataButton) {
    importDataButton.addEventListener("click", () => {
      if (importDataInput) {
        importDataInput.click();
      }
    });
  }

  if (importDataInput) {
    importDataInput.addEventListener("change", importInventory);
  }

  if (backupData) {
    backupData.addEventListener("click", backupInventory);
  }

  if (clearAllData) {
    clearAllData.addEventListener("click", clearAllInventory);
  }
}

/* =========================================================
   42. EXPORT
   ========================================================= */

function exportInventory() {
  if (inventory.length === 0) {
    showToast("info", "Tidak ada data", "Belum ada inventaris untuk diekspor.");

    return;
  }

  const data = {
    app: "InLib",

    type: "inventory",

    exportedAt: new Date().toISOString(),

    data: inventory,
  };

  downloadJSON(data, "inlib-inventory.json");

  showToast("success", "Export berhasil", "Data inventaris berhasil diekspor.");
}

/* =========================================================
   43. IMPORT
   ========================================================= */

function importInventory(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const imported = JSON.parse(reader.result);

      const importedData = Array.isArray(imported) ? imported : imported.data;

      if (!Array.isArray(importedData)) {
        throw new Error("Format tidak valid");
      }

      const validData = importedData.filter((item) => {
        const name = String(item?.name ?? "").trim();
        const code = String(item?.code ?? "").trim();
        const room = String(item?.room ?? "").trim();
        const quantity = Number(item?.quantity);
        const condition = String(item?.condition ?? "").trim();

        return (
          name.length > 0 &&
          code.length > 0 &&
          room.length > 0 &&
          Number.isInteger(quantity) &&
          quantity >= 1 &&
          ["Baik", "Rusak Ringan", "Rusak Berat"].includes(condition)
        );
      });

      if (validData.length === 0) {
        throw new Error("Tidak ada data valid");
      }

      const confirmed = confirm(
        `Import ${validData.length} data inventaris? Data lama dengan kode yang sama akan diperbarui.`,
      );

      if (!confirmed) {
        return;
      }

      validData.forEach((item) => {
        const existingIndex = inventory.findIndex(
          (current) =>
            String(current.code).toLowerCase() ===
            String(item.code).toLowerCase(),
        );

        const normalized = {
          id: existingIndex !== -1 ? inventory[existingIndex].id : generateId(),

          name: String(item.name).trim(),

          code: String(item.code).trim(),

          room: String(item.room).trim(),

          quantity: Number(item.quantity),

          condition: String(item.condition).trim(),

          createdAt:
            existingIndex !== -1
              ? inventory[existingIndex].createdAt
              : item.createdAt || new Date().toISOString(),

          updatedAt: new Date().toISOString(),
        };

        if (existingIndex !== -1) {
          inventory[existingIndex] = {
            ...inventory[existingIndex],
            ...normalized,
          };
        } else {
          inventory.unshift(normalized);
        }
      });

      addHistory("add", `Mengimpor ${validData.length} data inventaris.`);

      saveInventory();

      renderAll();

      showToast(
        "success",
        "Import berhasil",
        `${validData.length} data berhasil dimasukkan.`,
      );
    } catch (error) {
      console.error(error);

      showToast(
        "error",
        "Import gagal",
        "File JSON tidak memiliki format yang sesuai.",
      );
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}

/* =========================================================
   44. BACKUP
   ========================================================= */

function backupInventory() {
  const backup = {
    app: "InLib",

    version: "2.0",

    backupDate: new Date().toISOString(),

    inventory,

    history: historyData,

    theme: localStorage.getItem(THEME_KEY) || "light",
  };

  downloadJSON(backup, "inlib-backup.json");

  showToast(
    "success",
    "Backup berhasil",
    "Data inventaris dan riwayat berhasil dicadangkan.",
  );
}

/* =========================================================
   45. CLEAR ALL
   ========================================================= */

function clearAllInventory() {
  if (inventory.length === 0) {
    showToast(
      "info",
      "Data sudah kosong",
      "Tidak ada data inventaris untuk dihapus.",
    );

    return;
  }

  const confirmed = confirm(
    "Apakah Anda yakin ingin menghapus SEMUA data inventaris?",
  );

  if (!confirmed) {
    return;
  }

  const secondConfirm = confirm(
    "Tindakan ini tidak dapat dibatalkan. Lanjutkan?",
  );

  if (!secondConfirm) {
    return;
  }

  const totalDeleted = inventory.length;

  inventory = [];

  saveInventory();

  addHistory(
    "delete",
    `Menghapus seluruh data inventaris (${totalDeleted} data).`,
  );

  renderAll();

  showToast(
    "success",
    "Semua data dihapus",
    "Data inventaris telah dikosongkan.",
  );
}

/* =========================================================
   46. DOWNLOAD JSON
   ========================================================= */

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

/* =========================================================
   47. TOAST
   ========================================================= */

function showToast(type, title, message) {
  if (!toast || !toastIcon || !toastTitle || !toastMessage) {
    return;
  }

  clearTimeout(toastTimeout);

  const icons = {
    success: "✓",

    error: "!",

    info: "i",

    warning: "⚠",
  };

  toastIcon.textContent = icons[type] || "i";

  toastTitle.textContent = title;

  toastMessage.textContent = message;

  toast.classList.add("show");

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/* =========================================================
   48. STATUS CLASS
   ========================================================= */

function getStatusClass(condition) {
  if (condition === "Baik") {
    return "status-good";
  }

  if (condition === "Rusak Ringan") {
    return "status-warning";
  }

  if (condition === "Rusak Berat") {
    return "status-danger";
  }

  return "";
}

/* =========================================================
   49. FORMAT DATE
   ========================================================= */

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  });
}

/* =========================================================
   50. GENERATE ID
   ========================================================= */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/* =========================================================
   51. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* =========================================================
   52. KEYBOARD SHORTCUT
   ========================================================= */

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDeleteModal();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    if (searchInput) {
      event.preventDefault();

      navigateTo("inventory");

      searchInput.focus();
    }
  }
});

/* =========================================================
   53. SERVICE WORKER
   ========================================================= */

function setupServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./service-worker.js")

        .then((registration) => {
          console.log("InLib: Service Worker aktif", registration.scope);
        })

        .catch((error) => {
          console.error("InLib: Service Worker gagal:", error);
        });
    });
  }
}
