// js/data.js
const KEY = "maintenance-demo-v1";

const initialSeeds = [
  { id: 1, title: "Broken classroom light", category: "Electrical", description: "The light in Room B12 does not switch on.", status: "Pending" },
  { id: 2, title: "Leaking water tap", category: "Plumbing", description: "Sink tap in the ground floor restroom is constantly dripping.", status: "In progress" },
  { id: 3, title: "Wobbly lecture chair", category: "Furniture", description: "Front row seat leg is loose and unstable.", status: "Completed" },
  { id: 4, title: "Blown projector bulb", category: "Electrical", description: "Lecture theatre 3 projector lamp needs replacement.", status: "Pending" },
  { id: 5, title: "Blocked corridor drain", category: "Plumbing", description: "Water pooling outside block C hallway after rain.", status: "In progress" },
  { id: 6, title: "Broken door handle", category: "Furniture", description: "Office 14 door handle fell off from the inside.", status: "Pending" },
  { id: 7, title: "Faulty wall socket", category: "Electrical", description: "Computer lab socket sparks when plugged into.", status: "Completed" },
  { id: 8, title: "Missing whiteboard eraser", category: "Furniture", description: "Room A4 needs a replacement eraser and markers.", status: "Completed" }
];

function getStoredRecords() {
  const data = localStorage.getItem(KEY);
  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(initialSeeds));
    return [...initialSeeds];
  }
  return JSON.parse(data);
}

function saveStoredRecords(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

export const recordService = {
  async list() {
    return getStoredRecords();
  },

  async get(id) {
    const records = getStoredRecords();
    const record = records.find(r => r.id === Number(id));
    if (!record) {
      throw new Error(`Record with id ${id} not found.`);
    }
    return { ...record };
  },

  async create(recordData) {
    const records = getStoredRecords();
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
    
    const newRecord = {
      id: newId,
      title: recordData.title.trim(),
      category: recordData.category.trim(),
      description: recordData.description.trim(),
      status: recordData.status
    };

    records.push(newRecord);
    saveStoredRecords(records);
    return { ...newRecord };
  },

  async update(id, recordData) {
    const records = getStoredRecords();
    const index = records.findIndex(r => r.id === Number(id));
    if (index === -1) {
      throw new Error(`Record with id ${id} not found.`);
    }

    records[index] = {
      id: Number(id),
      title: recordData.title.trim(),
      category: recordData.category.trim(),
      description: recordData.description.trim(),
      status: recordData.status
    };

    saveStoredRecords(records);
    return { ...records[index] };
  },

  async remove(id) {
    let records = getStoredRecords();
    const index = records.findIndex(r => r.id === Number(id));
    if (index === -1) {
      throw new Error(`Record with id ${id} not found.`);
    }

    records = records.filter(r => r.id !== Number(id));
    saveStoredRecords(records);
    return { message: "Record deleted successfully" };
  }
};