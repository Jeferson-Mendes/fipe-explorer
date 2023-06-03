
const mockFavorites = [
    {
        type: 'carros',
        brandCode: '23',
        brandName: 'GM - Chevrolet',
        modelCode: 8949,
        modelName: "ONIX HATCH LT 1.0 12V Flex 5p Mec.",
        yearCode: '2022-1',
        yearNome: "2022 Gasolina"
    },
    {
        type: 'carros',
        brandCode: '26',
        brandName: 'Hyundai',
        modelCode: 8855,
        modelName: "HB20 Vision 1.0 Flex 12V Mec.",
        yearCode: '2022-1',
        yearNome: "2022 Gasolina"
    }
]

class FipeExplorer {
    constructor(favorites){
        this.favorites = favorites
    }
    
    getWelcomeMessage() {
        const currentHour = new Date().getHours();
        let welcomeMessage;
      
        if (currentHour < 12) {
          welcomeMessage = 'Bom dia!';
        } else if (currentHour < 18) {
          welcomeMessage = 'Boa tarde!';
        } else {
          welcomeMessage = 'Boa noite!';
        }
      
        return welcomeMessage;
      }

    async loadFavorite(favorite) {
        return fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${favorite.brandCode}/modelos/${favorite.modelCode}/anos/${favorite.yearCode}`)
        .then(res => res.json())
        .then(data => {
            return data
        }).catch(err => {
            console.error('Error: ', err)
        })
    }

    async callFetchFavoriteData() {
            const dataArray = []
            const fetchPromises = this.favorites.map(favorite => this.loadFavorite(favorite));
    
            return await Promise.all(fetchPromises)
            .then(results => {
                results.forEach(data => {
                    dataArray.push(data)
                })
                return dataArray;
            })
            .catch(error => {
                console.error('Error:', error);
              });
    }
    
    async renderFavorites() {
        const vehicleFields = document.querySelector('.vehicle-fields')
        const data = await this.callFetchFavoriteData()
    
        const child = data.map(item => `
        <div class="vehicle">
            <div class="vehicle-content">
                <h4>${item.Modelo}</h4>
                <p>${item.AnoModelo}</p>
                <p>${item.Combustivel}</p>
                <p>${item.MesReferencia}</p>
                <p>${item.Valor}</p>
            </div>
        </div>
        `)
        
        vehicleFields.innerHTML = child.join(' ')
    }

    async loadBrands() {
       return fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas`)
       .then(response => response.json())
       .then(data => data)
    }

    async loadModel(brandCode) {
        return fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos`)
       .then(response => response.json())
       .then(data => data.modelos)
    }

    async loadYear({brandCode, modelCode}) {
        return fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos`)
       .then(response => response.json())
       .then(data => data)
    }

    async loadFipePrice({brandCode, modelCode, yearCode}) {
        return fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`)
       .then(response => response.json())
       .then(data => data)
    }
}

class Render {
    async renderWelcomeMessage(text) {
        const span = document.querySelector('.bold-title')
        span.textContent = text
    }

    async renderBrands(brands) {
        const carPropertiesSelects = document.querySelectorAll('.select-field select')[0]
        
        const child = brands.map(item => `<option value="${item.codigo}">${item.nome}</option>`)
        carPropertiesSelects.innerHTML = child.join(' ')
    }

    async renderModels(models) {
        const carPropertiesSelects = document.querySelectorAll('.select-field select')[1]
        
        const child = models.map(item => `<option value="${item.codigo}">${item.nome}</option>`)
        carPropertiesSelects.innerHTML = child.join(' ')
    }

    async renderYears(years) {
        const carPropertiesSelects = document.querySelectorAll('.select-field select')[2]
        
        const child = years.map(item => `<option value="${item.codigo}">${item.nome}</option>`)
        carPropertiesSelects.innerHTML = child.join(' ')
    }

    async renderPrice(vehiclePrice) {
        const vehicleFields = document.querySelector('.vehicle-field-result')
        
        vehicleFields.removeChild(vehicleFields.firstChild)
        
        vehicleFields.innerHTML = `
        <div class="vehicle">
            <div class="vehicle-content">
                <h4>${vehiclePrice.Modelo}</h4>
                <p>${vehiclePrice.AnoModelo}</p>
                <p>${vehiclePrice.Combustivel}</p>
                <p>${vehiclePrice.MesReferencia}</p>
                <p>${vehiclePrice.Valor}</p>
            </div>
        </div>
        `
    }
}

const fipe = new FipeExplorer(mockFavorites)
const render = new Render()

let brandCode = 0
let modelCode = 0
let yearCode = 0

const brandChoice = document.querySelectorAll('.select-field select')[0]
const modelChoice = document.querySelectorAll('.select-field select')[1]
const yearChoice = document.querySelectorAll('.select-field select')[2]

render.renderWelcomeMessage(fipe.getWelcomeMessage())
fipe.renderFavorites()
fipe.loadBrands().then(result => render.renderBrands(result))

brandChoice.addEventListener('change', (event) => {
    brandCode = event.target.value
    
    fipe.loadModel(brandCode).then(result => render.renderModels(result))
})

modelChoice.addEventListener('change', (event) => {
    modelCode = event.target.value
    
    fipe.loadYear({ brandCode, modelCode }).then(result => render.renderYears(result))
})

yearChoice.addEventListener('change', (event) => {
    yearCode = event.target.value
    
    fipe.loadFipePrice({ brandCode, modelCode, yearCode }).then(result => render.renderPrice(result))
})