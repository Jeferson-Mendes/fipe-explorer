
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

const loadFavorite = async (favorite) => {
    return fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${favorite.brandCode}/modelos/${favorite.modelCode}/anos/${favorite.yearCode}`)
    .then(res => res.json())
    .then(data => {
        return data
    }).catch(err => {
        console.error('Error: ', err)
    })
}

const callFetchFavoriteData = async () => {
        const dataArray = []
        const fetchPromises = mockFavorites.map(favorite => loadFavorite(favorite));

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

const renderFavorites = async () => {
    const vehicleFields = document.querySelector('.vehicle-fields')
    const data = await callFetchFavoriteData()

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

renderFavorites()