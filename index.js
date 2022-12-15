
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');
const pathToFile = path.resolve('./data.json');

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get('/api/active-resources', (req, res) => {
    const resources = getResources();
    const activeResources = resources.find(resource => resource.status === 'active');
    res.send(activeResources);
})
app.get('/api/resources', (req, res) => {
    const resources = getResources();
    res.send(resources);
})

app.patch('/api/resources/:id', (req, res) => {
    const resources = getResources();
    const { id } = req.params;
    const index = resources.findIndex(resource => resource.id === id);

    const activeResource = resources.find(resource => resource.status === "active");
    
    if (resources[index] === "complete") {
        return res.status(422).send("Cannot activate complete resource");
    }
    resources[index] = req.body;

    if (req.body.status === "active") {
        if (activeResource) {
            return res.status(422).send('There is resource is already active');
        }
        resources[index].status = "active";
        resources[index ].activationTime = new Date();
    }

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send('Cannot store the data');
        }
        
        return res.send('Data has been updated');
    })
})

app.get('/api/resources/:id', (req, res) => {
    const resources = getResources();
    const { id } = req.params;
    const resource = resources.find(resource => resource.id === id);
    res.send(resource);
})


app.post('/api/resources', (req, res) => {
    const resources = getResources();
    const resource = req.body;

    resource.createdAt = new Date();
    resource.status = 'inactive';
    resource.id = Date.now().toString();

    resources.unshift(resource);

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if (error) {
            return res.status(422).send('Cannot store the data');
        }
        
        return res.send('Data has been received');
    })

    
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});