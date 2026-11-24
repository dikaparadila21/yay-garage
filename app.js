const STORAGE_KEY = 'yayGarageProducts';

const defaults = [
  {id:'1', name:'Honda CRF 150L', type:'150 CC', price:35000000, status:'Ready', description:'Kondisi terawat, remuk tunggu, siap untuk trail dan harian.', image:''},
  {id:'2', name:'Kawasaki KLX 150', type:'150 CC', price:32000000, status:'Ready', description:'Unit standar pabrikan, mesin sehat dan siap test ride.', image:''},
  {id:'3', name:'Yamaha WR 155R', type:'155 CC', price:38000000, status:'Inden', description:'Motor baru, dapat dibantu proses BPKB dan STNK.', image:''},
  {id:'4', name:'Beta RR 250', type:'250 CC', price:85000000, status:'Ready', description:'Special unit untuk petualangan berat dan kompetisi.', image:''}
];

let products = loadProducts();
let editingImage = '';

const grid = document.querySelector('#productGrid');
const modal = document.querySelector('#productModal');
const form = document.querySelector('#productForm');

function loadProducts(){
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(saved) ? saved : defaults; }
  catch { return defaults; }
}

function saveProducts(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }

function formatRupiah(value){
  return new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(Number(value)||0);
}

function render(){
  const search = document.querySelector('#search').value.toLowerCase();
  const type = document.querySelector('#typeFilter').value;
  const filtered = products.filter(p => (!type || p.type === type) && (`${p.name} ${p.type} ${p.description}`.toLowerState || '').toLowerCase().includes(search));

  grid.innerHTML = filtered.map(p => `
    <article class="card">
      <div class="card-image">${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">` : `<div class="placeholder">${escapeHtml(p.name.slice(0,2).toUpperCase())}</div>`}</div>
      <div class="card-body">
        <div class="card-top"><h3>${escapeHtml(p.name)}</h3><span class="badge ${p.status.toLowerCase()}">${escapeHtml(p.status)}</span></div>
        <p class="type">Tipe ${escapeHtml(p.type)}</p>
        <div class="price">${formatRupiah(p.price)}</div>
        <div class="card-actions"><button class="edit" data-edit="${p.id}">Edit</button><button class="delete" data-delete="${p.id}">Hapus</button></div>
      </div>
    </article>`).join('');

  document.querySelector('#emptyState').style.display = filtered.length ? 'none' : 'block';
  const types = [...new Set(products.map(p => p.type))].sort();
  const filter = document.querySelector('#typeFilter');
  const current = filter.value;
  filter.innerHTML = '<option value="">Semua tipe</option>' + types.map(t => `<option${t === current ? ' selected' : ''} value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
}

function escapeHtml(text){
  const div = document.createElement('div'); div.textContent = text == null ? '' : String(text); return div.innerHTML;
}

function openForm(product){
  document.querySelector('#modalTitle').textContent = product ? 'Edit Motor' : 'Tambah Motor';
  document.querySelector('#productId').value = product?.id || '';
  document.querySelector('#name').value = product?.name || '';
  document.querySelector('#type').value = product?.type || '';
  document.querySelector('#price').value = product?.price || '';
  document.querySelector('#status').value = product?.status || 'Ready';
  document.querySelector('#description').value = product?.description || '';
  editingImage = product?.image || '';
  document.querySelector('#imagePreview').innerHTML = editingImage ? `<img src="${editingImage}" alt="Preview">` : '';
  document.querySelector('#imageFile').value = '';
  modal.showModal();
}

document.querySelector('#openAdmin').addEventListener('click', () => openForm());
document.querySelector('#closeModal').addEventListener('click', () => modal.close());

document.querySelector('#imageFile').addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { editingImage = reader.result; document.querySelector('#imagePreview').innerHTML = `<img src="${editingImage}" alt="Preview">`; };
  reader.readAsDataURL(file);
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const id = document.querySelector('#productId').value;
  const product = {
    id: id || String(Date.now()),
    name: document.querySelector('#name').value.trim(),
    type: document.querySelector('#type').value.trim(),
    price: Number(document.querySelector('#price').value),
    status: document.querySelector('#status').value,
    description: document.querySelector('#description').value.trim(),
    image: editingImage
  };
  if (id) products = products.map(p => p.id === id ? product : p); else products.unshift(product);
  saveProducts(); render(); modal.close();
});

grid.addEventListener('click', event => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) openForm(products.find(p => p.id === editId));
  if (deleteId && confirm('Hapus produk ini?')) {
    products = products.filter(p => p.id !== deleteId); saveProducts(); render();
  }
});

document.querySelector('#search').addEventListener('input', render);
document.querySelector('#typeFilter').addEventListener('change', render);

render();
