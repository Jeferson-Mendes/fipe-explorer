const mockFavorites = [
    {
        type: 'carros',
        brandCode: '23',
        brandName: 'GM - Chevrolet',
        modelCode: 8950,
        modelName: 'ONIX SEDAN Plus LT 1.0 12V Flex 4p Mec.',
        pictureUrl: 'https://image1.mobiauto.com.br/images/api/images/v1.0/110103727/transform/fl_progressive,f_webp,q_70',
        yearCode: '2023-1',
        yearNome: '2023 Gasolina'
    },
    {
        type: 'carros',
        brandCode: '23',
        brandName: 'GM - Chevrolet',
        modelCode: 8950,
        modelName: 'ONIX SEDAN Plus LT 1.0 12V Flex 4p Mec.',
        pictureUrl: 'https://img.olx.com.br/images/80/804237747617862.jpg',
        yearCode: '2022-1',
        yearNome: '2022 Gasolina'
    },
    {
        type: 'carros',
        brandCode: '23',
        brandName: 'GM - Chevrolet',
        modelCode: 8949,
        modelName: 'ONIX HATCH LT 1.0 12V Flex 5p Mec.',
        pictureUrl: 'https://img.olx.com.br/images/18/183223822248138.jpg',
        yearCode: '2022-1',
        yearNome: '2022 Gasolina'
    },
    {
        type: 'carros',
        brandCode: '26',
        brandName: 'Hyundai',
        modelCode: 8855,
        modelName: 'HB20 Vision 1.0 Flex 12V Mec.',
        pictureUrl: 'https://quatrorodas.abril.com.br/wp-content/uploads/2021/03/Hyundai-HB20-Sense-2022-1.jpg?quality=70&strip=info',
        yearCode: '2022-1',
        yearNome: '2022 Gasolina'
    }
];

// Helpers for autocomplete and matching
const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\uFE0E\uFE0F]/g, '');

function debounce(fn, wait = 200) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

const autocompleteRegistry = {};

function registerAutocomplete(select) {
    if (!select || !select.id) return;
    const selectId = select.id;
    if (autocompleteRegistry[selectId]) return autocompleteRegistry[selectId];

    // Build DOM: wrapper -> input + select (hidden) + list
    const wrapper = document.createElement('div');
    wrapper.className = 'autocomplete-wrapper';

    const input = document.createElement('input');
    input.type = 'search';
    input.className = 'autocomplete-input';
    input.placeholder = select.options[0]?.textContent || '';
    input.setAttribute('aria-controls', `${selectId}-list`);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');

    const list = document.createElement('ul');
    list.id = `${selectId}-list`;
    list.className = 'autocomplete-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;

    // Insert wrapper before select and move select inside
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(input);
    wrapper.appendChild(select);
    wrapper.appendChild(list);

    // hide native select visually but keep it in DOM
    select.style.position = 'absolute';
    select.style.left = '-9999px';

    const state = { select, input, list, options: [], active: -1 };
    autocompleteRegistry[selectId] = state;

    function buildOptions() {
        state.options = Array.from(select.options || [])
            .filter((o) => o.value !== '')
            .map((o) => ({ value: o.value, text: o.textContent }));
    }

    function showList(items) {
        list.innerHTML = items.map((it, i) => `<li role="option" data-value="${it.value}" class="autocomplete-item" data-index="${i}">${it.text}</li>`).join('');
        state.active = -1;
        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
    }

    function hideList() {
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        state.active = -1;
    }

    function filterAndShow(query) {
        const q = normalize(query || '');
        const candidates = state.options.filter((opt) => normalize(opt.text).includes(q));
        if (candidates.length === 0) {
            list.innerHTML = '<li class="autocomplete-no-results">Nenhum resultado</li>';
            list.hidden = false;
            input.setAttribute('aria-expanded', 'true');
            return;
        }
        showList(candidates.slice(0, 10));
    }

    // event handlers
    const debouncedFilter = debounce((val) => filterAndShow(val), 180);

    input.addEventListener('input', (e) => {
        const v = e.target.value;
        if (!v) {
            // show top items
            showList(state.options.slice(0, 10));
            return;
        }
        debouncedFilter(v);
    });

    input.addEventListener('focus', () => {
        if (!state.options.length) buildOptions();
        showList(state.options.slice(0, 10));
    });

    input.addEventListener('blur', () => setTimeout(hideList, 120));

    list.addEventListener('click', (ev) => {
        const li = ev.target.closest('.autocomplete-item');
        if (!li) return;
        const value = li.dataset.value;
        const text = li.textContent;
        select.value = value;
        input.value = text;
        hideList();
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    input.addEventListener('keydown', (ev) => {
        const items = Array.from(list.querySelectorAll('.autocomplete-item'));
        if (ev.key === 'ArrowDown') {
            ev.preventDefault();
            state.active = Math.min(state.active + 1, items.length - 1);
            items.forEach((it, i) => it.classList.toggle('active', i === state.active));
            items[state.active]?.scrollIntoView({ block: 'nearest' });
        } else if (ev.key === 'ArrowUp') {
            ev.preventDefault();
            state.active = Math.max(state.active - 1, 0);
            items.forEach((it, i) => it.classList.toggle('active', i === state.active));
            items[state.active]?.scrollIntoView({ block: 'nearest' });
        } else if (ev.key === 'Enter') {
            ev.preventDefault();
            const active = items[state.active];
            if (active) active.click();
        } else if (ev.key === 'Escape') {
            hideList();
        }
    });

    // initial populate
    buildOptions();

    return state;
}

function updateAutocompleteOptions(selectId) {
    const reg = autocompleteRegistry[selectId];
    if (!reg) return;
    reg.options = Array.from(reg.select.options || [])
        .filter((o) => o.value !== '')
        .map((o) => ({ value: o.value, text: o.textContent }));
}

function clearSelections() {
    const ids = ['brand', 'model', 'year'];
    ids.forEach((id) => {
        const sel = document.getElementById(id);
        if (sel) { sel.value = ''; sel.dispatchEvent(new Event('change', { bubbles: true })); }
        const reg = autocompleteRegistry[id];
        if (reg) reg.input.value = '';
        if (reg) reg.list.hidden = true;
    });
    const container = document.querySelector('.vehicle-field-result');
    if (container) container.innerHTML = `<div class="vehicle"><div class="empty-field"><img height="100%" src="./img/undraw_no_data.svg" alt="Sem dados"><p class="subtitle">Acima, selecione modelos para buscar preços atualizados</p></div></div>`;
}

class FipeExplorer {
    constructor(favorites) {
        this.favorites = favorites;
    }

    getWelcomeMessage() {
        const currentHour = new Date().getHours();
        if (currentHour < 12) return 'Bom dia!';
        if (currentHour < 18) return 'Boa tarde!';
        return 'Boa noite!';
    }

    async fetchJson(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error('Fetch error:', err);
            return null;
        }
    }

    async loadFavorite(favorite) {
        const url = `https://parallelum.com.br/fipe/api/v1/carros/marcas/${favorite.brandCode}/modelos/${favorite.modelCode}/anos/${favorite.yearCode}`;
        const data = await this.fetchJson(url);
        if (!data) {
            return {
                Modelo: favorite.modelName,
                AnoModelo: favorite.yearNome || '',
                Combustivel: '',
                MesReferencia: '',
                Valor: '—',
                pictureUrl: favorite.pictureUrl
            };
        }
        return { ...data, pictureUrl: favorite.pictureUrl };
    }

    async getFavoriteData() {
        const promises = this.favorites.map((f) => this.loadFavorite(f));
        try {
            const results = await Promise.all(promises);
            return results.filter(Boolean);
        } catch (err) {
            console.error('Error loading favorites', err);
            return [];
        }
    }

    async renderFavorites() {
        const container = document.querySelector('.vehicle-fields');
        if (!container) return;
        container.innerHTML = `<div class="loading">Carregando favoritos…</div>`;
        const items = await this.getFavoriteData();
        if (!items || items.length === 0) {
            container.innerHTML = `<div class="vehicle"><div class="empty-field"><img height="100%" src="./img/undraw_no_data.svg" alt="Sem dados"><p class="subtitle">Nenhum favorito encontrado</p></div></div>`;
            return;
        }
        container.innerHTML = items.map((item) => this.createCard(item)).join('');
    }

    createCard(item) {
        const bg = item.pictureUrl ? `background-image: url(${item.pictureUrl});` : 'background: linear-gradient(135deg, #e2e8f0, #cbd5e1);';
        const price = item.Valor || '—';
        return `
            <div class="vehicle">
                <div class="vehicle-content" style="${bg}" role="article" aria-label="${item.Modelo}">
                    <h4>${item.Modelo}</h4>
                    <p>${item.AnoModelo} • ${item.Combustivel}</p>
                    <p class="price">${price}</p>
                </div>
            </div>
        `;
    }

    async loadBrands() {
        const data = await this.fetchJson('https://parallelum.com.br/fipe/api/v1/carros/marcas');
        return data || [];
    }

    async loadModel(brandCode) {
        if (!brandCode) return [];
        const data = await this.fetchJson(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos`);
        return data?.modelos || [];
    }

    async loadYear({ brandCode, modelCode }) {
        if (!brandCode || !modelCode) return [];
        const data = await this.fetchJson(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos`);
        return data || [];
    }

    async loadFipePrice({ brandCode, modelCode, yearCode }) {
        if (!brandCode || !modelCode || !yearCode) return null;
        const data = await this.fetchJson(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);
        return data || null;
    }
}

class Render {
    renderWelcomeMessage(text) {
        const span = document.querySelector('.bold-title');
        if (span) span.textContent = text;
    }

    renderBrands(brands) {
        const select = document.getElementById('brand');
        if (!select) return;
        const options = ['<option value="">Marca</option>', ...brands.map((b) => `<option value="${b.codigo}">${b.nome}</option>`)];
        select.innerHTML = options.join('');
        try { updateAutocompleteOptions('brand'); } catch(e) {}
    }

    renderModels(models) {
        const select = document.getElementById('model');
        if (!select) return;
        const options = ['<option value="">Modelo</option>', ...models.map((m) => `<option value="${m.codigo}">${m.nome}</option>`)];
        select.innerHTML = options.join('');
        try { updateAutocompleteOptions('model'); } catch(e) {}
    }

    renderYears(years) {
        const select = document.getElementById('year');
        if (!select) return;
        const options = ['<option value="">Ano</option>', ...years.map((y) => `<option value="${y.codigo}">${y.nome}</option>`)];
        select.innerHTML = options.join('');
        try { updateAutocompleteOptions('year'); } catch(e) {}
    }

    renderPrice(vehiclePrice) {
        const container = document.querySelector('.vehicle-field-result');
        if (!container) return;
        if (!vehiclePrice) {
            container.innerHTML = `<p class="subtitle">Informação não disponível</p>`;
            return;
        }
        const bgStyle = vehiclePrice.pictureUrl ? `background-image: url(${vehiclePrice.pictureUrl}); background-size: cover; background-position: center;` : '';
        container.innerHTML = `
            <div class="vehicle">
                <div class="vehicle-content" style="${bgStyle}">
                    <h4>${vehiclePrice.Modelo}</h4>
                    <p>${vehiclePrice.AnoModelo} • ${vehiclePrice.Combustivel}</p>
                    <p class="price">${vehiclePrice.Valor}</p>
                    <button class="clear-result">Limpar</button>
                </div>
            </div>
        `;

        const clearBtn = container.querySelector('.clear-result');
        if (clearBtn) clearBtn.addEventListener('click', () => clearSelections());
    }
}

const fipe = new FipeExplorer(mockFavorites);
const render = new Render();

let brandCode = '';
let modelCode = '';
let yearCode = '';

const brandChoice = document.getElementById('brand');
const modelChoice = document.getElementById('model');
const yearChoice = document.getElementById('year');

(async function init() {
    render.renderWelcomeMessage(fipe.getWelcomeMessage());
    // register autocompletes for selects (will reuse select options)
    registerAutocomplete(document.getElementById('brand'));
    registerAutocomplete(document.getElementById('model'));
    registerAutocomplete(document.getElementById('year'));

    await fipe.renderFavorites();
    const brands = await fipe.loadBrands();
    render.renderBrands(brands);
})();

if (brandChoice) {
    brandChoice.addEventListener('change', async (e) => {
        brandCode = e.target.value;
        render.renderModels([]);
        render.renderYears([]);
        if (!brandCode) return;
        const models = await fipe.loadModel(brandCode);
        render.renderModels(models);
    });
}

if (modelChoice) {
    modelChoice.addEventListener('change', async (e) => {
        modelCode = e.target.value;
        render.renderYears([]);
        if (!modelCode) return;
        const years = await fipe.loadYear({ brandCode, modelCode });
        render.renderYears(years);
    });
}

if (yearChoice) {
    yearChoice.addEventListener('change', async (e) => {
        yearCode = e.target.value;
        if (!yearCode) return;
        const price = await fipe.loadFipePrice({ brandCode, modelCode, yearCode });
        render.renderPrice(price);
    });
}