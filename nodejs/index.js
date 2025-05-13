const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'notesdb';
let db;
let notesCollection;

async function connectDB() {
    try {
        const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Successfully connected to MongoDB');
        db = client.db(dbName);
        notesCollection = db.collection('notes');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

connectDB();

app.get('/', (req, res) => {
    res.send('Notes API is running - v2!')
});

app.post('/notes', async (req, res) => {
    if (!notesCollection) {
        return res.status(500).send({ error: 'Database not initialized' });
    }
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).send({ error: 'Note text is required' });
        }
        const newNote = { text, createdAt: new Date() };
        const result = await notesCollection.insertOne(newNote);
        const savedNote = await notesCollection.findOne({ _id: result.insertedId });
        res.status(201).send(savedNote);
    } catch (err) {
        console.error('Error creating note:', err);
        res.status(500).send({ error: 'Failed to create note', details: err.message });
    }
});

app.get('/notes', async (req, res) => {
    if (!notesCollection) {
        return res.status(500).send({ error: 'Database not initialized' });
    }
    try {
        const notes = await notesCollection.find({}).toArray();
        res.send(notes);
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).send({ error: 'Failed to fetch notes', details: err.message });
    }
});

app.get('/notes/:id', async (req, res) => {
    if (!notesCollection) {
        return res.status(500).send({ error: 'Database not initialized' });
    }
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid note ID format' });
        }
        const note = await notesCollection.findOne({ _id: new ObjectId(id) });
        if (!note) {
            return res.status(404).send({ error: 'Note not found' });
        }
        res.send(note);
    } catch (err) {
        console.error('Error fetching note by ID:', err);
        res.status(500).send({ error: 'Failed to fetch note', details: err.message });
    }
});

app.put('/notes/:id', async (req, res) => {
    if (!notesCollection) {
        return res.status(500).send({ error: 'Database not initialized' });
    }
    try {
        const { id } = req.params;
        const { text } = req.body;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid note ID format' });
        }
        if (!text) {
            return res.status(400).send({ error: 'Note text is required for update' });
        }
        const result = await notesCollection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { text, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (!result) {
            return res.status(404).send({ error: 'Note not found or not updated' });
        }
        res.send(result);
    } catch (err) {
        console.error('Error updating note:', err);
        res.status(500).send({ error: 'Failed to update note', details: err.message });
    }
});

app.delete('/notes/:id', async (req, res) => {
    if (!notesCollection) {
        return res.status(500).send({ error: 'Database not initialized' });
    }
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid note ID format' });
        }
        const result = await notesCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'Note not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting note:', err);
        res.status(500).send({ error: 'Failed to delete note', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
