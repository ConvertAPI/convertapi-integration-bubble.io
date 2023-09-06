async function(properties, context) {
    let body = {
        Parameters: [
            {
                Name: 'StoreFile',
                Value: true
            }
        ]
    }
    
    let fileParam = {}
    
    if (properties.files) {
        fileParam.Name = 'Files' 
        fileParam.FileValues = []

        let files = await properties.files.get(0, 1000000)
        
        files.forEach(f => {
            if (!f.startsWith('http')) {
                f = 'https:' + f
            }
            fileParam.FileValues.push({ Url: f })
        })
    } else {
        let file = properties.file
        if (!file.startsWith('http')) {
            file = 'https:' + file
        }
        fileParam.Name = 'File' 
        fileParam.FileValue = { Url: file }
    }
    

    body.Parameters.push(fileParam)

   	properties.parameters.forEach(p => body.Parameters.push(
        {
            Name: p.key,
            Value: p.value
        }
    ))

    const secret = context.keys['ConvertAPI Secret']
    const converterPath = properties.converter ? `/converter/${properties.converter}` : ''

    const response = await fetch(`https://v2.convertapi.com/convert/${properties.src}/to/${properties.dst}${converterPath}?secret=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(r => r.ok ? r.json() : r.text().then( e => {throw new Error(e)}) )
    .then(o => {
        let files = []
        o.Files.forEach(f => files.push(f.Url))
        return files
    })

    return { files: response }
}
