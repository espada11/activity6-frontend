// js/app.js
import { recordService } from "./data.js";

let records = [];
let editingId = null;

// DOM Elements
const recordForm = document.getElementById("record-form");
const recordListEl = document.getElementById("record-list");
const statusMessageEl = document.getElementById("status-message");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const recordCountEl = document.getElementById("record-count");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const saveBtn = document.getElementById("save-btn");
const formTitle = document.getElementById("form-title");

document.addEventListener("DOMContentLoaded", () => {
  loadAndRender();

  if (recordForm) recordForm.addEventListener("submit", handleFormSubmit);
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", resetForm);
  if (searchInput) searchInput.addEventListener("input", renderRecords);
  if (statusFilter) statusFilter.addEventListener("change", renderRecords);
});

async function loadAndRender() {
  try {
    records = await recordService.list();
    renderRecords();
  } catch (error) {
    showStatus(`Failed to load records: ${error.message}`, "error");
  }
}

function renderRecords() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedStatus = statusFilter ? statusFilter.value : "";

  const filtered = records.filter(record => {
    const matchesSearch = 
      record.title.toLowerCase().includes(searchTerm) ||
      record.description.toLowerCase().includes(searchTerm) ||
      record.category.toLowerCase().includes(searchTerm);
      
    const matchesStatus = !selectedStatus || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (recordCountEl) {
    recordCountEl.textContent = `Showing ${filtered.length} of ${records.length} records`;
  }

  recordListEl.innerHTML = "";

  if (filtered.length === 0) {
    recordListEl.innerHTML = `<tr><td colspan="5" class="empty-state">No records found matching your criteria.</td></tr>`;
    return;
  }

  filtered.forEach(record => {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = record.title;

    const tdCategory = document.createElement("td");
    tdCategory.textContent = record.category;

    const tdDesc = document.createElement("td");
    tdDesc.textContent = record.description;

    const tdStatus = document.createElement("td");
    tdStatus.textContent = record.status;

    const tdActions = document.createElement("td");
    tdActions.className = "action-buttons";

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.className = "btn-view";
    viewBtn.onclick = () => handleView(record.id);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-edit";
    editBtn.onclick = () => handleEditPrep(record);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn-delete";
    deleteBtn.onclick = () => handleDelete(record.id);

    tdActions.append(viewBtn, editBtn, deleteBtn);
    tr.append(tdTitle, tdCategory, tdDesc, tdStatus, tdActions);
    recordListEl.appendChild(tr);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const titleInput = document.getElementById("title-input");
  const categoryInput = document.getElementById("category-input");
  const descriptionInput = document.getElementById("description-input");
  const statusInput = document.getElementById("status-input");

  const title = titleInput.value.trim();
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();
  const status = statusInput.value;

  // Length validations matching requirements
  if (title.length < 3 || title.length > 80) {
    showStatus("Title must be between 3 and 80 characters.", "error");
    return;
  }
  if (category.length < 2 || category.length > 40) {
    showStatus("Category must be between 2 and 40 characters.", "error");
    return;
  }
  if (description.length < 5 || description.length > 300) {
    showStatus("Description must be between 5 and 300 characters.", "error");
    return;
  }

  const payload = { title, category, description, status };

  try {
    if (editingId) {
      await recordService.update(editingId, payload);
      showStatus("Record updated successfully!", "success");
    } else {
      await recordService.create(payload);
      showStatus("Record added successfully!", "success");
    }

    resetForm();
    records = await recordService.list();
    renderRecords();
  } catch (error) {
    showStatus(`Action failed: ${error.message}`, "error");
  }
}

async function handleView(id) {
  try {
    const record = await recordService.get(id);
    alert(`Record Details (ID: ${record.id})\n\nTitle: ${record.title}\nCategory: ${record.category}\nStatus: ${record.status}\nDescription: ${record.description}`);
  } catch (error) {
    showStatus(error.message, "error");
  }
}

function handleEditPrep(record) {
  editingId = record.id;
  document.getElementById("title-input").value = record.title;
  document.getElementById("category-input").value = record.category;
  document.getElementById("description-input").value = record.description;
  document.getElementById("status-input").value = record.status;

  formTitle.textContent = `Edit Record #${record.id}`;
  saveBtn.textContent = "Save Changes";
  cancelEditBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  editingId = null;
  recordForm.reset();
  formTitle.textContent = "Add New Request";
  saveBtn.textContent = "Add Record";
  cancelEditBtn.style.display = "none";
}

async function handleDelete(id) {
  const confirmed = confirm("Are you sure you want to delete this record?");
  if (!confirmed) return;

  try {
    await recordService.remove(id);
    showStatus("Record deleted successfully.", "success");
    records = await recordService.list();
    renderRecords();
  } catch (error) {
    showStatus(error.message, "error");
  }
}

function showStatus(message, type) {
  if (!statusMessageEl) return;
  statusMessageEl.textContent = message;
  statusMessageEl.className = `status-banner status-${type}`;
  setTimeout(() => {
    statusMessageEl.textContent = "";
    statusMessageEl.className = "";
  }, 4000);
}