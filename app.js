const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek"];
const subjects = [
    {id: 1, subject: "Magyar"},
    {id: 2, subject: "Matematika"},
    {id: 3, subject: "Történelem"},
    {id: 4, subject: "Biológia"},
    {id: 5, subject: "Torna"}
];

const list = document.getElementById("subjects");
subjects.forEach(s => {
   const btn = document.createElement("button");
   btn.type = "button";
   btn.textContent = s.subject;
   btn.className = "btn btn-outline-primary";
   btn.draggable = true;

   btn.addEventListener("dragstart", (e) => {
       e.dataTransfer.setData("text/plain", JSON.stringify({
           id: s.id, subject: s.subject
       }));
   });

   list.appendChild(btn);
});

const daysRow = document.getElementById("days-row");
days.forEach(day => {
   const th = document.createElement("th");
   th.textContent = day;

   daysRow.appendChild(th);
});

const body = document.getElementById("grid-body");
for(let i = 8; i <= 16; i++) {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = String(i) + ":00";
    tr.appendChild(th);

    days.forEach(() => {
       const td = document.createElement("td");
       td.addEventListener("dragover", (e) => {e.preventDefault();});
       td.addEventListener("drop", (e) => {
           e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData("text/plain"));
            if(!td.hasChildNodes()) {
                td.textContent = data.subject;
            }
            else {
                if(confirm("Biztosan ki akarod cserélni ezt az órát?")) {
                    td.textContent = data.subject;
                }
            }
       });
       tr.appendChild(td);
    });

    body.appendChild(tr);
}

const KEY = "classKey";

function readAll() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
}

function writeAll(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj));
}

function readTable() {
    return Array.from(body.querySelectorAll("tr")).map(tr =>
        Array.from(tr.querySelectorAll("td")).map(td => {
            const t = (td.textContent || "").trim();
            return t ? t : null;
        })
    );
}

function writeTable(obj) {
    body.querySelectorAll("tr").forEach((tr, r) => {
       tr.querySelectorAll("td").forEach((td, c) => {
           if(obj && obj[r] && obj[r][c] !== null) {
               td.textContent = obj[r][c];
           }
           else {
               td.textContent = "";
           }
       })
    });
}

function refreshList1() {
    const savedList = document.getElementById("saved");
    savedList.innerText = "";
    const all = readAll();
    const names = Object.keys(all);

    if(names.length === 0){
        const text = document.createElement("small");
        text.className = "text-muted";
        text.textContent = "Még nincs mentett órarend";
        savedList.appendChild(text);
        return;
    }

    names.forEach(name => {
        const li = document.createElement("li");
        li.className = "d-flex justify-content-between align-items-center gap-2 mb-2";
       const loadBtn = document.createElement("button");
        loadBtn.className = "btn btn-primary fixed-btn";
       loadBtn.textContent = name;
       loadBtn.addEventListener("click", () => {
          writeTable(all[name]);
       });
       const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger";
       delBtn.textContent = "Törlés";
       delBtn.addEventListener("click", () => {
          const current = readAll();
          delete current[name];
          writeAll(current);
          refreshList1();
       });

       li.appendChild(loadBtn);
       li.appendChild(delBtn);
       savedList.appendChild(li);
    });
}

document.getElementById("saveBtn").addEventListener("click", () => {
   const name = document.getElementById("schName").value.trim();
   if(!name) {
       alert("Ne hagyd üresen a mezőt");
       return;
   }
   const all = readAll();
   if(all[name]) {
       alert("Már létezik ilyen nevű órarend");
       return;
   }

   all[name] = readTable();
   writeAll(all);
   refreshList1();
   alert("Órarend sikeresen elmentve");
   writeTable();
});

document.getElementById("clearBtn").addEventListener("click", () => {
   if(confirm("Biztosan kiüríted az egész órarendet?")) {
       writeTable();
   }
});

refreshList1();