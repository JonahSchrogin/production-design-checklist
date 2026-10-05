// Checklist state management & Compact URL bitmask encoding

const DEFAULT_DATA = {
    title: "Production Design QA Checklist",
    desc: "IBM Design Language & Brand Production Sign-Off Checklist",
    categories: [
        {
            name: "1. File Setup and Artboards",
            items: [
                "Are the file and Artboards named correctly? (No spaces, no dashes, only underscores) i.e. 241018_IBM_Grammys_2025_email_600x215",
                "Is there a Notes layer or Slug layer to indicate asset type, size and other important information, especially for the printer?",
                "For print, is artwork going to the bleed? For digital, is artwork going to the edge of the canvas?"
            ]
        },
        {
            name: "2. Grid, Layout and Imagery",
            items: [
                "Is the layout utilizing an underlying grid and margins? — See [2x Grid on IDL](https://www.ibm.com/design/language/2x-grid)",
                "Are images at the proper resolution? — See [Image resolution Box note](https://ibm.box.com/s/mh82n6z5m0gvtfik6w4j389n6etgo1uu)"
            ]
        },
        {
            name: "3. Color, Brand Assets and Accessibility",
            items: [
                "Using the correct colors? Is the file in correct color space? Does it pass contrast ratios for accessibility? — See [Color on IDL](https://www.ibm.com/design/language/color)",
                "Using the correct 8-bar logo and rebus? (Reverse/positive, with or without registration mark) — See [IBM 8-bar logo usage Box note](https://ibm.box.com/s/rbdiwe6jyz4rxnircysh9q2786hjkx87)"
            ]
        },
        {
            name: "4. Typography and IBM Editorial Style",
            items: [
                "Is typography used correctly ([IBM Plex](https://www.ibm.com/plex/)), and are type scales used appropriately? — See [Type scale on IDL](https://www.ibm.com/design/language/typography/type-scale)",
                "Are there any widows, orphans or bad line breaks?",
                "Has IBM Style been checked for common items such as dates, times, capitalization, headlines and subheads, smart quotes vs. prime marks and serial commas? — Refer to [IBM Style](https://www.ibm.com/docs/en/ibm-style)",
                "Has the file been spell-checked?"
            ]
        },
        {
            name: "5. Review and Approvals",
            items: [
                "Has it been design- and copy-approved before sharing with any and all stakeholders?"
            ]
        }
    ]
};

let currentChecklist = JSON.parse(JSON.stringify(DEFAULT_DATA));
let checkedState = {}; // Key: "catIdx_itemIdx", Value: boolean

// Flatten items to compute compact bitmask
function getOrderedKeys(data) {
    const keys = [];
    if (!data || !data.categories) return keys;
    data.categories.forEach((cat, catIdx) => {
        cat.items.forEach((_, itemIdx) => {
            keys.push(`${catIdx}_${itemIdx}`);
        });
    });
    return keys;
}

// Convert checks map into a tiny hex token like "1a" or ""
function checksToToken(data, checks = {}) {
    const keys = getOrderedKeys(data);
    const binaryStr = keys.map(k => (checks[k] ? "1" : "0")).join("");
    if (!binaryStr.includes("1")) {
        return "";
    }
    return parseInt(binaryStr, 2).toString(36);
}

// Parse tiny token back into checks map
function tokenToChecks(data, token) {
    const checks = {};
    if (!token) return checks;
    try {
        const keys = getOrderedKeys(data);
        const num = parseInt(token, 36);
        let binaryStr = num.toString(2);
        while (binaryStr.length < keys.length) {
            binaryStr = "0" + binaryStr;
        }
        keys.forEach((key, idx) => {
            if (binaryStr[idx] === "1") {
                checks[key] = true;
            }
        });
    } catch (e) {
        console.warn("Error decoding checks token:", e);
    }
    return checks;
}

// Compact URL encoding - always generates short query parameter ?c=
function encodeCompact(data, checks = {}) {
    const token = checksToToken(data, checks);
    return token ? `?c=${token}` : "";
}

function decodeFromLocation() {
    const search = window.location.search;
    const hash = window.location.hash;

    // Clear hash if any leftover hash exists
    if (hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (search && search.includes("c=")) {
        const urlParams = new URLSearchParams(search);
        const token = urlParams.get("c");
        currentChecklist = JSON.parse(JSON.stringify(DEFAULT_DATA));
        checkedState = tokenToChecks(currentChecklist, token);
        return true;
    }

    currentChecklist = JSON.parse(JSON.stringify(DEFAULT_DATA));
    checkedState = {};
    return false;
}

// Render active checklist
function renderChecklist() {
    const titleEl = document.getElementById("checklistTitleDisplay");
    const descEl = document.getElementById("checklistDescDisplay");
    const gridEl = document.getElementById("checklistGrid");

    titleEl.textContent = currentChecklist.title || "Production Design QA Checklist";
    descEl.textContent = currentChecklist.desc || "";

    gridEl.innerHTML = "";

    let totalItems = 0;
    let completedItems = 0;

    currentChecklist.categories.forEach((cat, catIdx) => {
        const catCard = document.createElement("div");
        catCard.className = "category-card";

        let catTotal = cat.items.length;
        let catChecked = 0;

        cat.items.forEach((_, itemIdx) => {
            const key = `${catIdx}_${itemIdx}`;
            if (checkedState[key]) catChecked++;
        });

        const isAllDone = catTotal > 0 && catChecked === catTotal;

        const catHeader = document.createElement("div");
        catHeader.className = "category-header";
        catHeader.innerHTML = `
            <span class="category-title">${escapeHtml(cat.name)}</span>
            <span class="category-badge ${isAllDone ? 'all-done' : ''}" id="cat-badge-${catIdx}">
                ${catChecked}/${catTotal} done
            </span>
        `;
        catCard.appendChild(catHeader);

        const ul = document.createElement("ul");
        ul.className = "checklist-items";

        cat.items.forEach((itemText, itemIdx) => {
            totalItems++;
            const key = `${catIdx}_${itemIdx}`;
            const isChecked = !!checkedState[key];
            if (isChecked) completedItems++;

            const li = document.createElement("li");
            li.className = `checklist-item ${isChecked ? 'checked' : ''}`;
            
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = isChecked;
            checkbox.id = `item_${key}`;

            const label = document.createElement("label");
            label.className = "item-text";
            label.htmlFor = `item_${key}`;
            label.innerHTML = formatMarkdownLinks(escapeHtml(itemText));

            const toggleCheck = (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
                checkedState[key] = checkbox.checked;
                updateUrlState();
                renderChecklist();
            };

            checkbox.addEventListener("change", (e) => {
                checkedState[key] = e.target.checked;
                updateUrlState();
                renderChecklist();
            });

            li.addEventListener("click", (e) => {
                if (e.target.tagName !== "INPUT" && e.target.tagName !== "LABEL" && e.target.tagName !== "A") {
                    toggleCheck(e);
                }
            });

            li.appendChild(checkbox);
            li.appendChild(label);
            ul.appendChild(li);
        });

        catCard.appendChild(ul);
        gridEl.appendChild(catCard);
    });

    // Update global progress bar
    updateProgressBar(completedItems, totalItems);
}

function updateProgressBar(completed, total) {
    const statsEl = document.getElementById("progressStats");
    const fillEl = document.getElementById("progressBarFill");

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    statsEl.textContent = `${completed} of ${total} completed (${percentage}%)`;
    fillEl.style.width = `${percentage}%`;
}

function updateUrlState() {
    const encoded = encodeCompact(currentChecklist, checkedState);
    const newUrl = `${window.location.origin}${window.location.pathname}${encoded}`;
    history.replaceState(null, "", newUrl);
}

// Editor Builder Logic
function renderEditor() {
    document.getElementById("inputTitle").value = currentChecklist.title;
    document.getElementById("inputDesc").value = currentChecklist.desc;

    const builderContainer = document.getElementById("categoriesBuilder");
    builderContainer.innerHTML = "";

    currentChecklist.categories.forEach((cat, catIdx) => {
        const catBox = document.createElement("div");
        catBox.className = "category-edit-box";
        catBox.id = `catEditBox_${catIdx}`;

        catBox.innerHTML = `
            <div class="category-edit-header">
                <input type="text" class="cat-name-input" value="${escapeHtml(cat.name)}" placeholder="Category Name" style="font-weight: 600;">
                <button type="button" class="btn-danger-sm btn-delete-cat" data-cat-idx="${catIdx}">Delete Category</button>
            </div>
            <div class="form-group">
                <label>Checklist Items (one item per line):</label>
                <textarea rows="4" class="cat-items-input">${escapeHtml(cat.items.join("\n"))}</textarea>
            </div>
        `;

        builderContainer.appendChild(catBox);
    });

    // Attach category delete listeners
    document.querySelectorAll(".btn-delete-cat").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.target.getAttribute("data-cat-idx"), 10);
            currentChecklist.categories.splice(idx, 1);
            renderEditor();
        });
    });
}

function saveEditorChanges() {
    const title = document.getElementById("inputTitle").value.trim() || "Production Design QA Checklist";
    const desc = document.getElementById("inputDesc").value.trim();

    const catBoxes = document.querySelectorAll(".category-edit-box");
    const newCategories = [];

    catBoxes.forEach(box => {
        const catName = box.querySelector(".cat-name-input").value.trim() || "Untitled Category";
        const itemsRaw = box.querySelector(".cat-items-input").value;
        const items = itemsRaw
            .split("\n")
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (items.length > 0) {
            newCategories.push({
                name: catName,
                items: items
            });
        }
    });

    currentChecklist = {
        title,
        desc,
        categories: newCategories
    };

    // Reset checked state on structure edit
    checkedState = {};
    updateUrlState();
    renderChecklist();

    document.getElementById("editorPanel").style.display = "none";
    showToast("Checklist saved!");
}

// Helpers
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatMarkdownLinks(str) {
    if (!str) return "";
    return str.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="item-link" onclick="event.stopPropagation()">$1</a>');
}

function showToast(msg) {
    const toast = document.getElementById("toastMessage");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    decodeFromLocation();
    renderChecklist();

    // Toggle Editor Panel
    const btnEditMode = document.getElementById("btnEditMode");
    const editorPanel = document.getElementById("editorPanel");
    btnEditMode.addEventListener("click", () => {
        const isHidden = editorPanel.style.display === "none";
        if (isHidden) {
            renderEditor();
            editorPanel.style.display = "block";
            editorPanel.scrollIntoView({ behavior: "smooth" });
        } else {
            editorPanel.style.display = "none";
        }
    });

    document.getElementById("btnCancelEdit").addEventListener("click", () => {
        editorPanel.style.display = "none";
    });

    document.getElementById("btnAddCategory").addEventListener("click", () => {
        currentChecklist.categories.push({
            name: `Category ${currentChecklist.categories.length + 1}`,
            items: ["New item 1", "New item 2"]
        });
        renderEditor();
    });

    document.getElementById("btnSaveCustomList").addEventListener("click", saveEditorChanges);

    // Reset Progress
    document.getElementById("btnResetProgress").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all checked items?")) {
            checkedState = {};
            updateUrlState();
            renderChecklist();
            showToast("Checks cleared.");
        }
    });

    // Share Modal
    const shareModal = document.getElementById("shareModal");
    const shareUrlInput = document.getElementById("shareUrlInput");
    const includeProgressCheckbox = document.getElementById("includeProgressCheckbox");

    const generateShareUrl = () => {
        const checksToInclude = includeProgressCheckbox.checked ? checkedState : {};
        const encoded = encodeCompact(currentChecklist, checksToInclude);
        const url = `${window.location.origin}${window.location.pathname}${encoded}`;
        shareUrlInput.value = url;
    };

    document.getElementById("btnShareLink").addEventListener("click", () => {
        generateShareUrl();
        shareModal.classList.add("active");
    });

    document.getElementById("btnCloseShareModal").addEventListener("click", () => {
        shareModal.classList.remove("active");
    });

    includeProgressCheckbox.addEventListener("change", generateShareUrl);

    document.getElementById("btnCopyShareUrl").addEventListener("click", () => {
        shareUrlInput.select();
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
            showToast("Shareable link copied to clipboard!");
            shareModal.classList.remove("active");
        }).catch(() => {
            document.execCommand("copy");
            showToast("Link copied!");
            shareModal.classList.remove("active");
        });
    });
});
